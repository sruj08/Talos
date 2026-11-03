package paypalapimatic

import (
	"context"
	"errors"
	"net/http"
	"strings"
)

// TrackerPayload models a PayPal Tracking v1 tracker entry (`POST /v1/shipping/trackers-batch`).
type TrackerPayload struct {
	TransactionID  string `json:"transaction_id"`
	TrackingNumber string `json:"tracking_number"`
	Carrier        string `json:"carrier"`
	Status         string `json:"status"`
}

// TrackersBatchRequest wraps multiple trackers for POST /v1/shipping/trackers-batch.
type TrackersBatchRequest struct {
	Trackers []TrackerPayload `json:"trackers"`
}

// TrackersBatchResponse models the PayPal Tracking v1 batch creation response.
type TrackersBatchResponse struct {
	TrackerIdentifiers []TrackerPayload `json:"tracker_identifiers"`
	RequestID          string           `json:"request_id"`
	FallbackReplay     bool             `json:"fallback_replay"`
}

// CreateTrackingBatch invokes POST /v1/shipping/trackers-batch with PayPal-Request-Id header.
func (c *Client) CreateTrackingBatch(ctx context.Context, paypalRequestID string, trackers []TrackerPayload) (*TrackersBatchResponse, error) {
	requestID := strings.TrimSpace(paypalRequestID)
	if requestID == "" {
		return nil, ErrMissingRequestID
	}
	if len(trackers) == 0 {
		return nil, errors.New("paypal-go-apimatic: trackers slice must not be empty")
	}
	for _, t := range trackers {
		if strings.TrimSpace(t.TransactionID) == "" || strings.TrimSpace(t.TrackingNumber) == "" {
			return nil, ErrEmptyIdentifier
		}
	}

	if c.FallbackMode {
		copied := make([]TrackerPayload, len(trackers))
		copy(copied, trackers)
		return &TrackersBatchResponse{
			TrackerIdentifiers: copied,
			RequestID:          requestID,
			FallbackReplay:     true,
		}, nil
	}

	wireReq := TrackersBatchRequest{Trackers: trackers}
	var wireResp TrackersBatchResponse
	if _, err := c.doJSON(ctx, http.MethodPost, "/v1/shipping/trackers-batch", requestID, wireReq, &wireResp); err != nil {
		return nil, err
	}
	if len(wireResp.TrackerIdentifiers) == 0 {
		wireResp.TrackerIdentifiers = trackers
	}
	wireResp.RequestID = requestID
	return &wireResp, nil
}
