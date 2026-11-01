package paypalapimatic

// CreateOrderRequest models POST /v2/checkout/orders with intent="AUTHORIZE".
type CreateOrderRequest struct {
	Intent          string `json:"intent"` // Always "AUTHORIZE" for PactPay 2PC Escrow
	PayPalRequestID string `json:"paypal_request_id"`
	AmountCents     int64  `json:"amount_cents"`
	CurrencyCode    string `json:"currency_code"`
	MerchantEmail   string `json:"merchant_email"`
	Description     string `json:"description"`
}

type OrderAuthorizationResponse struct {
	OrderID         string `json:"order_id"`
	AuthorizationID string `json:"authorization_id"`
	Status          string `json:"status"` // "CREATED" | "AUTHORIZED"
	ExpirationTime  string `json:"expiration_time"`
}
