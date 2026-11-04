// Package telemetry configures OpenTelemetry trace export and Elasticsearch vector threat indexing for Elastic Cloud.
package telemetry

import (
	"crypto/sha256"
	"encoding/hex"
	"fmt"
	"math"
	"net/http"
	"os"
	"path/filepath"
	"strings"
	"sync"
	"time"
)

type ElasticConfig struct {
	OTLPEndpoint     string
	APIKey           string
	ElasticsearchURL string
	ThreatIndexName  string
	ServiceName      string
}

type OTelSpan struct {
	TraceID      string         `json:"trace_id"`
	SpanID       string         `json:"span_id"`
	ParentSpanID string         `json:"parent_span_id"`
	Traceparent  string         `json:"traceparent"`
	Name         string         `json:"name"`
	ServiceName  string         `json:"service_name"`
	DurationUs   int64          `json:"duration_us"`
	Timestamp    string         `json:"timestamp"`
	ExportMode   string         `json:"export_mode"`
	Attributes   map[string]any `json:"attributes"`
}

type CheckoutTraceInput struct {
	Traceparent          string
	MandateID            string
	AgentID              string
	BuyerEmail           string
	RequestedAmountCents int64
	FirewallRiskScore    float64
	StrippedNodes        int
	DOMVerdict           string
	SKU                  string
	MedianCents          int64
	SpreadBps            int64
	PayPalOrderID        string
	PayPalAuthID         string
	PayPalRequestID      string
	TotalLatencyUs       int64
}

type ThreatVectorDoc struct {
	DocID             string    `json:"doc_id"`
	ScanID            string    `json:"scan_id"`
	TraceID           string    `json:"trace_id"`
	RawPayloadText    string    `json:"raw_payload_text"`
	AttackCategory    string    `json:"attack_category"`
	MerchantDomain    string    `json:"merchant_domain"`
	DebertaConfidence float64   `json:"deberta_confidence"`
	SimHashSignature  string    `json:"simhash_signature"`
	EmbeddingVector   []float64 `json:"embedding_vector"`
	IndexedAt         string    `json:"indexed_at"`
	StorageMode       string    `json:"storage_mode"`
}

type ThreatSimilarityHit struct {
	Doc              ThreatVectorDoc `json:"doc"`
	CosineSimilarity float64         `json:"cosine_similarity"`
}

type TelemetryEngine struct {
	Config     ElasticConfig
	HTTPClient *http.Client
	mu         sync.RWMutex
	spans      []OTelSpan
	threats    []ThreatVectorDoc
}

func isRealValue(v string) bool {
	v = strings.TrimSpace(v)
	return len(v) > 8 && !strings.Contains(v, "your-deployment") && !strings.Contains(v, "your_elastic")
}

func loadDotEnvIfNeeded() {
	if isRealValue(os.Getenv("ELASTIC_API_KEY")) && isRealValue(os.Getenv("ELASTIC_OTLP_ENDPOINT")) {
		return
	}
	dir, _ := os.Getwd()
	for i := 0; i < 6; i++ {
		cand := filepath.Join(dir, ".env")
		if raw, err := os.ReadFile(cand); err == nil {
			for _, line := range strings.Split(string(raw), "\n") {
				line = strings.TrimSpace(line)
				if line == "" || strings.HasPrefix(line, "#") {
					continue
				}
				if parts := strings.SplitN(line, "=", 2); len(parts) == 2 {
					k, v := strings.TrimSpace(parts[0]), strings.Trim(strings.TrimSpace(parts[1]), `"'`)
					if !isRealValue(os.Getenv(k)) && isRealValue(v) {
						_ = os.Setenv(k, v)
					}
				}
			}
		}
		dir = filepath.Dir(dir)
	}
}

func LoadConfigFromEnv() ElasticConfig {
	loadDotEnvIfNeeded()
	idx := strings.TrimSpace(os.Getenv("ELASTIC_THREAT_INDEX"))
	if idx == "" {
		idx = "talos-dom-threats-v1"
	}
	return ElasticConfig{
		OTLPEndpoint:     strings.TrimRight(strings.TrimSpace(os.Getenv("ELASTIC_OTLP_ENDPOINT")), "/"),
		APIKey:           strings.TrimSpace(os.Getenv("ELASTIC_API_KEY")),
		ElasticsearchURL: strings.TrimRight(strings.TrimSpace(os.Getenv("ELASTICSEARCH_URL")), "/"),
		ThreatIndexName:  idx,
		ServiceName:      "talos-orchestrator-go",
	}
}

func InitElasticOTel(cfgs ...ElasticConfig) *TelemetryEngine {
	cfg := LoadConfigFromEnv()
	if len(cfgs) > 0 && (cfgs[0].OTLPEndpoint != "" || cfgs[0].APIKey != "" || cfgs[0].ElasticsearchURL != "") {
		cfg = cfgs[0]
		if cfg.ThreatIndexName == "" {
			cfg.ThreatIndexName = "talos-dom-threats-v1"
		}
		if cfg.ServiceName == "" {
			cfg.ServiceName = "talos-orchestrator-go"
		}
	}
	return &TelemetryEngine{
		Config:     cfg,
		HTTPClient: &http.Client{Timeout: 6000 * time.Millisecond},
		spans:      make([]OTelSpan, 0, 64),
		threats:    make([]ThreatVectorDoc, 0, 32),
	}
}

func (e *TelemetryEngine) IsLiveConfigured() bool {
	return isRealValue(e.Config.APIKey) && (isRealValue(e.Config.OTLPEndpoint) || isRealValue(e.Config.ElasticsearchURL))
}

func ParseOrGenerateTraceparent(raw string) (traceID, spanID, parentSpanID, traceparent string) {
	sum := sha256.Sum256([]byte(fmt.Sprintf("%s-%d", raw, time.Now().UnixNano())))
	h := hex.EncodeToString(sum[:])
	spanID = h[:16]
	parts := strings.Split(strings.TrimSpace(raw), "-")
	if len(parts) == 4 && parts[0] == "00" && len(parts[1]) == 32 && len(parts[2]) == 16 {
		traceID = strings.ToLower(parts[1])
		parentSpanID = strings.ToLower(parts[2])
		return traceID, spanID, parentSpanID, fmt.Sprintf("00-%s-%s-01", traceID, spanID)
	}
	traceID = h[:32]
	parentSpanID = "0000000000000000"
	return traceID, spanID, parentSpanID, fmt.Sprintf("00-%s-%s-01", traceID, spanID)
}

func RedactEmail(email string) string {
	email = strings.TrimSpace(email)
	at := strings.IndexByte(email, '@')
	if at <= 0 {
		return "r***@redacted.example.com"
	}
	return email[:1] + "***" + email[at:]
}

func RedactBearer(header string) string {
	if strings.TrimSpace(header) == "" {
		return ""
	}
	return "[REDACTED_BEARER_TOKEN]"
}

func ComputeThreatEmbedding(text string) (string, []float64) {
	lower := strings.ToLower(strings.TrimSpace(text))
	sum := sha256.Sum256([]byte(lower))
	simhash := hex.EncodeToString(sum[:8])
	features := []string{"system override", "ignore", "transfer", "escrow", "display:none", "opacity:0", "visibility:hidden", "comment", "[inst]", "<|im_start|>", "create_order", "bypass", "$480", "attacker", "unicode", "hidden"}
	vec := make([]float64, len(features))
	var norm float64
	for i, kw := range features {
		v := float64(sum[i]&0x0F) * 0.01
		if strings.Contains(lower, kw) {
			v += 1.0
		}
		vec[i] = v
		norm += v * v
	}
	norm = math.Sqrt(norm)
	if norm > 0 {
		for i := range vec {
			vec[i] = math.Round((vec[i]/norm)*10000) / 10000
		}
	}
	return simhash, vec
}

func cosineSimilarity(a, b []float64) float64 {
	if len(a) == 0 || len(a) != len(b) {
		return 0
	}
	var dot, na, nb float64
	for i := range a {
		dot += a[i] * b[i]
		na += a[i] * a[i]
		nb += b[i] * b[i]
	}
	if na == 0 || nb == 0 {
		return 0
	}
	return dot / (math.Sqrt(na) * math.Sqrt(nb))
}
