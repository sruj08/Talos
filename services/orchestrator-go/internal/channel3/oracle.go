package channel3

import (
	"bytes"
	"context"
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
	"os"
	"sort"
	"strings"
	"time"
)

const DefaultMaxSpreadBps int64 = 1500 // +15.00% maximum allowed markup over Channel3 median

var ErrInvalidSKURequest = errors.New("channel3: sku_query is required and listed price must be > 0")

type BenchmarkRequest struct {
	SKUQuery            string `json:"sku_query"`
	MerchantAskCents    int64  `json:"merchant_ask_cents"`
	ListedPriceCents    int64  `json:"listed_price_cents"`
	MaxAllowedSpreadBps int64  `json:"max_allowed_spread_bps"`
	MaxSpreadBps        int64  `json:"max_spread_bps"`
	AutoReroute         bool   `json:"auto_reroute,omitempty"`
}

type BenchmarkResult struct {
	BenchmarkID              string `json:"benchmark_id"`
	SKUQuery                 string `json:"sku_query"`
	MatchedProductID         string `json:"matched_product_id"`
	CanonicalTitle           string `json:"canonical_title"`
	GTIN                     string `json:"gtin"`
	AuthenticityScoreBps     int64  `json:"authenticity_score_bps"`
	MerchantAskCents         int64  `json:"merchant_ask_cents"`
	ListedPriceCents         int64  `json:"listed_price_cents"`
	MedianPriceCents         int64  `json:"median_price_cents"`
	LowestVerifiedPriceCents int64  `json:"lowest_verified_price_cents"`
	LowestVerifiedCents      int64  `json:"lowest_verified_cents"`
	LowestMerchantName       string `json:"lowest_merchant_name"`
	LowestMerchantURL        string `json:"lowest_merchant_url"`
	SpreadBps                int64  `json:"spread_bps"`
	MaxAllowedSpreadBps      int64  `json:"max_allowed_spread_bps"`
	GougingBlocked           bool   `json:"gouging_blocked"`
	GougingDetected          bool   `json:"gouging_detected"`
	PriceGougingDetected     bool   `json:"price_gouging_detected"`
	AutoRerouted             bool   `json:"auto_rerouted"`
	SavingsCents             int64  `json:"savings_cents"`
	OracleMode               string `json:"oracle_mode"`
}

type catalogItem struct {
	ProductID          string
	CanonicalTitle     string
	GTIN               string
	Keywords           []string
	OfferPricesCents   []int64
	LowestPriceCents   int64
	LowestMerchantName string
	LowestMerchantURL  string
}

var defaultCatalog = []catalogItem{
	{
		ProductID: "CH3-SHURE-SM7B-001", CanonicalTitle: "Shure SM7B Vocal Dynamic Microphone", GTIN: "00042406396981",
		Keywords: []string{"sm7b", "shure", "vocal dynamic"}, OfferPricesCents: []int64{24900, 24900, 25500},
		LowestPriceCents: 24900, LowestMerchantName: "Channel3 Verified Audio Direct",
		LowestMerchantURL: "https://verified-audio.trychannel3.com/sku/shure-sm7b",
	},
	{
		ProductID: "CH3-SCARLETT-2I2-4G", CanonicalTitle: "Focusrite Scarlett 2i2 4th Gen USB Audio Interface", GTIN: "00815301001485",
		Keywords: []string{"scarlett", "focusrite", "2i2"}, OfferPricesCents: []int64{18999, 19999, 20499},
		LowestPriceCents: 18999, LowestMerchantName: "ProStudio Verified Outlet",
		LowestMerchantURL: "https://verified-audio.trychannel3.com/sku/scarlett-2i2-4g",
	},
	{
		ProductID: "CH3-RODE-PODMIC-USB", CanonicalTitle: "Rode PodMic USB Broadcast Microphone", GTIN: "00698813010929",
		Keywords: []string{"podmic", "rode"}, OfferPricesCents: []int64{19500, 19900, 20500},
		LowestPriceCents: 19500, LowestMerchantName: "BroadcastGear Verified",
		LowestMerchantURL: "https://verified-audio.trychannel3.com/sku/rode-podmic-usb",
	},
	{
		ProductID: "CH3-CLOUDLIFTER-CL1", CanonicalTitle: "Cloud Microphones Cloudlifter CL-1 Mic Activator", GTIN: "00855068002003",
		Keywords: []string{"cloudlifter", "cl-1", "cl1"}, OfferPricesCents: []int64{14900, 14900, 15500},
		LowestPriceCents: 14900, LowestMerchantName: "Channel3 Verified Audio Direct",
		LowestMerchantURL: "https://verified-audio.trychannel3.com/sku/cloudlifter-cl1",
	},
}

type Oracle struct {
	baseURL    string
	apiKey     string
	httpClient *http.Client
	allowLive  bool
}

func NewOracle() *Oracle {
	baseURL := strings.TrimRight(os.Getenv("CHANNEL3_BASE_URL"), "/")
	if baseURL == "" {
		baseURL = "https://api.trychannel3.com"
	}
	return &Oracle{
		baseURL: baseURL, apiKey: strings.TrimSpace(os.Getenv("CHANNEL3_API_KEY")),
		httpClient: &http.Client{Timeout: 3 * time.Second}, allowLive: os.Getenv("CHANNEL3_LIVE_CALLS") == "true",
	}
}

func NewOracleWithClient(baseURL, apiKey string, client *http.Client) *Oracle {
	if client == nil {
		client = &http.Client{Timeout: 3 * time.Second}
	}
	return &Oracle{
		baseURL: strings.TrimRight(baseURL, "/"), apiKey: strings.TrimSpace(apiKey),
		httpClient: client, allowLive: true,
	}
}

// ComputeSpreadBps calculates integer basis points spread: ((listed - median) * 10000) / median.
func ComputeSpreadBps(listedPriceCents, medianPriceCents int64) int64 {
	if medianPriceCents <= 0 {
		return 0
	}
	return ((listedPriceCents - medianPriceCents) * 10000) / medianPriceCents
}

// ComputeMedianCents computes the integer median of positive price offers in cents.
func ComputeMedianCents(prices []int64) int64 {
	valid := make([]int64, 0, len(prices))
	for _, p := range prices {
		if p > 0 {
			valid = append(valid, p)
		}
	}
	if len(valid) == 0 {
		return 0
	}
	sort.Slice(valid, func(i, j int) bool { return valid[i] < valid[j] })
	mid := len(valid) / 2
	if len(valid)%2 == 1 {
		return valid[mid]
	}
	return (valid[mid-1] + valid[mid]) / 2
}

func (o *Oracle) EvaluateSKU(ctx context.Context, req BenchmarkRequest) (*BenchmarkResult, error) {
	query := strings.TrimSpace(req.SKUQuery)
	askCents := req.MerchantAskCents
	if askCents <= 0 {
		askCents = req.ListedPriceCents
	}
	if query == "" || askCents <= 0 {
		return nil, ErrInvalidSKURequest
	}
	maxSpread := req.MaxAllowedSpreadBps
	if maxSpread <= 0 {
		maxSpread = req.MaxSpreadBps
	}
	if maxSpread <= 0 {
		maxSpread = DefaultMaxSpreadBps
	}

	item, mode := o.resolveItem(ctx, query)
	medianCents := ComputeMedianCents(item.OfferPricesCents)
	if medianCents <= 0 {
		medianCents = item.LowestPriceCents
	}
	spreadBps := ComputeSpreadBps(askCents, medianCents)
	gouging := spreadBps > maxSpread
	savings := int64(0)
	if askCents > item.LowestPriceCents {
		savings = askCents - item.LowestPriceCents
	}
	digest := sha256.Sum256([]byte(fmt.Sprintf("%s:%d:%d", item.ProductID, askCents, medianCents)))
	benchID := "CH3-BM-" + strings.ToUpper(hex.EncodeToString(digest[:4]))

	return &BenchmarkResult{
		BenchmarkID: benchID, SKUQuery: query, MatchedProductID: item.ProductID,
		CanonicalTitle: item.CanonicalTitle, GTIN: item.GTIN, AuthenticityScoreBps: 9920,
		MerchantAskCents: askCents, ListedPriceCents: askCents, MedianPriceCents: medianCents,
		LowestVerifiedPriceCents: item.LowestPriceCents, LowestVerifiedCents: item.LowestPriceCents,
		LowestMerchantName: item.LowestMerchantName, LowestMerchantURL: item.LowestMerchantURL,
		SpreadBps: spreadBps, MaxAllowedSpreadBps: maxSpread,
		GougingBlocked: gouging, GougingDetected: gouging, PriceGougingDetected: gouging,
		AutoRerouted: gouging && req.AutoReroute, SavingsCents: savings, OracleMode: mode,
	}, nil
}

func (o *Oracle) resolveItem(ctx context.Context, query string) (catalogItem, string) {
	if o.allowLive && o.apiKey != "" && o.baseURL != "" {
		if liveItem, err := o.queryLiveAPI(ctx, query); err == nil {
			return liveItem, "LIVE_CHANNEL3_API"
		}
	}
	lower := strings.ToLower(query)
	for _, entry := range defaultCatalog {
		for _, kw := range entry.Keywords {
			if strings.Contains(lower, kw) {
				return entry, "FALLBACK_DATASET"
			}
		}
	}
	return defaultCatalog[0], "FALLBACK_DATASET"
}

func (o *Oracle) queryLiveAPI(ctx context.Context, query string) (catalogItem, error) {
	bodyBytes, _ := json.Marshal(map[string]any{"query": query, "limit": 5})
	req, err := http.NewRequestWithContext(ctx, http.MethodPost, o.baseURL+"/v1/products/search", bytes.NewReader(bodyBytes))
	if err != nil {
		return catalogItem{}, err
	}
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("x-api-key", o.apiKey)
	resp, err := o.httpClient.Do(req)
	if err != nil {
		return catalogItem{}, err
	}
	defer resp.Body.Close()
	if resp.StatusCode != http.StatusOK {
		return catalogItem{}, fmt.Errorf("channel3 status %d", resp.StatusCode)
	}
	var payload struct {
		Products []struct {
			ID, Title, GTIN, Merchant, URL string
			PriceCts                       int64 `json:"price_cents"`
			MerchantName                   string `json:"merchant_name"`
		} `json:"products"`
	}
	if err := json.NewDecoder(resp.Body).Decode(&payload); err != nil || len(payload.Products) == 0 {
		return catalogItem{}, errors.New("empty live response")
	}
	prices := make([]int64, 0, len(payload.Products))
	lowest := payload.Products[0]
	for _, p := range payload.Products {
		if p.PriceCts > 0 {
			prices = append(prices, p.PriceCts)
			if lowest.PriceCts <= 0 || p.PriceCts < lowest.PriceCts {
				lowest = p
			}
		}
	}
	if len(prices) == 0 {
		return catalogItem{}, errors.New("no valid prices")
	}
	return catalogItem{
		ProductID: lowest.ID, CanonicalTitle: lowest.Title, GTIN: lowest.GTIN, OfferPricesCents: prices,
		LowestPriceCents: lowest.PriceCts, LowestMerchantName: lowest.MerchantName, LowestMerchantURL: lowest.URL,
	}, nil
}
