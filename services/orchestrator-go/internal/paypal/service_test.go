package paypal

import (
	"context"
	"strings"
	"testing"

	paypalapimatic "github.com/talos/sdk/paypal-go-apimatic"
)

func TestSandboxServiceLifecycle(t *testing.T) {
	sdkClient := paypalapimatic.NewSandboxClient("", "")
	svc := NewSandboxService(sdkClient, "WH-TEST-001")
	if svc.ServiceName() != "paypal-sandbox-apimatic" {
		t.Fatalf("unexpected ServiceName: %s", svc.ServiceName())
	}

	ctx := context.Background()

	holdRes, err := svc.AuthorizeEscrowHold(ctx, HoldRequest{
		EscrowID:        "escrow_test_01",
		MandateID:       "mandate_test_01",
		AmountCents:     128000,
		CurrencyCode:    "USD",
		Description:     "Precision Milling Spindle",
		PayPalRequestID: "req-hold-01",
	})
	if err != nil {
		t.Fatalf("AuthorizeEscrowHold failed: %v", err)
	}
	if !strings.HasPrefix(holdRes.OrderID, "ORD-TALOS-") || !strings.HasPrefix(holdRes.AuthorizationID, "AUTH-TALOS-") {
		t.Fatalf("unexpected HoldResult IDs: %+v", holdRes)
	}

	capRes, err := svc.CaptureEscrowHold(ctx, CaptureRequest{
		AuthorizationID: holdRes.AuthorizationID,
		PayPalRequestID: "req-cap-01",
		AmountCents:     128000,
		CurrencyCode:    "USD",
		FinalCapture:    true,
	})
	if err != nil || !strings.HasPrefix(capRes.CaptureID, "CAP-TALOS-") || capRes.Status != "COMPLETED" {
		t.Fatalf("CaptureEscrowHold failed: res=%+v err=%v", capRes, err)
	}

	voidRes, err := svc.VoidEscrowHold(ctx, holdRes.AuthorizationID, "req-void-01")
	if err != nil || voidRes.Status != "VOIDED" {
		t.Fatalf("VoidEscrowHold failed: res=%+v err=%v", voidRes, err)
	}

	trackRes, err := svc.AttachTracking(ctx, "req-trk-01", capRes.CaptureID, "FDX-774829104", "FEDEX", "DELIVERED")
	if err != nil || len(trackRes.TrackerIdentifiers) != 1 {
		t.Fatalf("AttachTracking failed: res=%+v err=%v", trackRes, err)
	}

	dispRes, err := svc.SubmitDisputeEvidence(ctx, "req-disp-01", paypalapimatic.ProvideEvidenceRequest{
		DisputeID:        "PP-D-TALOS-101",
		EvidenceType:     "PROOF_OF_FULFILLMENT",
		Notes:            "Signed KYA mandate + carrier delivery",
		MandateSignature: "ed25519:sig_1",
		AuditHash:        "sha256:hash_1",
	})
	if err != nil || dispRes.Status != "UNDER_REVIEW" {
		t.Fatalf("SubmitDisputeEvidence failed: res=%+v err=%v", dispRes, err)
	}
}
