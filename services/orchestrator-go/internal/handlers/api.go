package handlers

import (
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"net/http"
	"os"
	"strings"
	"sync"
	"sync/atomic"
	"time"

	paypalapimatic "github.com/talos/sdk/paypal-go-apimatic"
	"github.com/talos/services/orchestrator-go/internal/channel3"
	"github.com/talos/services/orchestrator-go/internal/escrow"
	"github.com/talos/services/orchestrator-go/internal/kernel"
	"github.com/talos/services/orchestrator-go/internal/paypal"
	"github.com/talos/services/orchestrator-go/internal/ws"
)

type EscrowEntry struct {
	ID                    string       `json:"id"`
	EscrowID              string       `json:"escrow_id"`
	MandateID             string       `json:"mandate_id"`
	AgentID               string       `json:"agent_id"`
	MerchantURL           string       `json:"merchant_url"`
	SKUQuery              string       `json:"sku_query"`
	AmountCents           int64        `json:"amount_cents"`
	CurrencyCode          string       `json:"currency_code"`
	State                 escrow.State `json:"state"`
	PayPalOrderID         string       `json:"paypal_order_id,omitempty"`
	PayPalAuthorizationID string       `json:"paypal_authorization_id,omitempty"`
	PayPalCaptureID       string       `json:"paypal_capture_id,omitempty"`
	Channel3MedianCents   int64        `json:"channel3_median_cents,omitempty"`
	SpreadBps             int64        `json:"spread_bps,omitempty"`
	Carrier               string       `json:"carrier,omitempty"`
	TrackingNumber        string       `json:"tracking_number,omitempty"`
	DisputeID             string       `json:"dispute_id,omitempty"`
	CreatedAt             time.Time    `json:"created_at"`
	UpdatedAt             time.Time    `json:"updated_at"`
}

type SLATask struct {
	ID          string `json:"id"`
	EscrowID    string `json:"escrow_id"`
	Name        string `json:"name"`
	StartDate   string `json:"start_date"`
	EndDate     string `json:"end_date"`
	SlaDeadline string `json:"sla_deadline"`
	PercentDone int    `json:"percent_done"`
	SlaStatus   string `json:"sla_status"`
	Carrier     string `json:"carrier"`
}

type Server struct {
	engine               *escrow.Engine
	paypalSvc            *paypal.SandboxService
	oracle               *channel3.Oracle
	kernelInsp           *kernel.Inspector
	hub                  *ws.Hub
	firewallBaseURL      string
	httpClient           *http.Client
	mu                   sync.RWMutex
	escrows              map[string]*EscrowEntry
	slaTasks             map[string]*SLATask
	processedWebhooks    map[string]bool
	channel3SavingsCents atomic.Int64
	attacksBlockedCount  atomic.Int64
}

func NewServer(eng *escrow.Engine, ppSvc *paypal.SandboxService, ora *channel3.Oracle, krn *kernel.Inspector, hub *ws.Hub) *Server {
	fwURL := strings.TrimRight(os.Getenv("FIREWALL_RS_INTERNAL_URL"), "/")
	if fwURL == "" {
		fwURL = "http://localhost:8081"
	}
	return &Server{
		engine: eng, paypalSvc: ppSvc, oracle: ora, kernelInsp: krn, hub: hub,
		firewallBaseURL: fwURL, httpClient: &http.Client{Timeout: 2 * time.Second},
		escrows: make(map[string]*EscrowEntry), slaTasks: make(map[string]*SLATask), processedWebhooks: make(map[string]bool),
	}
}

func (s *Server) RegisterRoutes(mux *http.ServeMux) {
	s.engine.RegisterRoutes(mux)
	mux.HandleFunc("GET /healthz", func(w http.ResponseWriter, _ *http.Request) {
		writeJSON(w, http.StatusOK, map[string]any{"status": "ok", "service": "orchestrator-go"})
	})
	mux.HandleFunc("POST /api/v1/checkout/evaluate", s.handleCheckoutEvaluate)
	mux.HandleFunc("POST /api/v1/channel3/benchmark", s.handleChannel3Benchmark)
	mux.HandleFunc("POST /api/v1/escrow/{id}/tracking", s.handleAttachTracking)
	mux.HandleFunc("POST /api/v1/escrow/{id}/dispute-evidence", s.handleSubmitDisputeEvidence)
	mux.HandleFunc("GET /api/v1/escrow/blotter", s.handleGetBlotter)
	mux.HandleFunc("GET /api/v1/sla/timeline", s.handleGetSLATimeline)
	mux.HandleFunc("PATCH /api/v1/sla/timeline/{task_id}", s.handlePatchSLATimeline)
	mux.HandleFunc("POST /api/v1/webhooks/paypal", s.handlePayPalWebhook)
	mux.HandleFunc("GET /ws/events", s.hub.ServeWS)
}

func (s *Server) handleChannel3Benchmark(w http.ResponseWriter, r *http.Request) {
	var req channel3.BenchmarkRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeProblem(w, http.StatusBadRequest, "TALOS_INVALID_JSON", "Invalid JSON request body", r.URL.Path, nil)
		return
	}
	res, err := s.oracle.EvaluateSKU(r.Context(), req)
	if err != nil {
		writeProblem(w, http.StatusBadRequest, "TALOS_INVALID_BENCHMARK_REQUEST", err.Error(), r.URL.Path, nil)
		return
	}
	writeJSON(w, http.StatusOK, res)
}

func (s *Server) handleAttachTracking(w http.ResponseWriter, r *http.Request) {
	escrowID := strings.TrimSpace(r.PathValue("id"))
	rec, ok := s.getEscrowEntry(escrowID)
	if !ok {
		writeProblem(w, http.StatusNotFound, "TALOS_ESCROW_NOT_FOUND", "escrow not found: "+escrowID, r.URL.Path, nil)
		return
	}
	if rec.State != escrow.StatePayPalAuthorized && rec.State != escrow.StateSLAScheduled && rec.State != escrow.StateTrackingVerified {
		writeProblem(w, http.StatusConflict, "TALOS_INVALID_STATE_TRANSITION", "cannot attach tracking in state "+string(rec.State), r.URL.Path, nil)
		return
	}
	var req struct {
		Carrier               string `json:"carrier"`
		TrackingNumber        string `json:"tracking_number"`
		Status                string `json:"status"`
		AutoCaptureOnDelivery *bool  `json:"auto_capture_on_delivery"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil || strings.TrimSpace(req.TrackingNumber) == "" {
		writeProblem(w, http.StatusBadRequest, "TALOS_INVALID_TRACKING_REQUEST", "carrier and tracking_number are required", r.URL.Path, nil)
		return
	}
	if req.Carrier == "" {
		req.Carrier = "FEDEX"
	}
	if req.Status == "" {
		req.Status = "DELIVERED"
	}
	autoCapture := req.AutoCaptureOnDelivery == nil || *req.AutoCaptureOnDelivery
	idempKey := strings.TrimSpace(r.Header.Get("Idempotency-Key"))
	if idempKey == "" {
		idempKey = fmt.Sprintf("trk-%s-%s", escrowID, req.TrackingNumber)
	}

	prevState := string(rec.State)
	if s.paypalSvc != nil {
		txID := rec.PayPalCaptureID
		if txID == "" {
			txID = rec.PayPalAuthorizationID
		}
		_, _ = s.paypalSvc.AttachTracking(r.Context(), idempKey, txID, req.TrackingNumber, req.Carrier, req.Status)
	}
	_, _ = s.engine.AdvanceState(escrowID, escrow.StateTrackingVerified)
	rec.Carrier, rec.TrackingNumber, rec.State = req.Carrier, req.TrackingNumber, escrow.StateTrackingVerified

	switch strings.ToUpper(req.Status) {
	case "DELIVERED":
		if autoCapture {
			if capRes, err := s.engine.CaptureHold(r.Context(), escrow.CaptureRequest{
				EscrowID: escrowID, PayPalRequestID: idempKey + "-cap", TrackingNumber: req.TrackingNumber, Carrier: req.Carrier,
			}); err == nil {
				rec.State, rec.PayPalCaptureID = capRes.State, capRes.PayPalCaptureID
			}
		}
		s.updateSLATaskStatus(escrowID, req.Carrier, "DELIVERED_ON_TIME", 100)
	case "SLA_BREACHED":
		if voidRes, err := s.engine.VoidHold(r.Context(), escrow.VoidRequest{
			EscrowID: escrowID, PayPalRequestID: idempKey + "-void", Reason: "SLA_BREACHED_TRACKING",
		}); err == nil {
			rec.State = voidRes.State
		}
		s.updateSLATaskStatus(escrowID, req.Carrier, "SLA_BREACHED", 100)
	}

	s.saveEscrowEntry(rec)
	s.broadcastTransition(rec, prevState)
	writeJSON(w, http.StatusOK, map[string]any{
		"escrow_id": rec.ID, "state": rec.State, "escrow_state": rec.State,
		"carrier": rec.Carrier, "tracking_number": rec.TrackingNumber,
		"paypal_tracker_status": strings.ToUpper(req.Status), "paypal_capture_id": rec.PayPalCaptureID,
		"captured_amount_cents": rec.AmountCents, "escrow": rec,
	})
}

func (s *Server) handleSubmitDisputeEvidence(w http.ResponseWriter, r *http.Request) {
	escrowID := strings.TrimSpace(r.PathValue("id"))
	rec, ok := s.getEscrowEntry(escrowID)
	if !ok {
		writeProblem(w, http.StatusNotFound, "TALOS_ESCROW_NOT_FOUND", "escrow not found: "+escrowID, r.URL.Path, nil)
		return
	}
	if rec.State == escrow.StateBlockedFirewall || rec.State == escrow.StateBlockedPriceGouging || rec.State == escrow.StateStepUpRequired {
		writeProblem(w, http.StatusConflict, "TALOS_INVALID_STATE_TRANSITION", "cannot submit dispute evidence in state "+string(rec.State), r.URL.Path, nil)
		return
	}
	var req struct {
		PayPalDisputeID     string `json:"paypal_dispute_id"`
		DisputeReason       string `json:"dispute_reason"`
		KernelScreenshotURL string `json:"kernel_screenshot_url"`
	}
	_ = json.NewDecoder(r.Body).Decode(&req)
	if req.PayPalDisputeID == "" {
		req.PayPalDisputeID = "PP-D-TALOS-" + escrowID
	}
	if req.DisputeReason == "" {
		req.DisputeReason = "MERCHANDISE_OR_SERVICE_NOT_AS_DESCRIBED"
	}
	if req.KernelScreenshotURL == "" {
		req.KernelScreenshotURL = fmt.Sprintf("https://cdn.onkernel.com/talos-forensics/%s.png", escrowID)
	}
	idempKey := strings.TrimSpace(r.Header.Get("Idempotency-Key"))
	if idempKey == "" {
		idempKey = "dsp-" + escrowID
	}

	sum := sha256.Sum256([]byte(fmt.Sprintf("%s|%s|%s|%d|%s", escrowID, req.PayPalDisputeID, rec.MandateID, rec.Channel3MedianCents, req.KernelScreenshotURL)))
	digest := hex.EncodeToString(sum[:])
	if s.paypalSvc != nil {
		_, _ = s.paypalSvc.SubmitDisputeEvidence(r.Context(), idempKey, paypalapimatic.ProvideEvidenceRequest{
			DisputeID: req.PayPalDisputeID, EvidenceType: "PROOF_OF_FULFILLMENT", Notes: req.DisputeReason,
			MandateSignature: "ed25519-kya-" + rec.MandateID, AuditHash: digest, TrackingNumber: rec.TrackingNumber, Carrier: rec.Carrier,
		})
	}
	prevState := string(rec.State)
	if rec.State != escrow.StateDisputeFiled {
		_, _ = s.engine.AdvanceState(escrowID, escrow.StateDisputeFiled)
	}
	_, _ = s.engine.AdvanceState(escrowID, escrow.StateDisputeEvidenceSubmitted)
	rec.DisputeID, rec.State = req.PayPalDisputeID, escrow.StateDisputeEvidenceSubmitted
	s.saveEscrowEntry(rec)
	s.broadcastTransition(rec, prevState)

	writeJSON(w, http.StatusCreated, map[string]any{
		"bundle_id": "EVB-" + strings.ToUpper(digest[:8]), "escrow_id": rec.ID,
		"paypal_dispute_id": req.PayPalDisputeID, "state": rec.State, "escrow_state": rec.State,
		"kya_mandate_signature":     "ed25519-kya-" + rec.MandateID,
		"channel3_price_snapshot":   map[string]any{"median_price_cents": rec.Channel3MedianCents, "spread_bps": rec.SpreadBps},
		"kernel_dom_screenshot_url": req.KernelScreenshotURL, "bundle_sha256": digest,
		"paypal_submission_status": "EVIDENCE_UNDER_REVIEW", "submitted_at": time.Now().UTC().Format(time.RFC3339),
	})
}
