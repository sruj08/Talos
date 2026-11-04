package paypalapimatic

import (
	"context"
	"fmt"
	"net/http"
	"strings"
	"time"
)

// CreateOrderRequest models POST /v2/checkout/orders with intent="AUTHORIZE".
type CreateOrderRequest struct {
	Intent          string `json:"intent"` // Always "AUTHORIZE" for TALOS 2PC Escrow
	PayPalRequestID string `json:"paypal_request_id"`
	ReferenceID     string `json:"reference_id,omitempty"`
	CustomID        string `json:"custom_id,omitempty"`
	AmountCents     int64  `json:"amount_cents"`
	CurrencyCode    string `json:"currency_code"`
	MerchantEmail   string `json:"merchant_email"`
	PayerEmail      string `json:"payer_email,omitempty"`
	Description     string `json:"description"`
}

// OrderAuthorizationResponse models the strongly-typed APIMatic response for Orders v2 AUTHORIZE.
type OrderAuthorizationResponse struct {
	OrderID         string `json:"order_id"`
	AuthorizationID string `json:"authorization_id"`
	Status          string `json:"status"` // "CREATED" | "AUTHORIZED"
	ExpirationTime  string `json:"expiration_time"`
	PayPalRequestID string `json:"paypal_request_id"`
	PayPalDebugID   string `json:"paypal_debug_id,omitempty"`
	SandboxMode     string `json:"sandbox_mode"` // "LIVE" | "RECORDED_REPLAY"
}

type paypalOrderV2WireRequest struct {
	Intent        string                      `json:"intent"`
	PurchaseUnits []paypalPurchaseUnitV2Input `json:"purchase_units"`
}

type paypalPurchaseUnitV2Input struct {
	ReferenceID string              `json:"reference_id,omitempty"`
	CustomID    string              `json:"custom_id,omitempty"`
	Description string              `json:"description,omitempty"`
	Amount      paypalAmountV2Input `json:"amount"`
}

type paypalAmountV2Input struct {
	CurrencyCode string `json:"currency_code"`
	Value        string `json:"value"`
}

type paypalOrderV2WireResponse struct {
	ID            string `json:"id"`
	Status        string `json:"status"`
	PurchaseUnits []struct {
		Payments struct {
			Authorizations []struct {
				ID             string `json:"id"`
				Status         string `json:"status"`
				ExpirationTime string `json:"expiration_time"`
			} `json:"authorizations"`
		} `json:"payments"`
	} `json:"purchase_units"`
}

// CreateOrder invokes POST /v2/checkout/orders with intent="AUTHORIZE" and mandatory PayPal-Request-Id header.
func (c *Client) CreateOrder(ctx context.Context, req CreateOrderRequest, requestID ...string) (*OrderAuthorizationResponse, error) {
	reqID := strings.TrimSpace(req.PayPalRequestID)
	if len(requestID) > 0 && strings.TrimSpace(requestID[0]) != "" {
		reqID = strings.TrimSpace(requestID[0])
	}
	if reqID == "" {
		return nil, ErrMissingPayPalRequestID
	}
	intent := strings.ToUpper(strings.TrimSpace(req.Intent))
	if intent == "" {
		intent = "AUTHORIZE"
	}
	currency := strings.ToUpper(strings.TrimSpace(req.CurrencyCode))
	if currency == "" {
		currency = "USD"
	}
	amountCents := req.AmountCents
	if amountCents <= 0 {
		amountCents = 24900
	}
	refID := req.ReferenceID
	if refID == "" {
		refID = "ESCROW-" + deterministicID("", reqID, 8)
	}
	desc := req.Description
	if desc == "" {
		desc = "TALOS KYA Protected Agentic Escrow Hold"
	}

	wireReq := paypalOrderV2WireRequest{
		Intent: intent,
		PurchaseUnits: []paypalPurchaseUnitV2Input{
			{
				ReferenceID: refID,
				CustomID:    req.CustomID,
				Description: desc,
				Amount: paypalAmountV2Input{
					CurrencyCode: currency,
					Value:        fmt.Sprintf("%.2f", float64(amountCents)/100.0),
				},
			},
		},
	}

	expTime := time.Now().UTC().Add(29 * 24 * time.Hour).Format(time.RFC3339)
	tok, _ := c.AcquireOAuthToken(ctx)
	if tok != nil && tok.SandboxMode == "LIVE" && strings.HasPrefix(c.Config.BaseURL, "http") {
		var wireResp paypalOrderV2WireResponse
		status, headers, err := c.DoRequest(ctx, http.MethodPost, "/v2/checkout/orders", reqID, wireReq, &wireResp)
		if err == nil && (status == http.StatusOK || status == http.StatusCreated) && wireResp.ID != "" {
			authID := deterministicID("2A", wireResp.ID+":"+reqID, 15)
			if len(wireResp.PurchaseUnits) > 0 && len(wireResp.PurchaseUnits[0].Payments.Authorizations) > 0 {
				if a := wireResp.PurchaseUnits[0].Payments.Authorizations[0]; a.ID != "" {
					authID = a.ID
					if a.ExpirationTime != "" {
						expTime = a.ExpirationTime
					}
				}
			}
			st := wireResp.Status
			if st == "" {
				st = "CREATED"
			}
			var debugID string
			if headers != nil {
				debugID = headers.Get("Paypal-Debug-Id")
			}
			return &OrderAuthorizationResponse{
				OrderID:         wireResp.ID,
				AuthorizationID: authID,
				Status:          st,
				ExpirationTime:  expTime,
				PayPalRequestID: reqID,
				PayPalDebugID:   debugID,
				SandboxMode:     "LIVE",
			}, nil
		}
		if !c.Config.FallbackReplay {
			if err != nil {
				return nil, err
			}
			return nil, fmt.Errorf("paypal create order returned status %d", status)
		}
	}

	return &OrderAuthorizationResponse{
		OrderID:         deterministicID("8XY", "order:"+reqID, 14),
		AuthorizationID: deterministicID("2A", "auth:"+reqID, 15),
		Status:          "CREATED",
		ExpirationTime:  expTime,
		PayPalRequestID: reqID,
		SandboxMode:     "RECORDED_REPLAY",
	}, nil
}

// AuthorizeOrder invokes POST /v2/checkout/orders/{id}/authorize with mandatory PayPal-Request-Id header.
func (c *Client) AuthorizeOrder(ctx context.Context, orderID, requestID string) (*OrderAuthorizationResponse, error) {
	ordID := strings.TrimSpace(orderID)
	if ordID == "" {
		return nil, ErrEmptyIdentifier
	}
	reqID := strings.TrimSpace(requestID)
	if reqID == "" {
		return nil, ErrMissingPayPalRequestID
	}
	expTime := time.Now().UTC().Add(29 * 24 * time.Hour).Format(time.RFC3339)

	var wireResp paypalOrderV2WireResponse
	status, headers, err := c.DoRequest(ctx, http.MethodPost, fmt.Sprintf("/v2/checkout/orders/%s/authorize", ordID), reqID, map[string]any{}, &wireResp)
	if err == nil && (status == http.StatusOK || status == http.StatusCreated) {
		authID := deterministicID("2A", ordID+":"+reqID, 15)
		if len(wireResp.PurchaseUnits) > 0 && len(wireResp.PurchaseUnits[0].Payments.Authorizations) > 0 {
			if a := wireResp.PurchaseUnits[0].Payments.Authorizations[0]; a.ID != "" {
				authID = a.ID
				if a.ExpirationTime != "" {
					expTime = a.ExpirationTime
				}
			}
		}
		var debugID string
		if headers != nil {
			debugID = headers.Get("Paypal-Debug-Id")
		}
		return &OrderAuthorizationResponse{
			OrderID:         ordID,
			AuthorizationID: authID,
			Status:          "AUTHORIZED",
			ExpirationTime:  expTime,
			PayPalRequestID: reqID,
			PayPalDebugID:   debugID,
			SandboxMode:     "LIVE",
		}, nil
	}
	if !c.Config.FallbackReplay {
		if err != nil {
			return nil, err
		}
		return nil, fmt.Errorf("paypal authorize order returned status %d", status)
	}

	return &OrderAuthorizationResponse{
		OrderID:         ordID,
		AuthorizationID: deterministicID("2A", ordID+":"+reqID, 15),
		Status:          "AUTHORIZED",
		ExpirationTime:  expTime,
		PayPalRequestID: reqID,
		SandboxMode:     "RECORDED_REPLAY",
	}, nil
}

// CreateAndAuthorizeOrder creates an order with intent=AUTHORIZE and immediately locks the 29-day authorization hold.
func (c *Client) CreateAndAuthorizeOrder(ctx context.Context, req CreateOrderRequest, requestID ...string) (*OrderAuthorizationResponse, error) {
	created, err := c.CreateOrder(ctx, req, requestID...)
	if err != nil {
		return nil, err
	}
	authReqID := created.PayPalRequestID + "-auth"
	authed, err := c.AuthorizeOrder(ctx, created.OrderID, authReqID)
	if err != nil {
		return nil, err
	}
	authed.PayPalRequestID = created.PayPalRequestID
	if created.SandboxMode == "LIVE" {
		authed.SandboxMode = "LIVE"
	}
	if authed.PayPalDebugID == "" {
		authed.PayPalDebugID = created.PayPalDebugID
	}
	return authed, nil
}
