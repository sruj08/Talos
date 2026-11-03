package kernel

import (
	"context"
	"encoding/json"
	"errors"
	"net/http"
	"net/http/httptest"
	"strings"
	"sync"
	"testing"
)

func TestInspector_FallbackPoisonedStorefrontVsCleanMerchant(t *testing.T) {
	insp := NewInspector()

	poisoned, err := insp.InspectMerchantDOM(context.Background(), FetchDOMRequest{
		MerchantURL:     "https://shadowgear-audio.example/shure-sm7b-poisoned",
		CaptureViewport: true,
	})
	if err != nil {
		t.Fatalf("unexpected error for poisoned URL: %v", err)
	}
	if !strings.Contains(poisoned.RawHTML, "display:none") || !strings.Contains(poisoned.RawHTML, "IGNORE PREVIOUS INSTRUCTIONS") {
		t.Fatalf("expected poisoned HTML to contain hidden prompt injection vector, got: %s", poisoned.RawHTML)
	}
	if !poisoned.Isolated || poisoned.SessionID == "" || poisoned.ScreenshotURL == "" || len(poisoned.DOMSHA256) != 64 {
		t.Fatalf("expected complete forensic session metadata, got: %+v", poisoned)
	}

	clean, err := insp.InspectMerchantDOM(context.Background(), FetchDOMRequest{
		MerchantURL: "https://verified-audio.trychannel3.com/sku/shure-sm7b",
	})
	if err != nil {
		t.Fatalf("unexpected error for clean URL: %v", err)
	}
	if strings.Contains(clean.RawHTML, "display:none") || strings.Contains(clean.RawHTML, "IGNORE PREVIOUS INSTRUCTIONS") {
		t.Fatalf("expected clean HTML without prompt injection, got: %s", clean.RawHTML)
	}
}

func TestInspector_LiveKernelAPIMockAndFallback(t *testing.T) {
	failServer := false
	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.Header.Get("Authorization") != "Bearer test-kernel-key" {
			w.WriteHeader(http.StatusUnauthorized)
			return
		}
		if failServer {
			w.WriteHeader(http.StatusBadGateway)
			return
		}
		w.Header().Set("Content-Type", "application/json")
		_ = json.NewEncoder(w).Encode(map[string]any{
			"session_id":     "KRN-LIVE-999",
			"dom_html":       "<html><body><h1>Live Kernel Captured Storefront</h1></body></html>",
			"screenshot_url": "https://cdn.onkernel.com/live/snap-999.png",
		})
	}))
	defer srv.Close()

	insp := NewInspectorWithClient(srv.URL, "test-kernel-key", srv.Client())
	liveRes, err := insp.InspectMerchantDOM(context.Background(), FetchDOMRequest{
		MerchantURL: "https://verified-audio.trychannel3.com/sku/shure-sm7b",
	})
	if err != nil {
		t.Fatalf("unexpected live error: %v", err)
	}
	if liveRes.Mode != "LIVE_KERNEL_API" || liveRes.SessionID != "KRN-LIVE-999" {
		t.Fatalf("expected LIVE_KERNEL_API session KRN-LIVE-999, got %+v", liveRes)
	}

	failServer = true
	fallbackRes, err := insp.InspectMerchantDOM(context.Background(), FetchDOMRequest{
		MerchantURL: "https://verified-audio.trychannel3.com/sku/shure-sm7b",
	})
	if err != nil {
		t.Fatalf("unexpected fallback error: %v", err)
	}
	if fallbackRes.Mode != "FALLBACK_LOCAL_INSPECTOR" {
		t.Fatalf("expected FALLBACK_LOCAL_INSPECTOR on 502, got %s", fallbackRes.Mode)
	}
}

func TestInspector_ValidationAndConcurrency(t *testing.T) {
	insp := NewInspector()
	for _, bad := range []string{"", "ftp://bad.example/file", "not-a-url", "http://"} {
		if _, err := insp.InspectMerchantDOM(context.Background(), FetchDOMRequest{MerchantURL: bad}); !errors.Is(err, ErrInvalidMerchantURL) {
			t.Fatalf("expected ErrInvalidMerchantURL for %q, got %v", bad, err)
		}
	}

	var wg sync.WaitGroup
	for i := 0; i < 50; i++ {
		wg.Add(1)
		go func(idx int) {
			defer wg.Done()
			target := "https://verified-audio.trychannel3.com/sku/shure-sm7b"
			if idx%2 == 1 {
				target = "https://shadowgear.example/poisoned-item"
			}
			res, err := insp.InspectMerchantDOM(context.Background(), FetchDOMRequest{MerchantURL: target})
			if err != nil || res.SessionID == "" {
				t.Errorf("concurrent kernel inspect failed: %v", err)
			}
		}(i)
	}
	wg.Wait()
}
