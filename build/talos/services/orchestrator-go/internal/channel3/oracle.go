// Package channel3 implements the Channel3 Fair-Market Price & SKU Authenticity Oracle (F-04, API-06).
package channel3

type BenchmarkResult struct {
	SKUQuery                 string `json:"sku_query"`
	MatchedProductID         string `json:"matched_product_id"`
	ListedPriceCents         int64  `json:"listed_price_cents"`
	MedianPriceCents         int64  `json:"median_price_cents"`
	LowestVerifiedPriceCents int64  `json:"lowest_verified_price_cents"`
	LowestMerchantURL        string `json:"lowest_merchant_url"`
	SpreadBps                int64  `json:"spread_bps"`
	GougingDetected          bool   `json:"gouging_detected"`
}

func ComputeSpreadBps(listedCents, medianCents int64) int64 {
	if medianCents <= 0 {
		return 0
	}
	return ((listedCents - medianCents) * 10000) / medianCents
}
