package paypalapimatic

// ProvideEvidenceRequest models POST /v1/customer/disputes/{id}/provide-evidence.
type ProvideEvidenceRequest struct {
	DisputeID            string `json:"dispute_id"`
	MandateSignatureHex  string `json:"mandate_signature_hex"`
	Channel3SnapshotJSON string `json:"channel3_snapshot_json"`
	KernelScreenshotURL  string `json:"kernel_screenshot_url"`
	Notes                string `json:"notes"`
}
