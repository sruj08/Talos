package paypalapimatic

import (
	"bytes"
	"context"
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"net/http"
	"os"
	"strings"
	"sync"
	"time"
)

const (
	DefaultSandboxBaseURL = "https://api-m.sandbox.paypal.com"
	UserAgent             = "APIMatic-Talos-PayPal-Go-SDK/1.0"
)

var (
	ErrMissingRequestID = errors.New("paypal-go-apimatic: PayPal-Request-Id header is required")
	ErrInvalidIntent    = errors.New("paypal-go-apimatic: order intent must be AUTHORIZE for 2PC escrow")
	ErrEmptyIdentifier  = errors.New("paypal-go-apimatic: resource identifier must not be empty")
)

// APIError represents a structured error response from PayPal REST APIs.
type APIError struct {
	StatusCode int    `json:"-"`
	Name       string `json:"name"`
	Message    string `json:"message"`
	DebugID    string `json:"debug_id"`
}

func (e *APIError) Error() string {
	if e.Name != "" || e.Message != "" {
		return fmt.Sprintf("paypal api error (%d %s): %s [debug_id=%s]", e.StatusCode, e.Name, e.Message, e.DebugID)
	}
	return fmt.Sprintf("paypal api error (status=%d)", e.StatusCode)
}

type oauthTokenResponse struct {
	AccessToken string `json:"access_token"`
	TokenType   string `json:"token_type"`
	ExpiresIn   int    `json:"expires_in"`
}

// Client is the APIMatic-generated Go SDK client for PayPal Sandbox APIs.
type Client struct {
	BaseURL      string
	ClientID     string
	ClientSecret string
	HTTPClient   *http.Client
	FallbackMode bool
	MaxRetries   int
	RetryBackoff time.Duration

	mu          sync.RWMutex
	accessToken string
	tokenExpiry time.Time
}

// NewSandboxClient constructs a PayPal Sandbox SDK client with OAuth2 token caching and retry policies.
func NewSandboxClient(clientID, clientSecret string) *Client {
	fallback := strings.EqualFold(os.Getenv("TALOS_SANDBOX_FALLBACK_ENABLED"), "true") ||
		strings.TrimSpace(clientID) == "" || strings.TrimSpace(clientSecret) == ""
	return &Client{
		BaseURL:      DefaultSandboxBaseURL,
		ClientID:     strings.TrimSpace(clientID),
		ClientSecret: strings.TrimSpace(clientSecret),
		HTTPClient:   &http.Client{Timeout: 10 * time.Second},
		FallbackMode: fallback,
		MaxRetries:   2,
		RetryBackoff: 25 * time.Millisecond,
	}
}

// InvalidateToken clears the cached OAuth2 bearer token.
func (c *Client) InvalidateToken() {
	c.mu.Lock()
	defer c.mu.Unlock()
	c.accessToken = ""
	c.tokenExpiry = time.Time{}
}

// GetAccessToken returns a cached OAuth2 bearer token or acquires a fresh one via POST /v1/oauth2/token.
func (c *Client) GetAccessToken(ctx context.Context) (string, error) {
	if c.FallbackMode {
		return "sandbox-fallback-bearer-token", nil
	}
	c.mu.RLock()
	if c.accessToken != "" && time.Now().Add(60*time.Second).Before(c.tokenExpiry) {
		tok := c.accessToken
		c.mu.RUnlock()
		return tok, nil
	}
	c.mu.RUnlock()

	c.mu.Lock()
	defer c.mu.Unlock()
	if c.accessToken != "" && time.Now().Add(60*time.Second).Before(c.tokenExpiry) {
		return c.accessToken, nil
	}

	endpoint := strings.TrimRight(c.BaseURL, "/") + "/v1/oauth2/token"
	req, err := http.NewRequestWithContext(ctx, http.MethodPost, endpoint, strings.NewReader("grant_type=client_credentials"))
	if err != nil {
		return "", fmt.Errorf("create oauth2 request: %w", err)
	}
	req.SetBasicAuth(c.ClientID, c.ClientSecret)
	req.Header.Set("Content-Type", "application/x-www-form-urlencoded")
	req.Header.Set("Accept", "application/json")
	req.Header.Set("User-Agent", UserAgent)

	resp, err := c.httpClient().Do(req)
	if err != nil {
		return "", fmt.Errorf("execute oauth2 token request: %w", err)
	}
	defer resp.Body.Close()

	raw, err := io.ReadAll(resp.Body)
	if err != nil {
		return "", fmt.Errorf("read oauth2 response: %w", err)
	}
	if resp.StatusCode < 200 || resp.StatusCode >= 300 {
		return "", parseAPIError(resp.StatusCode, raw)
	}

	var parsed oauthTokenResponse
	if err := json.Unmarshal(raw, &parsed); err != nil || parsed.AccessToken == "" {
		return "", errors.New("paypal-go-apimatic: invalid oauth2 token response")
	}
	ttl := parsed.ExpiresIn
	if ttl <= 0 {
		ttl = 3600
	}
	c.accessToken = parsed.AccessToken
	c.tokenExpiry = time.Now().Add(time.Duration(ttl) * time.Second)
	return c.accessToken, nil
}

func (c *Client) doJSON(ctx context.Context, method, path, paypalRequestID string, reqBody any, respOut any) (int, error) {
	if (method == http.MethodPost || method == http.MethodPatch || method == http.MethodPut) && strings.TrimSpace(paypalRequestID) == "" {
		return 0, ErrMissingRequestID
	}
	var payloadBytes []byte
	if reqBody != nil {
		var err error
		if payloadBytes, err = json.Marshal(reqBody); err != nil {
			return 0, fmt.Errorf("marshal request payload: %w", err)
		}
	}
	maxAttempts := c.MaxRetries + 1
	if maxAttempts < 1 {
		maxAttempts = 1
	}

	for attempt := 0; attempt < maxAttempts; attempt++ {
		token, err := c.GetAccessToken(ctx)
		if err != nil {
			return 0, err
		}
		var bodyReader io.Reader
		if payloadBytes != nil {
			bodyReader = bytes.NewReader(payloadBytes)
		}
		req, err := http.NewRequestWithContext(ctx, method, strings.TrimRight(c.BaseURL, "/")+path, bodyReader)
		if err != nil {
			return 0, fmt.Errorf("create request %s %s: %w", method, path, err)
		}
		req.Header.Set("Authorization", "Bearer "+token)
		req.Header.Set("Content-Type", "application/json")
		req.Header.Set("Accept", "application/json")
		req.Header.Set("Prefer", "return=representation")
		req.Header.Set("User-Agent", UserAgent)
		if strings.TrimSpace(paypalRequestID) != "" {
			req.Header.Set("PayPal-Request-Id", strings.TrimSpace(paypalRequestID))
		}

		resp, err := c.httpClient().Do(req)
		if err != nil {
			return 0, fmt.Errorf("execute %s %s: %w", method, path, err)
		}
		raw, readErr := io.ReadAll(resp.Body)
		resp.Body.Close()
		if readErr != nil {
			return resp.StatusCode, fmt.Errorf("read response %s %s: %w", method, path, readErr)
		}
		if (resp.StatusCode == http.StatusBadGateway || resp.StatusCode == http.StatusServiceUnavailable || resp.StatusCode == http.StatusGatewayTimeout) && attempt+1 < maxAttempts {
			if err := sleepWithContext(ctx, c.backoffDuration(attempt)); err != nil {
				return resp.StatusCode, err
			}
			continue
		}
		if resp.StatusCode < 200 || resp.StatusCode >= 300 {
			return resp.StatusCode, parseAPIError(resp.StatusCode, raw)
		}
		if respOut != nil && len(bytes.TrimSpace(raw)) > 0 {
			if err := json.Unmarshal(raw, respOut); err != nil {
				return resp.StatusCode, fmt.Errorf("decode response %s %s: %w", method, path, err)
			}
		}
		return resp.StatusCode, nil
	}
	return 0, errors.New("paypal-go-apimatic: exhausted retries")
}

func (c *Client) httpClient() *http.Client {
	if c.HTTPClient != nil {
		return c.HTTPClient
	}
	return http.DefaultClient
}

func (c *Client) backoffDuration(attempt int) time.Duration {
	if c.RetryBackoff <= 0 {
		return (25 * time.Millisecond) * time.Duration(1<<attempt)
	}
	return c.RetryBackoff * time.Duration(1<<attempt)
}

func sleepWithContext(ctx context.Context, d time.Duration) error {
	t := time.NewTimer(d)
	defer t.Stop()
	select {
	case <-ctx.Done():
		return ctx.Err()
	case <-t.C:
		return nil
	}
}

func parseAPIError(statusCode int, raw []byte) error {
	apiErr := &APIError{StatusCode: statusCode}
	_ = json.Unmarshal(raw, apiErr)
	if apiErr.Message == "" && len(raw) > 0 {
		apiErr.Message = strings.TrimSpace(string(raw))
	}
	return apiErr
}

func deterministicID(prefix, seed string) string {
	sum := sha256.Sum256([]byte(prefix + ":" + seed))
	return fmt.Sprintf("%s-%s", prefix, strings.ToUpper(hex.EncodeToString(sum[:6])))
}
