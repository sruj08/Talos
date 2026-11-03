package paypal

import (
	"context"
	"os"
	"strings"

	paypalapimatic "github.com/talos/sdk/paypal-go-apimatic"
)

// HoldRequest represents the orchestrator's Phase 1 2PC authorization request.
type HoldRequest struct {
	EscrowID        string `json:"escrow_id"`
	MandateID       string `json:"mandate_id"`
	AmountCents     int64  `json:"amount_cents"`
	CurrencyCode    string `json:"currency_code"`
	Description     string `json:"description"`
	PayPalRequestID string `json:"paypal_request_id"`
}

// HoldResult represents the normalized Phase 1 2PC authorization result.
type HoldResult struct {
	OrderID         string `json:"order_id"`
	AuthorizationID string `json:"authorization_id"`
	Status          string `json:"status"`
	RequestID       string `json:"request_id"`
	AmountCents     int64  `json:"amount_cents"`
	CurrencyCode    string `json:"currency_code"`
	ExpiresAt       string `json:"expires_at"`
	FallbackReplay  bool   `json:"fallback_replay"`
}

// CaptureRequest represents the orchestrator's Phase 2A 2PC capture request.
type CaptureRequest struct {
	AuthorizationID string `json:"authorization_id"`
	PayPalRequestID string `json:"paypal_request_id"`
	AmountCents     int64  `json:"amount_cents"`
	CurrencyCode    string `json:"currency_code"`
	NoteToPayer     string `json:"note_to_payer"`
	FinalCapture    bool   `json:"final_capture"`
}

// CaptureResult represents the normalized Phase 2A 2PC capture result.
type CaptureResult struct {
	CaptureID       string `json:"capture_id"`
	AuthorizationID string `json:"authorization_id"`
	Status          string `json:"status"`
	RequestID       string `json:"request_id"`
	FinalCapture    bool   `json:"final_capture"`
	SettledAt       string `json:"settled_at"`
	FallbackReplay  bool   `json:"fallback_replay"`
}

// VoidResult represents the normalized Phase 2B 2PC void result.
type VoidResult struct {
	AuthorizationID string `json:"authorization_id"`
	Status          string `json:"status"`
	RequestID       string `json:"request_id"`
	VoidedAt        string `json:"voided_at"`
	FallbackReplay  bool   `json:"fallback_replay"`
}

// Provider defines the PayPal Sandbox operations required by the 2PC Escrow State Machine.
type Provider interface {
	AuthorizeEscrowHold(ctx context.Context, req HoldRequest) (*HoldResult, error)
	CaptureEscrowHold(ctx context.Context, req CaptureRequest) (*CaptureResult, error)
	VoidEscrowHold(ctx context.Context, authorizationID, paypalRequestID string) (*VoidResult, error)
}

// SandboxService wraps the APIMatic-generated PayPal Go SDK client for the Go Orchestrator.
type SandboxService struct {
	Client    *paypalapimatic.Client
	WebhookID string
}

// NewSandboxService creates a SandboxService from an existing APIMatic SDK client.
func NewSandboxService(client *paypalapimatic.Client, webhookID string) *SandboxService {
	if client == nil {
		client = paypalapimatic.NewSandboxClient("", "")
	}
	return &SandboxService{
		Client:    client,
		WebhookID: strings.TrimSpace(webhookID),
	}
}

// NewSandboxServiceFromEnv initializes a SandboxService from environment variables.
func NewSandboxServiceFromEnv() *SandboxService {
	client := paypalapimatic.NewSandboxClient(
		os.Getenv("PAYPAL_CLIENT_ID"),
		os.Getenv("PAYPAL_CLIENT_SECRET"),
	)
	if baseURL := strings.TrimSpace(os.Getenv("PAYPAL_BASE_URL")); baseURL != "" {
		client.BaseURL = baseURL
	}
	return NewSandboxService(client, os.Getenv("PAYPAL_WEBHOOK_ID"))
}

// ServiceName returns the canonical PayPal Sandbox adapter identifier.
func (s *SandboxService) ServiceName() string {
	return "paypal-sandbox-apimatic"
}

// AuthorizeEscrowHold executes Phase 1 of the 2PC Escrow State Machine via PayPal Orders v2 AUTHORIZE.
func (s *SandboxService) AuthorizeEscrowHold(ctx context.Context, req HoldRequest) (*HoldResult, error) {
	customID := strings.TrimSpace(req.EscrowID)
	if customID == "" {
		customID = strings.TrimSpace(req.MandateID)
	}
	currency := strings.ToUpper(strings.TrimSpace(req.CurrencyCode))
	if currency == "" {
		currency = "USD"
	}

	resp, err := s.Client.CreateAndAuthorizeOrder(ctx, paypalapimatic.CreateOrderRequest{
		Intent:          "AUTHORIZE",
		CurrencyCode:    currency,
		AmountCents:     req.AmountCents,
		CustomID:        customID,
		InvoiceID:       req.MandateID,
		Description:     req.Description,
		PayPalRequestID: req.PayPalRequestID,
	})
	if err != nil {
		return nil, err
	}

	return &HoldResult{
		OrderID:         resp.OrderID,
		AuthorizationID: resp.AuthorizationID,
		Status:          resp.Status,
		RequestID:       resp.RequestID,
		AmountCents:     resp.AmountCents,
		CurrencyCode:    resp.CurrencyCode,
		ExpiresAt:       resp.ExpiresAt,
		FallbackReplay:  resp.FallbackReplay,
	}, nil
}

// CaptureEscrowHold executes Phase 2A of the 2PC Escrow State Machine via PayPal Payments v2 CAPTURE.
func (s *SandboxService) CaptureEscrowHold(ctx context.Context, req CaptureRequest) (*CaptureResult, error) {
	note := strings.TrimSpace(req.NoteToPayer)
	if note == "" {
		note = "Talos Oracle Verified Delivery & Spec"
	}
	resp, err := s.Client.CaptureAuthorization(ctx, req.AuthorizationID, paypalapimatic.CaptureAuthorizationRequest{
		PayPalRequestID: req.PayPalRequestID,
		FinalCapture:    req.FinalCapture,
		NoteToPayer:     note,
		AmountCents:     req.AmountCents,
		CurrencyCode:    req.CurrencyCode,
	})
	if err != nil {
		return nil, err
	}

	return &CaptureResult{
		CaptureID:       resp.CaptureID,
		AuthorizationID: resp.AuthorizationID,
		Status:          resp.Status,
		RequestID:       resp.RequestID,
		FinalCapture:    resp.FinalCapture,
		SettledAt:       resp.SettledAt,
		FallbackReplay:  resp.FallbackReplay,
	}, nil
}

// VoidEscrowHold executes Phase 2B of the 2PC Escrow State Machine via PayPal Payments v2 VOID.
func (s *SandboxService) VoidEscrowHold(ctx context.Context, authorizationID, paypalRequestID string) (*VoidResult, error) {
	resp, err := s.Client.VoidAuthorization(ctx, authorizationID, paypalRequestID)
	if err != nil {
		return nil, err
	}
	return &VoidResult{
		AuthorizationID: resp.AuthorizationID,
		Status:          resp.Status,
		RequestID:       resp.RequestID,
		VoidedAt:        resp.VoidedAt,
		FallbackReplay:  resp.FallbackReplay,
	}, nil
}

// AttachTracking binds a physical carrier tracking number to a PayPal Sandbox capture via Tracking v1.
func (s *SandboxService) AttachTracking(ctx context.Context, paypalRequestID, transactionID, trackingNumber, carrier, status string) (*paypalapimatic.TrackersBatchResponse, error) {
	return s.Client.CreateTrackingBatch(ctx, paypalRequestID, []paypalapimatic.TrackerPayload{
		{
			TransactionID:  transactionID,
			TrackingNumber: trackingNumber,
			Carrier:        carrier,
			Status:         status,
		},
	})
}

// SubmitDisputeEvidence submits cryptographic KYA & Oracle evidence via Disputes v1.
func (s *SandboxService) SubmitDisputeEvidence(ctx context.Context, paypalRequestID string, req paypalapimatic.ProvideEvidenceRequest) (*paypalapimatic.ProvideEvidenceResponse, error) {
	return s.Client.ProvideDisputeEvidence(ctx, paypalRequestID, req)
}
