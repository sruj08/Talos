// Package paypal wraps sdk/paypal-go-apimatic for Orders v2 AUTHORIZE, Capture, Void, Tracking v1, and Disputes v1.
package paypal

import (
	"context"
	"strings"
	"sync"

	paypalapimatic "github.com/talos/sdk/paypal-go-apimatic"
)

type SandboxService struct {
	ClientID     string
	ClientSecret string
	FallbackMode bool
	SDKClient    *paypalapimatic.Client
	mu           sync.RWMutex
	idempCache   map[string]any
}

func NewSandboxService(client *paypalapimatic.Client) *SandboxService {
	if client == nil {
		client = paypalapimatic.NewClientFromEnv()
	}
	return &SandboxService{
		ClientID:     client.Config.ClientID,
		ClientSecret: client.Config.ClientSecret,
		FallbackMode: client.Config.FallbackReplay,
		SDKClient:    client,
		idempCache:   make(map[string]any),
	}
}

func NewSandboxServiceFromEnv(dotenvPaths ...string) *SandboxService {
	return NewSandboxService(paypalapimatic.NewClientFromEnv(dotenvPaths...))
}

func (s *SandboxService) AuthorizeEscrow(ctx context.Context, req paypalapimatic.CreateOrderRequest, requestID string) (*paypalapimatic.OrderAuthorizationResponse, error) {
	reqID := strings.TrimSpace(requestID)
	if reqID == "" {
		reqID = strings.TrimSpace(req.PayPalRequestID)
	}
	if reqID == "" {
		return nil, paypalapimatic.ErrMissingPayPalRequestID
	}
	key := "authorize:" + reqID
	s.mu.RLock()
	if v, ok := s.idempCache[key]; ok {
		if resp, ok := v.(*paypalapimatic.OrderAuthorizationResponse); ok {
			cp := *resp
			s.mu.RUnlock()
			return &cp, nil
		}
	}
	s.mu.RUnlock()

	req.PayPalRequestID = reqID
	resp, err := s.SDKClient.CreateAndAuthorizeOrder(ctx, req, reqID)
	if err != nil {
		return nil, err
	}
	s.mu.Lock()
	cp := *resp
	s.idempCache[key] = &cp
	s.mu.Unlock()
	return resp, nil
}

func (s *SandboxService) Authorize(ctx context.Context, req paypalapimatic.CreateOrderRequest, requestID string) (*paypalapimatic.OrderAuthorizationResponse, error) {
	return s.AuthorizeEscrow(ctx, req, requestID)
}

func (s *SandboxService) CaptureEscrow(ctx context.Context, authID string, amountCents int64, currency, requestID string) (*paypalapimatic.CaptureAuthorizationResponse, error) {
	reqID := strings.TrimSpace(requestID)
	if reqID == "" {
		return nil, paypalapimatic.ErrMissingPayPalRequestID
	}
	key := "capture:" + reqID
	s.mu.RLock()
	if v, ok := s.idempCache[key]; ok {
		if resp, ok := v.(*paypalapimatic.CaptureAuthorizationResponse); ok {
			cp := *resp
			s.mu.RUnlock()
			return &cp, nil
		}
	}
	s.mu.RUnlock()

	resp, err := s.SDKClient.CaptureAuthorization(ctx, authID, amountCents, currency, reqID)
	if err != nil {
		return nil, err
	}
	s.mu.Lock()
	cp := *resp
	s.idempCache[key] = &cp
	s.mu.Unlock()
	return resp, nil
}

func (s *SandboxService) Capture(ctx context.Context, authID string, amountCents int64, currency, requestID string) (*paypalapimatic.CaptureAuthorizationResponse, error) {
	return s.CaptureEscrow(ctx, authID, amountCents, currency, requestID)
}

func (s *SandboxService) VoidEscrow(ctx context.Context, authID, requestID string) (*paypalapimatic.VoidAuthorizationResponse, error) {
	reqID := strings.TrimSpace(requestID)
	if reqID == "" {
		return nil, paypalapimatic.ErrMissingPayPalRequestID
	}
	key := "void:" + reqID
	s.mu.RLock()
	if v, ok := s.idempCache[key]; ok {
		if resp, ok := v.(*paypalapimatic.VoidAuthorizationResponse); ok {
			cp := *resp
			s.mu.RUnlock()
			return &cp, nil
		}
	}
	s.mu.RUnlock()

	resp, err := s.SDKClient.VoidAuthorization(ctx, authID, reqID)
	if err != nil {
		return nil, err
	}
	s.mu.Lock()
	cp := *resp
	s.idempCache[key] = &cp
	s.mu.Unlock()
	return resp, nil
}

func (s *SandboxService) Void(ctx context.Context, authID, requestID string) (*paypalapimatic.VoidAuthorizationResponse, error) {
	return s.VoidEscrow(ctx, authID, requestID)
}

func (s *SandboxService) RegisterTracking(ctx context.Context, tracker paypalapimatic.TrackerPayload, requestID string) (*paypalapimatic.TrackingBatchResponse, error) {
	reqID := strings.TrimSpace(requestID)
	if reqID == "" {
		return nil, paypalapimatic.ErrMissingPayPalRequestID
	}
	key := "track:" + reqID
	s.mu.RLock()
	if v, ok := s.idempCache[key]; ok {
		if resp, ok := v.(*paypalapimatic.TrackingBatchResponse); ok {
			cp := *resp
			s.mu.RUnlock()
			return &cp, nil
		}
	}
	s.mu.RUnlock()

	resp, err := s.SDKClient.RegisterShipmentTracker(ctx, tracker, reqID)
	if err != nil {
		return nil, err
	}
	s.mu.Lock()
	cp := *resp
	s.idempCache[key] = &cp
	s.mu.Unlock()
	return resp, nil
}

func (s *SandboxService) SubmitDisputeEvidence(ctx context.Context, disputeID string, req paypalapimatic.ProvideEvidenceRequest, requestID string) (*paypalapimatic.DisputeEvidenceResponse, error) {
	reqID := strings.TrimSpace(requestID)
	if reqID == "" {
		return nil, paypalapimatic.ErrMissingPayPalRequestID
	}
	key := "dispute:" + reqID
	s.mu.RLock()
	if v, ok := s.idempCache[key]; ok {
		if resp, ok := v.(*paypalapimatic.DisputeEvidenceResponse); ok {
			cp := *resp
			s.mu.RUnlock()
			return &cp, nil
		}
	}
	s.mu.RUnlock()

	resp, err := s.SDKClient.ProvideDisputeEvidence(ctx, disputeID, req, reqID)
	if err != nil {
		return nil, err
	}
	s.mu.Lock()
	cp := *resp
	s.idempCache[key] = &cp
	s.mu.Unlock()
	return resp, nil
}
