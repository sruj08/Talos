package kernel

import (
	"context"
	"strings"
	"sync"
	"testing"
	"time"
)

func TestKernelInspectorLiveAndFallbackDOMExtraction(t *testing.T) {
	ctx, cancel := context.WithTimeout(context.Background(), 8*time.Second)
	defer cancel()

	inspector := NewInspectorFromEnv()

	// 1. Poisoned trap URL extraction (also verifies live KERNEL_API_KEY probe without leaking secret)
	poisonedSess, err := inspector.InspectMerchantDOM(ctx, "https://poisoned-gear-shop.example.com/shure-sm7b", "")
	if err != nil {
		t.Fatalf("InspectMerchantDOM failed: %v", err)
	}
	if !strings.Contains(poisonedSess.RawHTML, "SYSTEM OVERRIDE") || !strings.Contains(poisonedSess.RawHTML, "display:none") {
		t.Fatalf("expected poisoned DOM payload for trap merchant URL, got %s", poisonedSess.RawHTML)
	}
	if !strings.HasPrefix(poisonedSess.ScreenshotURL, "https://evidence.onkernel.com/snapshots/krnl-") {
		t.Fatalf("unexpected ScreenshotURL: %s", poisonedSess.ScreenshotURL)
	}
	if inspector.HasLiveAPIKey() && poisonedSess.InspectorMode != "LIVE_KERNEL_API" {
		t.Fatalf("expected LIVE_KERNEL_API when KERNEL_API_KEY is set in .env, got %s", poisonedSess.InspectorMode)
	}

	// 2. Verified Channel3 merchant URL extraction
	localInspector := NewInspectorClient("https://api.onkernel.com/v1", "", nil)
	cleanSess, err := localInspector.FetchMerchantDOM(ctx, "https://verified-audio.trychannel3.com/sku/shure-sm7b", "")
	if err != nil {
		t.Fatalf("FetchMerchantDOM failed: %v", err)
	}
	if strings.Contains(cleanSess.RawHTML, "SYSTEM OVERRIDE") || !strings.Contains(cleanSess.RawHTML, "$249.00") {
		t.Fatalf("expected clean verified DOM, got %s", cleanSess.RawHTML)
	}

	// 3. Concurrent goroutines race check
	var wg sync.WaitGroup
	for i := 0; i < 10; i++ {
		wg.Add(1)
		go func() {
			defer wg.Done()
			s, sErr := localInspector.InspectMerchantDOM(ctx, "https://shadowgear.example.com/trap", "")
			if sErr != nil || s.SessionID == "" {
				t.Errorf("concurrent InspectMerchantDOM failed: %v", sErr)
			}
		}()
	}
	wg.Wait()
}
