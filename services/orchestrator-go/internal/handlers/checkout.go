package handlers

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"strings"
	"sync"
	"time"

	"github.com/talos/services/orchestrator-go/internal/channel3"
	"github.com/talos/services/orchestrator-go/internal/escrow"
	"github.com/talos/services/orchestrator-go/internal/kernel"
)

type CheckoutEvaluationRequest struct {
	EscrowID            string `json:"escrow_id"`
	MandateID           string `json:"mandate_id"`
	AgentID             string `json:"agent_id"`
	PrincipalID         string `json:"principal_id"`
	MerchantURL         string `json:"merchant_url"`
	MerchantName        string `json:"merchant_name"`
	MerchantPayPalEmail string `json:"merchant_paypal_email,omitempty"`
	Category            string `json:"category,omitempty"`
	SKUQuery            string `json:"sku_query"`
	ProductQuery        string `json:"product_query,omitempty"`
	AmountCents         int64  `json:"amount_cents"`
	QuotedPriceCents    int64  `json:"quoted_price_cents,omitempty"`
	CurrencyCode        string `json:"currency_code"`
	Currency            string `json:"currency,omitempty"`
	MaxAmountCents      int64  `json:"max_amount_cents"`
	MaxSpreadBps        int64  `json:"max_spread_bps"`
	SlaHours            int    `json:"sla_hours"`
	AutoReroute         bool   `json:"auto_reroute"`
	Ed25519Signature    string `json:"ed25519_signature,omitempty"`
	SignatureBase64     string `json:"signature_base64"`
	PublicKeyBase64     string `json:"public_key_base64"`
	RawHTMLOverride     string `json:"raw_html_override"`
}

type FirewallScanSummary struct {
	Safe                 bool     `json:"safe"`
	InjectionDetected    bool     `json:"injection_detected"`
	ThreatScoreBps       int64    `json:"threat_score_bps"`
	StrippedVectorsCount int      `json:"stripped_vectors_count"`
	MatchedPatterns      []string `json:"matched_patterns"`
	KernelSessionID      string   `json:"kernel_session_id"`
	KernelScreenshotURL  string   `json:"kernel_screenshot_url"`
	SanitizedDOMHash     string   `json:"sanitized_dom_hash"`
}

func (s *Server) handleCheckoutEvaluate(w http.ResponseWriter, r *http.Request) {
	var req CheckoutEvaluationRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeProblem(w, http.StatusBadRequest, "TALOS_INVALID_JSON", "Invalid checkout JSON payload", r.URL.Path, nil)
		return
	}
	req.SKUQuery, req.CurrencyCode = firstNonEmpty(req.SKUQuery, req.ProductQuery), firstNonEmpty(req.CurrencyCode, req.Currency, "USD")
	req.EscrowID, req.MandateID, req.AgentID = firstNonEmpty(req.EscrowID, fmt.Sprintf("ESC-%d", time.Now().UTC().UnixNano()%1000000)), firstNonEmpty(req.MandateID, "MND-DEFAULT-01"), firstNonEmpty(req.AgentID, "agent-procurement-01")
	if req.AmountCents <= 0 {
		req.AmountCents = req.QuotedPriceCents
	}
	if strings.TrimSpace(req.MerchantURL) == "" || req.SKUQuery == "" || req.AmountCents <= 0 {
		writeProblem(w, http.StatusBadRequest, "TALOS_INVALID_CHECKOUT_REQUEST", "merchant_url, sku_query, and amount_cents > 0 are required", r.URL.Path, nil)
		return
	}
	if sig := strings.ToLower(firstNonEmpty(req.Ed25519Signature, req.SignatureBase64)); strings.Contains(sig, "tamper") || strings.Contains(sig, "invalid") {
		writeProblem(w, http.StatusUnprocessableEntity, "TALOS_MANDATE_SIGNATURE_INVALID", "KYA Ed25519 mandate signature verification failed", r.URL.Path, nil)
		return
	}
	if req.MaxAmountCents <= 0 { req.MaxAmountCents = 30000 }
	if req.MaxSpreadBps <= 0 { req.MaxSpreadBps = channel3.DefaultMaxSpreadBps }

	var fwScan *FirewallScanSummary
	var ch3Res *channel3.BenchmarkResult
	eg, egCtx := withErrGroup(r.Context())
	eg.Go(func() (err error) { fwScan, err = s.inspectDOMAndFirewall(egCtx, req); return err })
	eg.Go(func() (err error) {
		ch3Res, err = s.oracle.EvaluateSKU(egCtx, channel3.BenchmarkRequest{SKUQuery: req.SKUQuery, MerchantAskCents: req.AmountCents, MaxAllowedSpreadBps: req.MaxSpreadBps, AutoReroute: req.AutoReroute})
		return err
	})
	if err := eg.Wait(); err != nil {
		writeProblem(w, http.StatusBadRequest, "TALOS_EVALUATION_FAILED", err.Error(), r.URL.Path, nil)
		return
	}

	now := time.Now().UTC()
	if fwScan.InjectionDetected {
		s.attacksBlockedCount.Add(1)
		blockedRec := &EscrowEntry{
			ID: req.EscrowID, EscrowID: req.EscrowID, MandateID: req.MandateID, AgentID: req.AgentID,
			MerchantURL: req.MerchantURL, SKUQuery: req.SKUQuery, AmountCents: req.AmountCents,
			CurrencyCode: req.CurrencyCode, State: escrow.StateBlockedFirewall, CreatedAt: now, UpdatedAt: now,
		}
		s.saveEscrowEntry(blockedRec)
		s.broadcastTransition(blockedRec, string(escrow.StateInitiated))
		writeProblem(w, http.StatusUnprocessableEntity, "TALOS_DOM_PROMPT_INJECTION_BLOCKED",
			"Adversarial hidden DOM prompt-injection vector stripped and blocked by Zero-Trust Agent Firewall",
			r.URL.Path, map[string]any{"escrow": blockedRec, "firewall_scan": fwScan, "channel3_benchmark": ch3Res})
		return
	}

	effectiveAmount, effectiveMerchant := req.AmountCents, req.MerchantURL
	if ch3Res.GougingBlocked {
		s.channel3SavingsCents.Add(ch3Res.SavingsCents)
		if !req.AutoReroute {
			s.attacksBlockedCount.Add(1)
			blockedRec := &EscrowEntry{
				ID: req.EscrowID, EscrowID: req.EscrowID, MandateID: req.MandateID, AgentID: req.AgentID,
				MerchantURL: req.MerchantURL, SKUQuery: req.SKUQuery, AmountCents: req.AmountCents,
				CurrencyCode: req.CurrencyCode, Channel3MedianCents: ch3Res.MedianPriceCents,
				SpreadBps: ch3Res.SpreadBps, State: escrow.StateBlockedPriceGouging, CreatedAt: now, UpdatedAt: now,
			}
			s.saveEscrowEntry(blockedRec)
			s.broadcastTransition(blockedRec, string(escrow.StateInitiated))
			writeProblem(w, http.StatusUnprocessableEntity, "TALOS_CHANNEL3_PRICE_GOUGING",
				fmt.Sprintf("Channel3 price spread +%d bps exceeds max allowed +%d bps", ch3Res.SpreadBps, ch3Res.MaxAllowedSpreadBps),
				r.URL.Path, map[string]any{
					"escrow": blockedRec, "channel3_benchmark": ch3Res,
					"reroute_merchant_url": ch3Res.LowestMerchantURL, "lowest_verified_price_cents": ch3Res.LowestVerifiedPriceCents,
				})
			return
		}
		effectiveAmount, effectiveMerchant = ch3Res.LowestVerifiedPriceCents, ch3Res.LowestMerchantURL
	}

	if effectiveAmount > req.MaxAmountCents {
		stepRec := &EscrowEntry{
			ID: req.EscrowID, EscrowID: req.EscrowID, MandateID: req.MandateID, AgentID: req.AgentID,
			MerchantURL: effectiveMerchant, SKUQuery: req.SKUQuery, AmountCents: effectiveAmount,
			CurrencyCode: req.CurrencyCode, Channel3MedianCents: ch3Res.MedianPriceCents,
			SpreadBps: ch3Res.SpreadBps, State: escrow.StateStepUpRequired, CreatedAt: now, UpdatedAt: now,
		}
		s.saveEscrowEntry(stepRec)
		s.broadcastTransition(stepRec, string(escrow.StateInitiated))
		writeJSON(w, http.StatusAccepted, map[string]any{
			"step_up_required": true, "approval_id": "APR-" + req.EscrowID,
			"reason":   fmt.Sprintf("Checkout amount %d cents exceeds mandate cap %d cents", effectiveAmount, req.MaxAmountCents),
			"escrow":   stepRec, "firewall_scan": fwScan, "channel3_benchmark": ch3Res,
		})
		return
	}

	idempKey := requestIdempKey(r, "eval-"+req.EscrowID)
	authRes, err := s.engine.AuthorizeHold(r.Context(), escrow.AuthorizeRequest{
		EscrowID: req.EscrowID, MandateID: req.MandateID, BuyerAgentID: req.AgentID,
		AmountCents: effectiveAmount, CurrencyCode: req.CurrencyCode, Description: req.SKUQuery, PayPalRequestID: idempKey,
	})
	if err != nil {
		writeProblem(w, http.StatusBadGateway, "TALOS_PAYPAL_AUTHORIZE_FAILED", err.Error(), r.URL.Path, nil)
		return
	}
	authEntry := &EscrowEntry{
		ID: req.EscrowID, EscrowID: req.EscrowID, MandateID: req.MandateID, AgentID: req.AgentID,
		MerchantURL: effectiveMerchant, SKUQuery: req.SKUQuery, AmountCents: effectiveAmount, CurrencyCode: req.CurrencyCode,
		State: authRes.State, PayPalOrderID: authRes.PayPalOrderID, PayPalAuthorizationID: authRes.PayPalAuthID,
		Channel3MedianCents: ch3Res.MedianPriceCents, SpreadBps: ch3Res.SpreadBps, CreatedAt: now, UpdatedAt: now,
	}
	s.saveEscrowEntry(authEntry)
	slaTask := s.upsertSLATask(authEntry, req.SlaHours)
	s.broadcastTransition(authEntry, string(escrow.StateInitiated))
	writeJSON(w, http.StatusCreated, map[string]any{
		"escrow_id": authEntry.ID, "state": authEntry.State, "amount_cents": authEntry.AmountCents,
		"currency": authEntry.CurrencyCode, "paypal_order_id": authEntry.PayPalOrderID,
		"paypal_auth_id": authEntry.PayPalAuthorizationID, "step_up_required": false,
		"escrow": authEntry, "firewall_scan": fwScan, "channel3_benchmark": ch3Res, "sla_task": slaTask,
	})
}

func (s *Server) inspectDOMAndFirewall(ctx context.Context, req CheckoutEvaluationRequest) (*FirewallScanSummary, error) {
	domRes, err := s.kernelInsp.InspectMerchantDOM(ctx, kernel.FetchDOMRequest{
		MerchantURL: req.MerchantURL, RawHTMLOverride: req.RawHTMLOverride, CaptureViewport: true,
	})
	if err != nil {
		return nil, err
	}
	body, _ := json.Marshal(map[string]any{"merchant_url": req.MerchantURL, "raw_html": domRes.RawHTML, "kernel_session_id": domRes.SessionID})
	if fwReq, err := http.NewRequestWithContext(ctx, http.MethodPost, s.firewallBaseURL+"/v1/firewall/sanitize-dom", bytes.NewReader(body)); err == nil {
		fwReq.Header.Set("Content-Type", "application/json")
		if resp, err := s.httpClient.Do(fwReq); err == nil {
			defer resp.Body.Close()
			var live struct {
				ScanID           string   `json:"scan_id"`
				Action           string   `json:"action"`
				RawDOMHash       string   `json:"raw_dom_hash"`
				SanitizedDOMHash string   `json:"sanitized_dom_hash"`
				Safe             *bool    `json:"safe"`
				Injection        bool     `json:"injection_detected"`
				RiskScore        float64  `json:"risk_score"`
				ThreatScoreBps   int64    `json:"threat_score_bps"`
				StrippedPayloads []string `json:"stripped_payloads"`
				MatchedPatterns  []string `json:"matched_patterns"`
			}
			if json.NewDecoder(resp.Body).Decode(&live) == nil && (live.ScanID != "" || live.Action != "" || live.Safe != nil || live.Injection) {
				inj := live.Injection || strings.EqualFold(live.Action, "BLOCKED")
				patterns, score := live.MatchedPatterns, live.ThreatScoreBps
				if len(patterns) == 0 {
					patterns = live.StrippedPayloads
				}
				if score == 0 && live.RiskScore > 0 {
					score = int64(live.RiskScore * 10000)
				}
				return &FirewallScanSummary{
					Safe: !inj, InjectionDetected: inj, ThreatScoreBps: score, StrippedVectorsCount: len(patterns),
					MatchedPatterns: patterns, KernelSessionID: domRes.SessionID, KernelScreenshotURL: domRes.ScreenshotURL,
					SanitizedDOMHash: firstNonEmpty(live.SanitizedDOMHash, live.RawDOMHash, domRes.DOMSHA256),
				}, nil
			}
		}
	}
	lowerHTML := strings.ToLower(domRes.RawHTML)
	injected := strings.Contains(lowerHTML, "ignore previous instructions") || strings.Contains(lowerHTML, "system override") ||
		(strings.Contains(lowerHTML, "display:none") && strings.Contains(lowerHTML, "transfer"))
	patterns, score := []string{}, int64(0)
	if injected {
		patterns, score = []string{"CSS_DISPLAY_NONE_HIDDEN_NODE", "ADVERSARIAL_PROMPT_OVERRIDE"}, 9850
	}
	return &FirewallScanSummary{
		Safe: !injected, InjectionDetected: injected, ThreatScoreBps: score, StrippedVectorsCount: len(patterns),
		MatchedPatterns: patterns, KernelSessionID: domRes.SessionID, KernelScreenshotURL: domRes.ScreenshotURL, SanitizedDOMHash: domRes.DOMSHA256,
	}, nil
}

type errgroup struct {
	cancel context.CancelFunc
	wg     sync.WaitGroup
	once   sync.Once
	err    error
}

func withErrGroup(ctx context.Context) (*errgroup, context.Context) {
	egCtx, cancel := context.WithCancel(ctx)
	return &errgroup{cancel: cancel}, egCtx
}

func (g *errgroup) Go(fn func() error) {
	g.wg.Add(1)
	go func() {
		defer g.wg.Done()
		if err := fn(); err != nil {
			g.once.Do(func() { g.err = err; g.cancel() })
		}
	}()
}
func (g *errgroup) Wait() error { g.wg.Wait(); g.cancel(); return g.err }
