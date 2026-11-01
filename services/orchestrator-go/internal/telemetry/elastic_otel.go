// Package telemetry configures OpenTelemetry trace export and Elasticsearch vector threat indexing for Elastic Cloud.
package telemetry

type ElasticConfig struct {
	OTLPEndpoint     string
	APIKey           string
	ElasticsearchURL string
}
