package paypalapimatic

import (
	"context"
	"fmt"
	"net/http"
	"strings"
	"time"
)

// CaptureAuthorizationRequest models a PayPal Payments v2 authorization capture payload.
type CaptureAuthorizationRequest struct {
	PayPalRequestID string `json:"paypal_request_id"`
	FinalCapture    bool   `json:"final_capture"`
	NoteToPayer     string `json:"note_to_payer,omitempty"`
	InvoiceID       string `json:"invoice_id,omitempty"`
	AmountCents     int64  `json:"amount_cents,omitempty"`
	CurrencyCode    string `json:"currency_code,omitempty"`
}

// CaptureAuthorizationResponse models a PayPal Payments v2 capture response.
type CaptureAuthorizationResponse struct {
	CaptureID       string `json:"capture_id"`
	AuthorizationID string `json:"authorization_id"`
	Status          string `json:"status"`
	RequestID       string `json:"request_id"`
	FinalCapture    bool   `json:"final_capture"`
	AmountCents     int64  `json:"amount_cents,omitempty"`
	CurrencyCode    string `json:"currency_code,omitempty"`
	SettledAt       string `json:"settled_at"`
	FallbackReplay  bool   `json:"fallback_replay"`
}

// VoidAuthorizationResponse models a PayPal Payments v2 void response.
type VoidAuthorizationResponse struct {
	AuthorizationID string `json:"authorization_id"`
	Status          string `json:"status"`
	RequestID       string `json:"request_id"`
	VoidedAt        string `json:"voided_at"`
	FallbackReplay  bool   `json:"fallback_replay"`
}

type captureV2WireRequest struct {
	FinalCapture bool               `json:"final_capture"`
	NoteToPayer  string             `json:"note_to_payer,omitempty"`
	InvoiceID    string             `json:"invoice_id,omitempty"`
	Amount       *orderV2WireAmount `json:"amount,omitempty"`
}

type captureV2WireResponse struct {
	ID           string `json:"id"`
	Status       string `json:"status"`
	FinalCapture bool   `json:"final_capture"`
	CreateTime   string `json:"create_time"`
}

// CaptureAuthorization invokes POST /v2/payments/authorizations/{id}/capture with PayPal-Request-Id header.
func (c *Client) CaptureAuthorization(ctx context.Context, authorizationID string, req CaptureAuthorizationRequest) (*CaptureAuthorizationResponse, error) {
	authorizationID = strings.TrimSpace(authorizationID)
	if authorizationID == "" {
		return nil, ErrEmptyIdentifier
	}
	requestID := strings.TrimSpace(req.PayPalRequestID)
	if requestID == "" {
		return nil, ErrMissingRequestID
	}

	now := time.Now().UTC().Format(time.RFC3339)
	currency := strings.ToUpper(strings.TrimSpace(req.CurrencyCode))
	if currency == "" {
		currency = "USD"
	}

	if c.FallbackMode || strings.HasPrefix(authorizationID, "AUTH-TALOS-") {
		return &CaptureAuthorizationResponse{
			CaptureID:       deterministicID("CAP-TALOS", authorizationID+":"+requestID),
			AuthorizationID: authorizationID,
			Status:          "COMPLETED",
			RequestID:       requestID,
			FinalCapture:    req.FinalCapture,
			AmountCents:     req.AmountCents,
			CurrencyCode:    currency,
			SettledAt:       now,
			FallbackReplay:  true,
		}, nil
	}

	wireReq := captureV2WireRequest{
		FinalCapture: req.FinalCapture,
		NoteToPayer:  req.NoteToPayer,
		InvoiceID:    req.InvoiceID,
	}
	if req.AmountCents > 0 {
		wireReq.Amount = &orderV2WireAmount{
			CurrencyCode: currency,
			Value:        FormatCentsToDecimal(req.AmountCents),
		}
	}

	path := fmt.Sprintf("/v2/payments/authorizations/%s/capture", authorizationID)
	var wireResp captureV2WireResponse
	if _, err := c.doJSON(ctx, http.MethodPost, path, requestID, wireReq, &wireResp); err != nil {
		return nil, err
	}

	settledAt := wireResp.CreateTime
	if settledAt == "" {
		settledAt = now
	}
	status := wireResp.Status
	if status == "" {
		status = "COMPLETED"
	}
	return &CaptureAuthorizationResponse{
		CaptureID:       wireResp.ID,
		AuthorizationID: authorizationID,
		Status:          status,
		RequestID:       requestID,
		FinalCapture:    req.FinalCapture,
		AmountCents:     req.AmountCents,
		CurrencyCode:    currency,
		SettledAt:       settledAt,
	}, nil
}

// VoidAuthorization invokes POST /v2/payments/authorizations/{id}/void with PayPal-Request-Id header.
func (c *Client) VoidAuthorization(ctx context.Context, authorizationID, paypalRequestID string) (*VoidAuthorizationResponse, error) {
	authorizationID = strings.TrimSpace(authorizationID)
	if authorizationID == "" {
		return nil, ErrEmptyIdentifier
	}
	requestID := strings.TrimSpace(paypalRequestID)
	if requestID == "" {
		return nil, ErrMissingRequestID
	}

	now := time.Now().UTC().Format(time.RFC3339)
	if c.FallbackMode || strings.HasPrefix(authorizationID, "AUTH-TALOS-") {
		return &VoidAuthorizationResponse{
			AuthorizationID: authorizationID,
			Status:          "VOIDED",
			RequestID:       requestID,
			VoidedAt:        now,
			FallbackReplay:  true,
		}, nil
	}

	path := fmt.Sprintf("/v2/payments/authorizations/%s/void", authorizationID)
	if _, err := c.doJSON(ctx, http.MethodPost, path, requestID, nil, nil); err != nil {
		return nil, err
	}

	return &VoidAuthorizationResponse{
		AuthorizationID: authorizationID,
		Status:          "VOIDED",
		RequestID:       requestID,
		VoidedAt:        now,
	}, nil
}
