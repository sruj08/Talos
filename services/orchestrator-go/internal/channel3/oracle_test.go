package channel3

import (
	"context"
	"encoding/json"
	"errors"
	"net/http"
	"net/http/httptest"
	"sync"
	"testing"
)

func TestComputeSpreadBps_ShureSM7BGouging(t *testing.T) {
	if got := ComputeSpreadBps(48000, 24900); got != 9277 {
		t.Fatalf("expected +9277 bps for $480 vs $249 median, got %d", got)
	}
	if got := ComputeSpreadBps(24900, 24900); got != 0 {
		t.Fatalf("expected 0 bps for parity price, got %d", got)
	}
	if got := ComputeSpreadBps(22410, 24900); got != -1000 {
		t.Fatalf("expected -1000 bps for 10%% discount, got %d", got)
	}
	if got := ComputeSpreadBps(48000, 0); got != 0 {
		t.Fatalf("expected 0 bps on zero median guard, got %d", got)
	}
	if got := ComputeSpreadBps(48000, -100); got != 0 {
		t.Fatalf("expected 0 bps on negative median guard, got %d", got)
	}
}

func TestComputeMedianCents_EdgeCases(t *testing.T) {
	if got := ComputeMedianCents([]int64{25500, 24900, 24900}); got != 24900 {
		t.Fatalf("expected 24900 odd median, got %d", got)
	}
	if got := ComputeMedianCents([]int64{26000, 24000}); got != 25000 {
		t.Fatalf("expected 25000 even median, got %d", got)
	}
	if got := ComputeMedianCents([]int64{0, -500, 30000, 10000, 20000}); got != 20000 {
		t.Fatalf("expected 20000 filtered median, got %d", got)
	}
	if got := ComputeMedianCents(nil); got != 0 {
		t.Fatalf("expected 0 for nil slice, got %d", got)
	}
	if got := ComputeMedianCents([]int64{0, -10}); got != 0 {
		t.Fatalf("expected 0 for non-positive slice, got %d", got)
	}
}

func TestOracle_ShureSM7B_Blocks480GougingAndReroutesTo249(t *testing.T) {
	oracle := NewOracle()
	res, err := oracle.EvaluateSKU(context.Background(), BenchmarkRequest{
		SKUQuery:            "Shure SM7B Vocal Dynamic Microphone",
		MerchantAskCents:    48000,
		MaxAllowedSpreadBps: 1500,
		AutoReroute:         true,
	})
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if res.MedianPriceCents != 24900 {
		t.Fatalf("expected median 24900 cents ($249.00), got %d", res.MedianPriceCents)
	}
	if res.SpreadBps != 9277 {
		t.Fatalf("expected spread_bps 9277, got %d", res.SpreadBps)
	}
	if !res.GougingBlocked || !res.GougingDetected || !res.PriceGougingDetected {
		t.Fatalf("expected gouging flags to be true for +9277 bps spread")
	}
	if !res.AutoRerouted {
		t.Fatalf("expected auto_rerouted true when AutoReroute requested")
	}
	if res.LowestVerifiedPriceCents != 24900 {
		t.Fatalf("expected lowest verified price 24900 cents, got %d", res.LowestVerifiedPriceCents)
	}
	if res.LowestMerchantURL != "https://verified-audio.trychannel3.com/sku/shure-sm7b" {
		t.Fatalf("unexpected lowest merchant url: %s", res.LowestMerchantURL)
	}
	if res.SavingsCents != 23100 {
		t.Fatalf("expected savings 23100 cents ($231.00), got %d", res.SavingsCents)
	}
}

func TestOracle_FairPriceWithinSpreadPasses(t *testing.T) {
	oracle := NewOracle()
	res, err := oracle.EvaluateSKU(context.Background(), BenchmarkRequest{
		SKUQuery:         "Shure SM7B",
		ListedPriceCents: 25900, // +401 bps (< 1500 bps cap)
	})
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if res.GougingBlocked {
		t.Fatalf("expected fair price (+401 bps) not to be blocked, got spread %d", res.SpreadBps)
	}
	if res.SpreadBps != 401 {
		t.Fatalf("expected spread 401 bps, got %d", res.SpreadBps)
	}
}

func TestOracle_LiveChannel3APIServerAndFallback(t *testing.T) {
	failMode := false
	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.Header.Get("x-api-key") != "test-ch3-key" {
			w.WriteHeader(http.StatusUnauthorized)
			return
		}
		if failMode {
			w.WriteHeader(http.StatusServiceUnavailable)
			return
		}
		w.Header().Set("Content-Type", "application/json")
		_ = json.NewEncoder(w).Encode(map[string]any{
			"products": []map[string]any{
				{
					"id":            "CH3-LIVE-SM7B",
					"title":         "Shure SM7B Studio Edition",
					"gtin":          "00042406396981",
					"price_cents":   24900,
					"merchant_name": "Sweetwater Verified",
					"url":           "https://verified-audio.trychannel3.com/sku/shure-sm7b",
				},
				{
					"id":            "CH3-LIVE-SM7B-2",
					"title":         "Shure SM7B Studio Edition",
					"gtin":          "00042406396981",
					"price_cents":   24900,
					"merchant_name": "B&H Verified",
					"url":           "https://verified-audio.trychannel3.com/sku/shure-sm7b-bh",
				},
			},
		})
	}))
	defer srv.Close()

	oracle := NewOracleWithClient(srv.URL, "test-ch3-key", srv.Client())
	res, err := oracle.EvaluateSKU(context.Background(), BenchmarkRequest{
		SKUQuery:         "Shure SM7B",
		MerchantAskCents: 48000,
	})
	if err != nil {
		t.Fatalf("unexpected live error: %v", err)
	}
	if res.OracleMode != "LIVE_CHANNEL3_API" {
		t.Fatalf("expected LIVE_CHANNEL3_API mode, got %s", res.OracleMode)
	}
	if res.MatchedProductID != "CH3-LIVE-SM7B" || res.SpreadBps != 9277 {
		t.Fatalf("unexpected live product match or spread: %+v", res)
	}

	failMode = true
	fallbackRes, err := oracle.EvaluateSKU(context.Background(), BenchmarkRequest{
		SKUQuery:         "Focusrite Scarlett 2i2",
		MerchantAskCents: 19999,
	})
	if err != nil {
		t.Fatalf("unexpected fallback error: %v", err)
	}
	if fallbackRes.OracleMode != "FALLBACK_DATASET" {
		t.Fatalf("expected FALLBACK_DATASET on 503, got %s", fallbackRes.OracleMode)
	}
}

func TestOracle_ValidationAndConcurrency(t *testing.T) {
	oracle := NewOracle()
	if _, err := oracle.EvaluateSKU(context.Background(), BenchmarkRequest{SKUQuery: "", MerchantAskCents: 1000}); !errors.Is(err, ErrInvalidSKURequest) {
		t.Fatalf("expected ErrInvalidSKURequest for empty SKU, got %v", err)
	}
	if _, err := oracle.EvaluateSKU(context.Background(), BenchmarkRequest{SKUQuery: "SM7B", MerchantAskCents: 0}); !errors.Is(err, ErrInvalidSKURequest) {
		t.Fatalf("expected ErrInvalidSKURequest for zero price, got %v", err)
	}

	var wg sync.WaitGroup
	for i := 0; i < 50; i++ {
		wg.Add(1)
		go func(idx int) {
			defer wg.Done()
			ask := int64(24900)
			if idx%2 == 0 {
				ask = 48000
			}
			r, err := oracle.EvaluateSKU(context.Background(), BenchmarkRequest{
				SKUQuery:         "Shure SM7B",
				MerchantAskCents: ask,
			})
			if err != nil || r.MedianPriceCents != 24900 {
				t.Errorf("concurrent evaluation failed: %v", err)
			}
		}(i)
	}
	wg.Wait()
}
