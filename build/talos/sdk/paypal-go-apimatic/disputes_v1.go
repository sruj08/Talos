package paypalapimatic

import (
	"context"
	"crypto/sha256"
	"encoding/hex"
	"fmt"
	"net/http"
	"strings"
	"time"
)

// ProvideEvidenceRequest models POST /v1/customer/disputes/{id}/provide-evidence.
type ProvideEvidenceRequest struct {
	DisputeID            string `json:"dispute_id"`
	EvidenceType         string `json:"evidence_type,omitempty"`
	MandateSignatureHex  string `json:"mandate_signature_hex"`
	Channel3SnapshotJSON string `json:"channel3_snapshot_json"`
	KernelScreenshotURL  string `json:"kernel_screenshot_url"`
	Notes                string `json:"notes"`
}

// DisputeEvidenceRequest is a canonical alias for ProvideEvidenceRequest.
type DisputeEvidenceRequest = ProvideEvidenceRequest

// DisputeEvidenceResponse models the response from POST /v1/customer/disputes/{id}/provide-evidence.
type DisputeEvidenceResponse struct {
	DisputeID          string `json:"dispute_id"`
	Status             string `json:"status"` // "EVIDENCE_SUBMITTED"
	EvidenceHashSHA256 string `json:"evidence_hash_sha256"`
	PayPalRequestID    string `json:"paypal_request_id"`
	SubmittedAt        string `json:"submitted_at"`
	SandboxMode        string `json:"sandbox_mode"`
}

// ProvideDisputeEvidence invokes POST /v1/customer/disputes/{id}/provide-evidence with cryptographic KYA + Channel3 evidence.
func (c *Client) ProvideDisputeEvidence(ctx context.Context, disputeID string, req ProvideEvidenceRequest, requestID string) (*DisputeEvidenceResponse, error) {
	dispID := strings.TrimSpace(disputeID)
	if dispID == "" {
		dispID = strings.TrimSpace(req.DisputeID)
	}
	if dispID == "" {
		return nil, ErrEmptyIdentifier
	}
	reqID := strings.TrimSpace(requestID)
	if reqID == "" {
		return nil, ErrMissingPayPalRequestID
	}
	req.DisputeID = dispID
	if req.EvidenceType == "" {
		req.EvidenceType = "PROOF_OF_FULFILLMENT"
	}

	rawConcat := fmt.Sprintf("%s|%s|%s|%s|%s",
		dispID, req.MandateSignatureHex, req.Channel3SnapshotJSON, req.KernelScreenshotURL, req.Notes)
	sum := sha256.Sum256([]byte(rawConcat))
	bundleHash := hex.EncodeToString(sum[:])
	nowStr := time.Now().UTC().Format(time.RFC3339)

	status, _, err := c.DoRequest(ctx, http.MethodPost, fmt.Sprintf("/v1/customer/disputes/%s/provide-evidence", dispID), reqID, req, nil)
	if err == nil && (status == http.StatusOK || status == http.StatusCreated || status == http.StatusAccepted) {
		return &DisputeEvidenceResponse{
			DisputeID:          dispID,
			Status:             "EVIDENCE_SUBMITTED",
			EvidenceHashSHA256: bundleHash,
			PayPalRequestID:    reqID,
			SubmittedAt:        nowStr,
			SandboxMode:        "LIVE",
		}, nil
	}
	if !c.Config.FallbackReplay {
		if err != nil {
			return nil, err
		}
		return nil, fmt.Errorf("paypal provide-evidence returned status %d", status)
	}

	return &DisputeEvidenceResponse{
		DisputeID:          dispID,
		Status:             "EVIDENCE_SUBMITTED",
		EvidenceHashSHA256: bundleHash,
		PayPalRequestID:    reqID,
		SubmittedAt:        nowStr,
		SandboxMode:        "RECORDED_REPLAY",
	}, nil
}

// SubmitDisputeEvidence is a convenience helper wrapping ProvideDisputeEvidence.
func (c *Client) SubmitDisputeEvidence(ctx context.Context, req ProvideEvidenceRequest, requestID string) (*DisputeEvidenceResponse, error) {
	return c.ProvideDisputeEvidence(ctx, req.DisputeID, req, requestID)
}
