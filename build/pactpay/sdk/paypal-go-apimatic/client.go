// Package paypalapimatic provides the strongly-typed Golang SDK generated via APIMatic
// from PayPal's official OpenAPI 3.0 specs (Orders v2, Payments Authorizations v2,
// Shipment Tracking v1, and Customer Disputes v1) + APIMatic Context Plugin definitions.
package paypalapimatic

import "net/http"

type ClientConfig struct {
	BaseURL      string
	ClientID     string
	ClientSecret string
	SandboxMode  bool
	HTTPClient   *http.Client
}

type Client struct {
	Config ClientConfig
}

func NewClient(cfg ClientConfig) *Client {
	if cfg.BaseURL == "" {
		cfg.BaseURL = "https://api-m.sandbox.paypal.com"
	}
	if cfg.HTTPClient == nil {
		cfg.HTTPClient = http.DefaultClient
	}
	return &Client{Config: cfg}
}
