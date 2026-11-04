package channel3

import (
	"context"
	"sync"
	"testing"
	"time"
)

func TestShureSM7BPriceGougingSpreadAndFairPricePass(t *testing.T) {
	ctx, cancel := context.WithTimeout(context.Background(), 8*time.Second)
	defer cancel()

	// 1. Direct formula check: $480.00 (48000 cents) vs $249.00 (24900 cents) median = +9277 bps
	if got := ComputeSpreadBps(48000, 24900); got != 9277 {
		t.Fatalf("expected ComputeSpreadBps(48000, 24900) == 9277, got %d", got)
	}

	oracle := NewOracleClientFromEnv()

	// 2. Poisoned $480.00 Shure SM7B listing must be blocked (+9277 bps > 1500 bps) and rerouted to $249.00 verified merchant
	gouged, err := oracle.BenchmarkSKU(ctx, BenchmarkRequest{
		SKUQuery:            "Shure SM7B",
		MerchantAskCents:    48000,
		MaxAllowedSpreadBps: 1500,
	})
	if err != nil {
		t.Fatalf("BenchmarkSKU failed: %v", err)
	}
	if gouged.MedianPriceCents != 24900 || gouged.LowestVerifiedPriceCents != 24900 {
		t.Fatalf("expected median and lowest verified price 24900 cents, got median=%d lowest=%d", gouged.MedianPriceCents, gouged.LowestVerifiedPriceCents)
	}
	if gouged.SpreadBps != 9277 {
		t.Fatalf("expected SpreadBps=9277, got %d", gouged.SpreadBps)
	}
	if !gouged.GougingBlocked || !gouged.PriceGougingDetected || !gouged.AutoRerouted {
		t.Fatalf("expected GougingBlocked=true and AutoRerouted=true, got %+v", gouged)
	}
	if gouged.LowestMerchantURL != "https://verified-audio.trychannel3.com/sku/shure-sm7b" {
		t.Fatalf("unexpected LowestMerchantURL: %s", gouged.LowestMerchantURL)
	}
	if gouged.SavingsCents != 23100 {
		t.Fatalf("expected SavingsCents=23100 ($231.00), got %d", gouged.SavingsCents)
	}
	if oracle.HasLiveAPIKey() && gouged.OracleMode != "LIVE_CHANNEL3_API" {
		t.Fatalf("expected LIVE_CHANNEL3_API mode when CHANNEL3_API_KEY is present in .env, got %s", gouged.OracleMode)
	}

	// 3. Fair-price $249.00 Shure SM7B listing must pass with 0 bps spread
	fair, err := oracle.BenchmarkSKU(ctx, BenchmarkRequest{
		SKUQuery:            "Shure SM7B Vocal Dynamic Microphone",
		MerchantAskCents:    24900,
		MaxAllowedSpreadBps: 1500,
	})
	if err != nil {
		t.Fatalf("fair BenchmarkSKU failed: %v", err)
	}
	if fair.SpreadBps != 0 || fair.GougingBlocked {
		t.Fatalf("expected fair listing to pass with 0 bps and GougingBlocked=false, got %+v", fair)
	}

	// 4. Concurrent goroutine race check (fallback mode to avoid spamming remote API)
	localOracle := NewOracleClient("https://api.trychannel3.com/v1", "", nil)
	var wg sync.WaitGroup
	for i := 0; i < 10; i++ {
		wg.Add(1)
		go func(idx int) {
			defer wg.Done()
			ask := int64(24900)
			if idx%2 == 1 {
				ask = 48000
			}
			res, bErr := localOracle.BenchmarkAndVerifySKU(ctx, BenchmarkRequest{
				SKUQuery:         "Shure SM7B",
				MerchantAskCents: ask,
			})
			if bErr != nil || res.MedianPriceCents != 24900 {
				t.Errorf("concurrent BenchmarkAndVerifySKU failed: err=%v res=%+v", bErr, res)
			}
		}(i)
	}
	wg.Wait()
}
