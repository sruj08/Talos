package paypalapimatic

import (
	"context"
	"fmt"
	"net/http"
	"strings"
)

// TrackerPayload models POST /v1/shipping/trackers-batch (@paypal/agent-toolkit create_tracking).
type TrackerPayload struct {
	TransactionID  string `json:"transaction_id"`
	TrackingNumber string `json:"tracking_number"`
	Status         string `json:"status"` // "SHIPPED" | "IN_TRANSIT" | "DELIVERED"
	Carrier        string `json:"carrier"`
}

// TrackingBatchRequest wraps multiple shipment trackers for POST /v1/shipping/trackers-batch.
type TrackingBatchRequest struct {
	Trackers []TrackerPayload `json:"trackers"`
}

// TrackerIdentifier models the PayPal Shipment Tracking v1 identifier pair.
type TrackerIdentifier struct {
	TransactionID  string `json:"transaction_id"`
	TrackingNumber string `json:"tracking_number"`
}

// TrackingBatchResponse models the response from POST /v1/shipping/trackers-batch.
type TrackingBatchResponse struct {
	TrackerIdentifiers []TrackerIdentifier `json:"tracker_identifiers"`
	PayPalTrackerID    string              `json:"paypal_tracker_id"`
	Status             string              `json:"status"`
	PayPalRequestID    string              `json:"paypal_request_id"`
	SandboxMode        string              `json:"sandbox_mode"`
}

// CreateTrackingBatch invokes POST /v1/shipping/trackers-batch with PayPal-Request-Id idempotency.
func (c *Client) CreateTrackingBatch(ctx context.Context, req TrackingBatchRequest, requestID string) (*TrackingBatchResponse, error) {
	reqID := strings.TrimSpace(requestID)
	if reqID == "" {
		return nil, ErrMissingPayPalRequestID
	}
	if len(req.Trackers) == 0 {
		return nil, ErrEmptyIdentifier
	}
	first := req.Trackers[0]
	if strings.TrimSpace(first.TransactionID) == "" || strings.TrimSpace(first.TrackingNumber) == "" {
		return nil, ErrEmptyIdentifier
	}

	var wireResp TrackingBatchResponse
	status, _, err := c.DoRequest(ctx, http.MethodPost, "/v1/shipping/trackers-batch", reqID, req, &wireResp)
	if err == nil && (status == http.StatusOK || status == http.StatusCreated) {
		trackerID := fmt.Sprintf("%s-%s", first.TransactionID, first.TrackingNumber)
		if len(wireResp.TrackerIdentifiers) == 0 {
			wireResp.TrackerIdentifiers = []TrackerIdentifier{
				{TransactionID: first.TransactionID, TrackingNumber: first.TrackingNumber},
			}
		}
		wireResp.PayPalTrackerID = trackerID
		wireResp.Status = first.Status
		wireResp.PayPalRequestID = reqID
		wireResp.SandboxMode = "LIVE"
		return &wireResp, nil
	}
	if !c.Config.FallbackReplay {
		if err != nil {
			return nil, err
		}
		return nil, fmt.Errorf("paypal trackers-batch returned status %d", status)
	}

	return &TrackingBatchResponse{
		TrackerIdentifiers: []TrackerIdentifier{
			{TransactionID: first.TransactionID, TrackingNumber: first.TrackingNumber},
		},
		PayPalTrackerID: fmt.Sprintf("%s-%s", first.TransactionID, first.TrackingNumber),
		Status:          first.Status,
		PayPalRequestID: reqID,
		SandboxMode:     "RECORDED_REPLAY",
	}, nil
}

// RegisterShipmentTracker is a convenience helper wrapping CreateTrackingBatch for a single tracker.
func (c *Client) RegisterShipmentTracker(ctx context.Context, tracker TrackerPayload, requestID string) (*TrackingBatchResponse, error) {
	return c.CreateTrackingBatch(ctx, TrackingBatchRequest{Trackers: []TrackerPayload{tracker}}, requestID)
}
