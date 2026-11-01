package paypalapimatic

// CaptureAuthorizationResponse models POST /v2/payments/authorizations/{authorization_id}/capture.
type CaptureAuthorizationResponse struct {
	CaptureID       string `json:"capture_id"`
	AuthorizationID string `json:"authorization_id"`
	Status          string `json:"status"` // "COMPLETED"
}

// VoidAuthorizationResponse models POST /v2/payments/authorizations/{authorization_id}/void.
type VoidAuthorizationResponse struct {
	AuthorizationID string `json:"authorization_id"`
	Status          string `json:"status"` // "VOIDED"
}
