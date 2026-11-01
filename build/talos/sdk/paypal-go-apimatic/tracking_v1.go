package paypalapimatic

// TrackerPayload models POST /v1/shipping/trackers-batch (@paypal/agent-toolkit create_tracking).
type TrackerPayload struct {
	TransactionID  string `json:"transaction_id"`
	TrackingNumber string `json:"tracking_number"`
	Status         string `json:"status"` // "SHIPPED" | "DELIVERED"
	Carrier        string `json:"carrier"`
}
