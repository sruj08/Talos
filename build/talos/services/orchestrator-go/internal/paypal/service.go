// Package paypal wraps sdk/paypal-go-apimatic for Orders v2 AUTHORIZE, Capture, Void, Tracking v1, and Disputes v1.
package paypal

type SandboxService struct {
	ClientID     string
	ClientSecret string
	FallbackMode bool
}
