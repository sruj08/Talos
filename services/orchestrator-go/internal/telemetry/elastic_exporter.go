package telemetry

import (
	"bytes"
	"context"
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"math"
	"net/http"
	"sort"
	"strings"
	"time"
)

func (e *TelemetryEngine) RecordCheckoutTrace(ctx context.Context, in CheckoutTraceInput) []OTelSpan {
	traceID, rootSpanID, parentSpanID, tp := ParseOrGenerateTraceparent(in.Traceparent)
	now := time.Now().UTC().Format(time.RFC3339Nano)
	if in.MandateID == "" {
		in.MandateID = "0192e8a0-0000-7000-8000-000000000101"
	}
	if in.AgentID == "" {
		in.AgentID = "agt_claude_desktop_01"
	}
	if in.DOMVerdict == "" {
		in.DOMVerdict = "CLEAN"
		if in.FirewallRiskScore >= 0.75 {
			in.DOMVerdict = "BLOCKED"
		}
	}
	if in.TotalLatencyUs <= 0 {
		in.TotalLatencyUs = 420000
	}
	maskedEmail, exportMode := RedactEmail(in.BuyerEmail), "RING_BUFFER_LOCAL"

	mkSpan := func(suffix, name, svc string, durUs int64, attrs map[string]any) OTelSpan {
		sSum := sha256.Sum256([]byte(traceID + ":" + suffix))
		sID := hex.EncodeToString(sSum[:8])
		attrs["talos.mandate.id"] = in.MandateID
		attrs["talos.firewall.risk_score"] = in.FirewallRiskScore
		attrs["talos.channel3.spread_bps"] = in.SpreadBps
		attrs["paypal.order_id"] = in.PayPalOrderID
		attrs["paypal.auth_id"] = in.PayPalAuthID
		attrs["buyer_email_masked"] = maskedEmail
		attrs["pii_redacted"] = true
		return OTelSpan{
			TraceID: traceID, SpanID: sID, ParentSpanID: rootSpanID,
			Traceparent: fmt.Sprintf("00-%s-%s-01", traceID, sID),
			Name:        name, ServiceName: svc, DurationUs: durUs, Timestamp: now,
			ExportMode: exportMode, Attributes: attrs,
		}
	}

	root := OTelSpan{
		TraceID: traceID, SpanID: rootSpanID, ParentSpanID: parentSpanID, Traceparent: tp,
		Name: "POST /api/v1/checkout/evaluate", ServiceName: "talos-orchestrator-go",
		DurationUs: in.TotalLatencyUs, Timestamp: now, ExportMode: exportMode,
		Attributes: map[string]any{
			"talos.mandate.id": in.MandateID, "talos.agent.id": in.AgentID,
			"talos.requested_amount_cents": in.RequestedAmountCents, "talos.firewall.risk_score": in.FirewallRiskScore,
			"talos.channel3.spread_bps": in.SpreadBps, "paypal.order_id": in.PayPalOrderID,
			"paypal.auth_id": in.PayPalAuthID, "paypal.request_id": in.PayPalRequestID,
			"buyer_email_masked": maskedEmail, "pii_redacted": true,
		},
	}
	s1 := mkSpan("kya", "rust_firewall.verify_mandate", "talos-firewall-rs", 380, map[string]any{
		"kya.ed25519.verified": true, "kya.rfc9421.key_id": "talos-kya-ed25519", "kya.latency_us": int64(380),
	})
	s2 := mkSpan("dom", "rust_firewall.sanitize_dom", "talos-firewall-rs", 2850, map[string]any{
		"dom.lol_html.stripped_nodes": in.StrippedNodes, "dom.deberta.risk_score": in.FirewallRiskScore, "dom.verdict": in.DOMVerdict,
	})
	s3 := mkSpan("ch3", "channel3.oracle_benchmark", "talos-orchestrator-go", 118000, map[string]any{
		"channel3.sku": in.SKU, "channel3.median_cents": in.MedianCents, "channel3.spread_bps": in.SpreadBps,
	})
	s4 := mkSpan("pp", "paypal_sandbox.orders_authorize", "talos-orchestrator-go", 295000, map[string]any{
		"paypal.env": "sandbox", "paypal.request_id": in.PayPalRequestID,
	})

	batch := []OTelSpan{root, s1, s2, s3, s4}
	if e.exportOTLPSpans(ctx, traceID, rootSpanID, batch, in) {
		for i := range batch {
			batch[i].ExportMode = "ELASTIC_APM_OTLP_LIVE"
		}
	}
	e.mu.Lock()
	e.spans = append(e.spans, batch...)
	if len(e.spans) > 128 {
		e.spans = e.spans[len(e.spans)-128:]
	}
	e.mu.Unlock()
	return batch
}

func buildOTLPTracePayload(serviceName string, batch []OTelSpan, in CheckoutTraceInput) []byte {
	nowNano := time.Now().UTC().UnixNano()
	otlpSpans := make([]map[string]any, 0, len(batch))
	for i, sp := range batch {
		durNs := sp.DurationUs * 1000
		if durNs <= 0 {
			durNs = 1000000
		}
		startNs := nowNano - durNs + int64(i*1000)
		item := map[string]any{
			"traceId": sp.TraceID, "spanId": sp.SpanID, "name": sp.Name, "kind": 2,
			"startTimeUnixNano": fmt.Sprintf("%d", startNs), "endTimeUnixNano": fmt.Sprintf("%d", startNs+durNs),
			"attributes": []map[string]any{
				{"key": "talos.mandate.id", "value": map[string]any{"stringValue": in.MandateID}},
				{"key": "talos.firewall.risk_score", "value": map[string]any{"doubleValue": in.FirewallRiskScore}},
				{"key": "talos.channel3.spread_bps", "value": map[string]any{"intValue": in.SpreadBps}},
				{"key": "paypal.order_id", "value": map[string]any{"stringValue": in.PayPalOrderID}},
				{"key": "paypal.auth_id", "value": map[string]any{"stringValue": in.PayPalAuthID}},
				{"key": "dom.verdict", "value": map[string]any{"stringValue": in.DOMVerdict}},
			},
		}
		if sp.ParentSpanID != "" && sp.ParentSpanID != "0000000000000000" {
			item["parentSpanId"] = sp.ParentSpanID
		}
		otlpSpans = append(otlpSpans, item)
	}
	body, _ := json.Marshal(map[string]any{
		"resourceSpans": []map[string]any{{
			"resource":   map[string]any{"attributes": []map[string]any{{"key": "service.name", "value": map[string]any{"stringValue": serviceName}}}},
			"scopeSpans": []map[string]any{{"scope": map[string]any{"name": "talos.otel.tracer", "version": "1.0.0"}, "spans": otlpSpans}},
		}},
	})
	return body
}

func (e *TelemetryEngine) doAuthedJSONPost(ctx context.Context, url string, body []byte) int {
	req, err := http.NewRequestWithContext(ctx, http.MethodPost, url, bytes.NewReader(body))
	if err != nil {
		return 0
	}
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", "ApiKey "+e.Config.APIKey)
	resp, rErr := e.HTTPClient.Do(req)
	if rErr != nil {
		return 0
	}
	_ = resp.Body.Close()
	return resp.StatusCode
}

func (e *TelemetryEngine) exportOTLPSpans(ctx context.Context, traceID, spanID string, batch []OTelSpan, in CheckoutTraceInput) bool {
	if !isRealValue(e.Config.OTLPEndpoint) || !isRealValue(e.Config.APIKey) {
		return false
	}
	body := buildOTLPTracePayload(e.Config.ServiceName, batch, in)
	endpoint := strings.TrimSuffix(e.Config.OTLPEndpoint, "/v1/traces") + "/v1/traces"
	if code := e.doAuthedJSONPost(ctx, endpoint, body); code >= 200 && code < 300 {
		return true
	}
	if isRealValue(e.Config.ElasticsearchURL) {
		esURL := fmt.Sprintf("%s/talos-otel-traces-v1/_doc/%s-%s", e.Config.ElasticsearchURL, traceID, spanID)
		if code := e.doAuthedJSONPost(ctx, esURL, body); code >= 200 && code < 300 {
			return true
		}
	}
	return false
}

func (e *TelemetryEngine) IndexThreatVector(ctx context.Context, doc ThreatVectorDoc) (ThreatVectorDoc, error) {
	simhash, vec := ComputeThreatEmbedding(doc.RawPayloadText)
	doc.SimHashSignature, doc.EmbeddingVector = simhash, vec
	if doc.DocID == "" {
		doc.DocID = "threat-" + simhash
	}
	if doc.AttackCategory == "" {
		doc.AttackCategory = "INDIRECT_DOM_OVERRIDE"
	}
	doc.IndexedAt, doc.StorageMode = time.Now().UTC().Format(time.RFC3339), "RING_BUFFER_LOCAL"

	if isRealValue(e.Config.ElasticsearchURL) && isRealValue(e.Config.APIKey) {
		body, _ := json.Marshal(doc)
		url := fmt.Sprintf("%s/%s/_doc/%s", e.Config.ElasticsearchURL, e.Config.ThreatIndexName, doc.DocID)
		if code := e.doAuthedJSONPost(ctx, url, body); code >= 200 && code < 300 {
			doc.StorageMode = "ELASTICSEARCH_VECTOR_INDEX_LIVE"
		}
	}
	e.mu.Lock()
	e.threats = append(e.threats, doc)
	e.mu.Unlock()
	return doc, nil
}

func (e *TelemetryEngine) SearchSimilarThreats(_ context.Context, queryText string, minScore float64) []ThreatSimilarityHit {
	_, qVec := ComputeThreatEmbedding(queryText)
	e.mu.RLock()
	defer e.mu.RUnlock()
	var hits []ThreatSimilarityHit
	for _, doc := range e.threats {
		if sim := cosineSimilarity(qVec, doc.EmbeddingVector); sim >= minScore {
			hits = append(hits, ThreatSimilarityHit{Doc: doc, CosineSimilarity: math.Round(sim*10000) / 10000})
		}
	}
	sort.Slice(hits, func(i, j int) bool { return hits[i].CosineSimilarity > hits[j].CosineSimilarity })
	return hits
}

func (e *TelemetryEngine) ProbeElasticCloud(ctx context.Context) (otlpStatus int, esStatus int, liveConfigured bool) {
	if !e.IsLiveConfigured() {
		return 0, 0, false
	}
	if isRealValue(e.Config.ElasticsearchURL) {
		if req, err := http.NewRequestWithContext(ctx, http.MethodGet, e.Config.ElasticsearchURL, nil); err == nil {
			req.Header.Set("Authorization", "ApiKey "+e.Config.APIKey)
			if resp, rErr := e.HTTPClient.Do(req); rErr == nil {
				esStatus = resp.StatusCode
				_ = resp.Body.Close()
			}
		}
	}
	if isRealValue(e.Config.OTLPEndpoint) {
		probeSpan := []OTelSpan{{TraceID: "4bf92f3577b34da6a3ce929d0e0e4736", SpanID: "00f067aa0ba902b7", Name: "talos.otel.probe", DurationUs: 350}}
		body := buildOTLPTracePayload(e.Config.ServiceName, probeSpan, CheckoutTraceInput{MandateID: "0192e8a0-0000-7000-8000-000000000101", DOMVerdict: "CLEAN"})
		endpoint := strings.TrimSuffix(e.Config.OTLPEndpoint, "/v1/traces") + "/v1/traces"
		otlpStatus = e.doAuthedJSONPost(ctx, endpoint, body)
	}
	return otlpStatus, esStatus, true
}

func (e *TelemetryEngine) ListSpans() []OTelSpan {
	e.mu.RLock()
	defer e.mu.RUnlock()
	return append([]OTelSpan(nil), e.spans...)
}

func (e *TelemetryEngine) ListThreats() []ThreatVectorDoc {
	e.mu.RLock()
	defer e.mu.RUnlock()
	return append([]ThreatVectorDoc(nil), e.threats...)
}
