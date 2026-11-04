package paypal

import (
	"context"
	"errors"
	"sync"
	"testing"

	paypalapimatic "github.com/talos/sdk/paypal-go-apimatic"
)

func TestSandboxServiceIdempotentAuthorizeCaptureVoidTrackAndDispute(t *testing.T) {
	ctx := context.Background()
	svc := NewSandboxService(paypalapimatic.NewClient(paypalapimatic.ClientConfig{
		BaseURL:        "https://api-m.sandbox.paypal.com",
		SandboxMode:    true,
		FallbackReplay: true,
	}))

	// 1. Missing PayPal-Request-Id must fail
	if _, err := svc.AuthorizeEscrow(ctx, paypalapimatic.CreateOrderRequest{AmountCents: 24900}, ""); !errors.Is(err, paypalapimatic.ErrMissingPayPalRequestID) {
		t.Fatalf("expected ErrMissingPayPalRequestID, got %v", err)
	}

	// 2. AuthorizeEscrow + idempotency cache check
	auth1, err := svc.AuthorizeEscrow(ctx, paypalapimatic.CreateOrderRequest{
		AmountCents:  24900,
		CurrencyCode: "USD",
		Description:  "Shure SM7B Verified Channel3 Hold",
	}, "req-auth-101")
	if err != nil || auth1.Status != "AUTHORIZED" || auth1.OrderID == "" || auth1.AuthorizationID == "" {
		t.Fatalf("AuthorizeEscrow failed: resp=%+v err=%v", auth1, err)
	}
	auth2, err := svc.AuthorizeEscrow(ctx, paypalapimatic.CreateOrderRequest{AmountCents: 99900}, "req-auth-101")
	if err != nil || auth2.AuthorizationID != auth1.AuthorizationID {
		t.Fatalf("expected idempotent cached AuthorizeEscrow result, got %+v vs %+v", auth2, auth1)
	}

	// 3. CaptureEscrow + idempotency cache check
	cap1, err := svc.CaptureEscrow(ctx, auth1.AuthorizationID, 24900, "USD", "req-cap-101")
	if err != nil || cap1.Status != "COMPLETED" || cap1.CaptureID == "" {
		t.Fatalf("CaptureEscrow failed: resp=%+v err=%v", cap1, err)
	}
	cap2, err := svc.CaptureEscrow(ctx, auth1.AuthorizationID, 24900, "USD", "req-cap-101")
	if err != nil || cap2.CaptureID != cap1.CaptureID {
		t.Fatalf("expected idempotent cached CaptureEscrow result, got %+v vs %+v", cap2, cap1)
	}

	// 4. VoidEscrow + idempotency cache check
	void1, err := svc.VoidEscrow(ctx, "2A883120944556677", "req-void-102")
	if err != nil || void1.Status != "VOIDED" || void1.HTTPStatusCode != 204 {
		t.Fatalf("VoidEscrow failed: resp=%+v err=%v", void1, err)
	}
	void2, err := svc.VoidEscrow(ctx, "2A883120944556677", "req-void-102")
	if err != nil || void2.VoidedAt != void1.VoidedAt {
		t.Fatalf("expected idempotent cached VoidEscrow result")
	}

	// 5. RegisterTracking & SubmitDisputeEvidence under concurrent goroutines
	var wg sync.WaitGroup
	for i := 0; i < 8; i++ {
		wg.Add(1)
		go func() {
			defer wg.Done()
			trk, tErr := svc.RegisterTracking(ctx, paypalapimatic.TrackerPayload{
				TransactionID:  cap1.CaptureID,
				TrackingNumber: "794892104852",
				Status:         "DELIVERED",
				Carrier:        "FEDEX",
			}, "req-trk-shared")
			if tErr != nil || trk.Status != "DELIVERED" {
				t.Errorf("RegisterTracking failed: %v", tErr)
			}
			disp, dErr := svc.SubmitDisputeEvidence(ctx, "PP-D-9901", paypalapimatic.ProvideEvidenceRequest{
				MandateSignatureHex:  "b1b1b1",
				Channel3SnapshotJSON: `{"sku":"Shure SM7B","median_cents":24900}`,
			}, "req-disp-shared")
			if dErr != nil || disp.Status != "EVIDENCE_SUBMITTED" {
				t.Errorf("SubmitDisputeEvidence failed: %v", dErr)
			}
		}()
	}
	wg.Wait()
}
