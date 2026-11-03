package paypal

import (
	"context"
	"strings"

	paypalapimatic "github.com/talos/sdk/paypal-go-apimatic"
)

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
