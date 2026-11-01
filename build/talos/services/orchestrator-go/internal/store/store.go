// Package store provides PostgreSQL 16 repositories (E-01..E-09) and Redis PayPal-Request-Id idempotency locks (E-10).
package store

type Store struct {
	DatabaseURL string
	RedisURL    string
}
