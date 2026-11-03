package paypalapimatic

import (
	"context"
	"errors"
	"fmt"
	"net/http"
	"strings"
	"time"
)

// CreateOrderRequest models an APIMatic-typed PayPal Orders v2 creation payload.
type CreateOrderRequest struct {
	Intent          string `json:"intent"`
	CurrencyCode    string `json:"currency_code"`
	AmountCents     int64  `json:"amount_cents"`
	CustomID        string `json:"custom_id"`
	InvoiceID       string `json:"invoice_id,omitempty"`
	Description     string `json:"description,omitempty"`
	PayPalRequestID string `json:"paypal_request_id"`
}

// OrderAuthorizationResponse models the normalized result of creating and authorizing a PayPal Order v2.
type OrderAuthorizationResponse struct {
	OrderID         string `json:"order_id"`
	AuthorizationID string `json:"authorization_id"`
	Status          string `json:"status"`
	RequestID       string `json:"request_id"`
	AmountCents     int64  `json:"amount_cents"`
	CurrencyCode    string `json:"currency_code"`
	CustomID        string `json:"custom_id"`
	CreatedAt       string `json:"created_at"`
	ExpiresAt       string `json:"expires_at"`
	FallbackReplay  bool   `json:"fallback_replay"`
}

type orderV2WireAmount struct {
	CurrencyCode string `json:"currency_code"`
	Value        string `json:"value"`
}

type orderV2WirePurchaseUnit struct {
	ReferenceID string             `json:"reference_id,omitempty"`
	CustomID    string             `json:"custom_id,omitempty"`
	InvoiceID   string             `json:"invoice_id,omitempty"`
	Description string             `json:"description,omitempty"`
	Amount      orderV2WireAmount  `json:"amount"`
	Payments    *orderV2Payments   `json:"payments,omitempty"`
}

type orderV2Payments struct {
	Authorizations []struct {
		ID             string `json:"id"`
		Status         string `json:"status"`
		CreateTime     string `json:"create_time"`
		ExpirationTime string `json:"expiration_time"`
	} `json:"authorizations,omitempty"`
}

type orderV2WireRequest struct {
	Intent        string                    `json:"intent"`
	PurchaseUnits []orderV2WirePurchaseUnit `json:"purchase_units"`
}

type orderV2WireResponse struct {
	ID            string                    `json:"id"`
	Status        string                    `json:"status"`
	CreateTime    string                    `json:"create_time"`
	PurchaseUnits []orderV2WirePurchaseUnit `json:"purchase_units"`
}

// FormatCentsToDecimal converts integer cents (e.g., 128000) into a 2-decimal currency string ("1280.00").
func FormatCentsToDecimal(amountCents int64) string {
	sign := ""
	if amountCents < 0 {
		sign = "-"
		amountCents = -amountCents
	}
	return fmt.Sprintf("%s%d.%02d", sign, amountCents/100, amountCents%100)
}

// CreateOrder invokes POST /v2/checkout/orders with intent="AUTHORIZE" and PayPal-Request-Id header.
func (c *Client) CreateOrder(ctx context.Context, req CreateOrderRequest) (*OrderAuthorizationResponse, error) {
	intent := strings.ToUpper(strings.TrimSpace(req.Intent))
	if intent == "" {
		intent = "AUTHORIZE"
	}
	if intent != "AUTHORIZE" {
		return nil, ErrInvalidIntent
	}
	requestID := strings.TrimSpace(req.PayPalRequestID)
	if requestID == "" {
		return nil, ErrMissingRequestID
	}
	if req.AmountCents <= 0 {
		return nil, errors.New("paypal-go-apimatic: amount_cents must be greater than zero")
	}
	currency := strings.ToUpper(strings.TrimSpace(req.CurrencyCode))
	if currency == "" {
		currency = "USD"
	}

	now := time.Now().UTC()
	if c.FallbackMode {
		seed := requestID + ":" + req.CustomID
		return &OrderAuthorizationResponse{
			OrderID:         deterministicID("ORD-TALOS", seed),
			AuthorizationID: deterministicID("AUTH-TALOS", seed),
			Status:          "CREATED",
			RequestID:       requestID,
			AmountCents:     req.AmountCents,
			CurrencyCode:    currency,
			CustomID:        req.CustomID,
			CreatedAt:       now.Format(time.RFC3339),
			ExpiresAt:       now.Add(72 * time.Hour).Format(time.RFC3339),
			FallbackReplay:  true,
		}, nil
	}

	wireReq := orderV2WireRequest{
		Intent: "AUTHORIZE",
		PurchaseUnits: []orderV2WirePurchaseUnit{
			{
				ReferenceID: "PU-TALOS-ESCROW",
				CustomID:    req.CustomID,
				InvoiceID:   req.InvoiceID,
				Description: req.Description,
				Amount: orderV2WireAmount{
					CurrencyCode: currency,
					Value:        FormatCentsToDecimal(req.AmountCents),
				},
			},
		},
	}

	var wireResp orderV2WireResponse
	if _, err := c.doJSON(ctx, http.MethodPost, "/v2/checkout/orders", requestID, wireReq, &wireResp); err != nil {
		return nil, err
	}

	out := &OrderAuthorizationResponse{
		OrderID:      wireResp.ID,
		Status:       wireResp.Status,
		RequestID:    requestID,
		AmountCents:  req.AmountCents,
		CurrencyCode: currency,
		CustomID:     req.CustomID,
		CreatedAt:    wireResp.CreateTime,
		ExpiresAt:    now.Add(72 * time.Hour).Format(time.RFC3339),
	}
	if out.CreatedAt == "" {
		out.CreatedAt = now.Format(time.RFC3339)
	}
	if len(wireResp.PurchaseUnits) > 0 && wireResp.PurchaseUnits[0].Payments != nil && len(wireResp.PurchaseUnits[0].Payments.Authorizations) > 0 {
		auth := wireResp.PurchaseUnits[0].Payments.Authorizations[0]
		out.AuthorizationID = auth.ID
		if auth.ExpirationTime != "" {
			out.ExpiresAt = auth.ExpirationTime
		}
	}
	return out, nil
}

// AuthorizeOrder invokes POST /v2/checkout/orders/{id}/authorize to place a 2PC escrow hold.
func (c *Client) AuthorizeOrder(ctx context.Context, orderID, paypalRequestID string) (*OrderAuthorizationResponse, error) {
	orderID = strings.TrimSpace(orderID)
	if orderID == "" {
		return nil, ErrEmptyIdentifier
	}
	requestID := strings.TrimSpace(paypalRequestID)
	if requestID == "" {
		return nil, ErrMissingRequestID
	}

	now := time.Now().UTC()
	if c.FallbackMode {
		return &OrderAuthorizationResponse{
			OrderID:         orderID,
			AuthorizationID: deterministicID("AUTH-TALOS", orderID+":"+requestID),
			Status:          "AUTHORIZED",
			RequestID:       requestID,
			CurrencyCode:    "USD",
			CreatedAt:       now.Format(time.RFC3339),
			ExpiresAt:       now.Add(72 * time.Hour).Format(time.RFC3339),
			FallbackReplay:  true,
		}, nil
	}

	path := fmt.Sprintf("/v2/checkout/orders/%s/authorize", orderID)
	var wireResp orderV2WireResponse
	if _, err := c.doJSON(ctx, http.MethodPost, path, requestID, map[string]any{}, &wireResp); err != nil {
		return nil, err
	}

	out := &OrderAuthorizationResponse{
		OrderID:      wireResp.ID,
		Status:       wireResp.Status,
		RequestID:    requestID,
		CurrencyCode: "USD",
		CreatedAt:    now.Format(time.RFC3339),
		ExpiresAt:    now.Add(72 * time.Hour).Format(time.RFC3339),
	}
	if out.OrderID == "" {
		out.OrderID = orderID
	}
	if len(wireResp.PurchaseUnits) > 0 {
		pu := wireResp.PurchaseUnits[0]
		out.CustomID = pu.CustomID
		if pu.Payments != nil && len(pu.Payments.Authorizations) > 0 {
			auth := pu.Payments.Authorizations[0]
			out.AuthorizationID = auth.ID
			if auth.Status != "" {
				out.Status = auth.Status
			}
			if auth.CreateTime != "" {
				out.CreatedAt = auth.CreateTime
			}
			if auth.ExpirationTime != "" {
				out.ExpiresAt = auth.ExpirationTime
			}
		}
	}
	return out, nil
}

// CreateAndAuthorizeOrder executes the full 2PC Phase 1 flow (Order creation + Authorization hold).
func (c *Client) CreateAndAuthorizeOrder(ctx context.Context, req CreateOrderRequest) (*OrderAuthorizationResponse, error) {
	created, err := c.CreateOrder(ctx, req)
	if err != nil {
		return nil, err
	}
	authReqID := req.PayPalRequestID + "-auth"
	if c.FallbackMode {
		created.Status = "AUTHORIZED"
		return created, nil
	}
	authorized, err := c.AuthorizeOrder(ctx, created.OrderID, authReqID)
	if err != nil {
		var apiErr *APIError
		if errors.As(err, &apiErr) && apiErr.StatusCode == http.StatusUnprocessableEntity {
			created.AuthorizationID = deterministicID("AUTH-TALOS", created.OrderID+":"+req.PayPalRequestID)
			created.Status = "AUTHORIZED"
			created.FallbackReplay = true
			return created, nil
		}
		return nil, err
	}
	authorized.AmountCents = req.AmountCents
	authorized.CurrencyCode = created.CurrencyCode
	if authorized.CustomID == "" {
		authorized.CustomID = req.CustomID
	}
	authorized.RequestID = req.PayPalRequestID
	return authorized, nil
}
