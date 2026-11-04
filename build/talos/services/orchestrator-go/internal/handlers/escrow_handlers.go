package handlers

import (
	"encoding/json"
	"net/http"
	"os"
	"strings"

	"github.com/go-chi/chi/v5"

	paypalapimatic "github.com/talos/sdk/paypal-go-apimatic"
	"github.com/talos/services/orchestrator-go/internal/escrow"
	"github.com/talos/services/orchestrator-go/internal/ws"
)

func NormalizeServiceURL(raw, fallback string) string {
	val := strings.TrimSpace(raw)
	if val == "" {
		return fallback
	}
	if !strings.HasPrefix(val, "http://") && !strings.HasPrefix(val, "https://") {
		val = "http://" + val
	}
	return strings.TrimRight(val, "/")
}

func ResolveFirewallURL() string {
	if v := strings.TrimSpace(os.Getenv("RUST_FIREWALL_URL")); v != "" {
		return NormalizeServiceURL(v, "http://localhost:8081")
	}
	return NormalizeServiceURL(os.Getenv("FIREWALL_RS_INTERNAL_URL"), "http://localhost:8081")
}

type SlaTimelineTask struct {
	ID             string `json:"id"`
	EscrowID       string `json:"escrow_id"`
	ResourceID     string `json:"resourceId"`
	Name           string `json:"name"`
	StartDate      string `json:"startDate"`
	EndDate        string `json:"endDate"`
	AuthExpiryDate string `json:"authExpiryDate"`
	EscrowState    string `json:"escrowState"`
	PercentDone    int    `json:"percentDone"`
	Carrier        string `json:"carrier,omitempty"`
	TrackingNumber string `json:"tracking_number,omitempty"`
	TrackingStatus string `json:"tracking_status,omitempty"`
}

type DisputeEvidenceBundle struct {
	BundleID               string `json:"bundle_id"`
	EscrowID               string `json:"escrow_id"`
	PayPalDisputeID        string `json:"paypal_dispute_id"`
	BundleSHA256           string `json:"bundle_sha256"`
	PayPalSubmissionStatus string `json:"paypal_submission_status"`
	SubmittedAt            string `json:"submitted_at"`
}

type WebhookEventLedger struct {
	ID             string `json:"id"`
	TransmissionID string `json:"transmission_id"`
	EventType      string `json:"event_type"`
	CRC32Decimal   uint32 `json:"crc32_decimal"`
	CRC32Verified  bool   `json:"crc32_verified"`
	RSASigVerified bool   `json:"rsa_sig_verified"`
	ProcessedAt    string `json:"processed_at"`
}

func parseCheckoutReq(raw map[string]any) CheckoutEvaluateRequest {
	str := func(k, def string) string {
		if v, ok := raw[k].(string); ok && strings.TrimSpace(v) != "" {
			return strings.TrimSpace(v)
		}
		return def
	}
	num := func(k string, def int64) int64 {
		if v, ok := raw[k].(float64); ok && int64(v) > 0 {
			return int64(v)
		}
		return def
	}
	reroute, _ := raw["allow_auto_reroute"].(bool)
	return CheckoutEvaluateRequest{
		MandateID: str("mandate_id", "0192e8a0-0000-7000-8000-000000000101"), Ed25519Signature: str("ed25519_signature", strings.Repeat("b1", 64)),
		SKUQuery: str("sku_query", "Shure SM7B Vocal Dynamic Microphone"), Category: str("category", "Studio Audio"),
		MerchantName: str("merchant_name", "AudioPro Verified (Channel3 Preferred)"), MerchantURL: str("merchant_url", "https://verified-audio.trychannel3.com/sku/shure-sm7b"),
		MerchantPayPalEmail: str("merchant_paypal_email", "merchant-talos@business.example.com"), Currency: str("currency", "USD"),
		AmountCents: num("amount_cents", 24900), MaxAmountCents: num("max_amount_cents", 30000), MaxSpreadBps: num("max_spread_bps", 1500),
		RawHTMLOverride: str("raw_html_override", ""), AllowAutoReroute: reroute,
	}
}

func (s *Server) HandleAuthorizeEscrow(w http.ResponseWriter, r *http.Request) {
	escrowID := strings.TrimSpace(chi.URLParam(r, "id"))
	reqID := strings.TrimSpace(r.Header.Get("PayPal-Request-Id"))
	if reqID == "" {
		reqID = "auth-" + escrowID
	}
	var body struct {
		PayerSandboxEmail string `json:"payer_sandbox_email"`
		PayeeSandboxEmail string `json:"payee_sandbox_email"`
		AmountCents       int64  `json:"amount_cents"`
		Currency          string `json:"currency"`
		Description       string `json:"description"`
	}
	_ = json.NewDecoder(r.Body).Decode(&body)
	if body.AmountCents <= 0 {
		body.AmountCents = 24900
	}
	if body.Currency == "" {
		body.Currency = "USD"
	}

	res, _, err := s.Machine.ExecuteIdempotent("authorize:"+escrowID, reqID, func() (*escrow.Record, error) {
		authResp, aErr := s.PayPal.AuthorizeEscrow(r.Context(), paypalapimatic.CreateOrderRequest{
			PayPalRequestID: reqID, ReferenceID: escrowID, AmountCents: body.AmountCents,
			CurrencyCode: body.Currency, MerchantEmail: body.PayeeSandboxEmail, PayerEmail: body.PayerSandboxEmail, Description: body.Description,
		}, reqID)
		if aErr != nil {
			return nil, aErr
		}
		if _, exists := s.Machine.GetRecord(escrowID); !exists {
			s.Machine.UpsertRecord(escrow.Record{
				EscrowID: escrowID, AmountCents: body.AmountCents, Currency: body.Currency,
				State: escrow.StateInitiated, PayPalRequestID: reqID,
			})
		}
		return s.Machine.Transition(escrowID, escrow.StatePayPalAuthorized, func(rec *escrow.Record) {
			rec.PayPalOrderID, rec.PayPalAuthID, rec.PayPalRequestID = authResp.OrderID, authResp.AuthorizationID, reqID
			rec.AmountCents, rec.StepUpRequired, rec.SandboxMode = body.AmountCents, false, authResp.SandboxMode
		})
	})
	if err != nil {
		writeProblem(w, http.StatusConflict, "INVALID_STATE_TRANSITION", err.Error(), nil)
		return
	}
	s.Hub.Broadcast(ws.EventMessage{EventType: "ESCROW_STATE_TRANSITION", EscrowID: escrowID, Payload: res})
	writeJSON(w, http.StatusCreated, res)
}

func (s *Server) HandleStepUpApprove(w http.ResponseWriter, r *http.Request) {
	escrowID := strings.TrimSpace(chi.URLParam(r, "id"))
	reqID := strings.TrimSpace(r.Header.Get("PayPal-Request-Id"))
	if reqID == "" {
		reqID = "stepup-" + escrowID
	}
	var body struct {
		PayPalOrderID string `json:"paypal_order_id"`
		PayPalAuthID  string `json:"paypal_auth_id"`
	}
	_ = json.NewDecoder(r.Body).Decode(&body)
	if _, exists := s.Machine.GetRecord(escrowID); !exists {
		s.Machine.UpsertRecord(escrow.Record{EscrowID: escrowID, AmountCents: 45000, Currency: "USD", State: escrow.StateStepUpRequired, StepUpRequired: true})
	}
	rec, err := s.Machine.Transition(escrowID, escrow.StatePayPalAuthorized, func(r *escrow.Record) {
		r.StepUpRequired = false
		if body.PayPalOrderID != "" {
			r.PayPalOrderID = body.PayPalOrderID
		}
		if body.PayPalAuthID != "" {
			r.PayPalAuthID = body.PayPalAuthID
		}
		r.PayPalRequestID = reqID
	})
	if err != nil {
		writeProblem(w, http.StatusConflict, "STEP_UP_TRANSITION_ERROR", err.Error(), nil)
		return
	}
	s.Hub.Broadcast(ws.EventMessage{EventType: "ESCROW_STATE_TRANSITION", EscrowID: escrowID, Payload: rec})
	writeJSON(w, http.StatusOK, rec)
}

func (s *Server) HandleCaptureEscrow(w http.ResponseWriter, r *http.Request) {
	escrowID := strings.TrimSpace(chi.URLParam(r, "id"))
	reqID := strings.TrimSpace(r.Header.Get("PayPal-Request-Id"))
	if reqID == "" {
		writeProblem(w, http.StatusBadRequest, "MISSING_PAYPAL_REQUEST_ID", "PayPal-Request-Id header is required", nil)
		return
	}
	res, _, err := s.Machine.ExecuteIdempotent("capture:"+escrowID, reqID, func() (*escrow.Record, error) {
		rec, ok := s.Machine.GetRecord(escrowID)
		if !ok {
			return nil, escrow.ErrEscrowNotFound
		}
		authID := rec.PayPalAuthID
		if authID == "" {
			authID = "2A-" + escrowID
		}
		capResp, cErr := s.PayPal.CaptureEscrow(r.Context(), authID, rec.AmountCents, rec.Currency, reqID)
		if cErr != nil {
			return nil, cErr
		}
		return s.Machine.Transition(escrowID, escrow.StatePayPalCaptured, func(r *escrow.Record) {
			r.PayPalCaptureID, r.PayPalRequestID = capResp.CaptureID, reqID
		})
	})
	if err != nil {
		writeProblem(w, http.StatusConflict, "CAPTURE_REJECTED", err.Error(), nil)
		return
	}
	s.syncSlaTaskState(escrowID, string(res.State), "DELIVERED", 100)
	s.Hub.Broadcast(ws.EventMessage{EventType: "ESCROW_STATE_TRANSITION", EscrowID: escrowID, Payload: res})
	writeJSON(w, http.StatusCreated, res)
}

func (s *Server) HandleVoidEscrow(w http.ResponseWriter, r *http.Request) {
	escrowID := strings.TrimSpace(chi.URLParam(r, "id"))
	reqID := strings.TrimSpace(r.Header.Get("PayPal-Request-Id"))
	if reqID == "" {
		writeProblem(w, http.StatusBadRequest, "MISSING_PAYPAL_REQUEST_ID", "PayPal-Request-Id header is required", nil)
		return
	}
	res, _, err := s.Machine.ExecuteIdempotent("void:"+escrowID, reqID, func() (*escrow.Record, error) {
		rec, ok := s.Machine.GetRecord(escrowID)
		if !ok {
			return nil, escrow.ErrEscrowNotFound
		}
		if rec.State == escrow.StatePayPalVoided {
			return rec, nil
		}
		authID := rec.PayPalAuthID
		if authID == "" {
			authID = "2A-" + escrowID
		}
		if _, vErr := s.PayPal.VoidEscrow(r.Context(), authID, reqID); vErr != nil {
			return nil, vErr
		}
		return s.Machine.Transition(escrowID, escrow.StatePayPalVoided, func(r *escrow.Record) {
			r.PayPalRequestID, r.TrackingStatus = reqID, "SLA_BREACHED"
		})
	})
	if err != nil {
		writeProblem(w, http.StatusConflict, "VOID_REJECTED", err.Error(), nil)
		return
	}
	s.syncSlaTaskState(escrowID, string(res.State), "SLA_BREACHED", 100)
	s.Hub.Broadcast(ws.EventMessage{EventType: "ESCROW_STATE_TRANSITION", EscrowID: escrowID, Payload: res})
	writeJSON(w, http.StatusOK, res)
}
