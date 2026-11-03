package escrow

import (
	"encoding/json"
	"errors"
	"net/http"
	"strings"
)

// RegisterRoutes wires API-07 (/authorize), API-08 (GET), API-09 (/capture), and API-10 (/void) onto an http.ServeMux.
func (e *Engine) RegisterRoutes(mux *http.ServeMux) {
	mux.HandleFunc("POST /api/v1/escrow/{id}/authorize", e.handleAuthorize)
	mux.HandleFunc("POST /api/v1/escrow/authorize", e.handleAuthorize)
	mux.HandleFunc("POST /api/v1/escrow/{id}/capture", e.handleCapture)
	mux.HandleFunc("POST /api/v1/escrow/{id}/void", e.handleVoid)
	mux.HandleFunc("GET /api/v1/escrow/{id}", e.handleGet)
}

func (e *Engine) handleAuthorize(w http.ResponseWriter, r *http.Request) {
	var req AuthorizeRequest
	_ = json.NewDecoder(r.Body).Decode(&req)
	if id := r.PathValue("id"); id != "" {
		req.EscrowID = id
	}
	if hdr := r.Header.Get("PayPal-Request-Id"); hdr != "" {
		req.PayPalRequestID = hdr
	}
	if strings.TrimSpace(req.EscrowID) == "" && strings.TrimSpace(req.PayPalRequestID) != "" {
		req.EscrowID = "esc_" + strings.TrimSpace(req.PayPalRequestID)
	}
	res, err := e.AuthorizeHold(r.Context(), req)
	writeEscrowJSON(w, http.StatusCreated, res, err)
}

func (e *Engine) handleCapture(w http.ResponseWriter, r *http.Request) {
	var req CaptureRequest
	_ = json.NewDecoder(r.Body).Decode(&req)
	if id := r.PathValue("id"); id != "" {
		req.EscrowID = id
	}
	if hdr := r.Header.Get("PayPal-Request-Id"); hdr != "" {
		req.PayPalRequestID = hdr
	}
	res, err := e.CaptureHold(r.Context(), req)
	writeEscrowJSON(w, http.StatusCreated, res, err)
}

func (e *Engine) handleVoid(w http.ResponseWriter, r *http.Request) {
	var req VoidRequest
	_ = json.NewDecoder(r.Body).Decode(&req)
	if id := r.PathValue("id"); id != "" {
		req.EscrowID = id
	}
	if hdr := r.Header.Get("PayPal-Request-Id"); hdr != "" {
		req.PayPalRequestID = hdr
	}
	res, err := e.VoidHold(r.Context(), req)
	writeEscrowJSON(w, http.StatusOK, res, err)
}

func (e *Engine) handleGet(w http.ResponseWriter, r *http.Request) {
	rec, ok := e.GetHold(r.PathValue("id"))
	if !ok {
		writeEscrowJSON(w, http.StatusNotFound, nil, ErrEscrowNotFound)
		return
	}
	writeEscrowJSON(w, http.StatusOK, rec, nil)
}

// ListHolds returns a concurrency-safe snapshot of all holds managed by the 2PC Engine.
func (e *Engine) ListHolds() []HoldRecord {
	e.mu.RLock()
	defer e.mu.RUnlock()
	out := make([]HoldRecord, 0, len(e.holds))
	for _, rec := range e.holds {
		out = append(out, cloneHold(rec))
	}
	return out
}

func writeEscrowJSON(w http.ResponseWriter, okStatus int, payload any, err error) {
	w.Header().Set("Content-Type", "application/json")
	if err != nil {
		status := http.StatusBadRequest
		code := "TALOS_BAD_REQUEST"
		if errors.Is(err, ErrInvalidStateTransition) {
			status = http.StatusConflict
			code = "TALOS_INVALID_STATE_TRANSITION"
		} else if errors.Is(err, ErrDuplicateRequestID) {
			status = http.StatusConflict
			code = "TALOS_IDEMPOTENCY_CONFLICT"
		} else if errors.Is(err, ErrEscrowNotFound) {
			status = http.StatusNotFound
			code = "TALOS_NOT_FOUND"
		}
		w.WriteHeader(status)
		_ = json.NewEncoder(w).Encode(map[string]any{
			"code":        code,
			"error":       err.Error(),
			"message":     err.Error(),
			"http_status": status,
		})
		return
	}
	w.WriteHeader(okStatus)
	_ = json.NewEncoder(w).Encode(payload)
}
