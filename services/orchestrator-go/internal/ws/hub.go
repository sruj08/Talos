package ws

import (
	"bufio"
	"crypto/sha1"
	"encoding/base64"
	"encoding/binary"
	"encoding/json"
	"net"
	"net/http"
	"strings"
	"sync"
	"time"
)

const wsGUID = "258EAFA5-E914-47DA-95CA-C5AB0DC85B11"

type Event struct {
	EventType        string `json:"event_type"`
	EventID          string `json:"event_id"`
	Timestamp        string `json:"timestamp"`
	EscrowID         string `json:"escrow_id"`
	PreviousState    string `json:"previous_state"`
	CurrentState     string `json:"current_state"`
	NewState         string `json:"new_state,omitempty"`
	PayPalOrderID    string `json:"paypal_order_id,omitempty"`
	AgGridRowDelta   any    `json:"ag_grid_row_delta,omitempty"`
	BryntumTaskDelta any    `json:"bryntum_task_delta,omitempty"`
}

type wsClient struct {
	conn net.Conn
	ch   chan []byte
}

type Hub struct {
	mu      sync.RWMutex
	clients map[*wsClient]struct{}
	subs    map[chan Event]struct{}
	recent  []Event
}

func NewHub() *Hub {
	return &Hub{
		clients: make(map[*wsClient]struct{}),
		subs:    make(map[chan Event]struct{}),
		recent:  make([]Event, 0, 64),
	}
}

func (h *Hub) Subscribe() (chan Event, func()) {
	ch := make(chan Event, 32)
	h.mu.Lock()
	h.subs[ch] = struct{}{}
	h.mu.Unlock()
	return ch, func() {
		h.mu.Lock()
		if _, ok := h.subs[ch]; ok {
			delete(h.subs, ch)
			close(ch)
		}
		h.mu.Unlock()
	}
}

func (h *Hub) RecentEvents() []Event {
	h.mu.RLock()
	defer h.mu.RUnlock()
	out := make([]Event, len(h.recent))
	copy(out, h.recent)
	return out
}

func (h *Hub) Broadcast(evt Event) {
	if evt.EventType == "" {
		evt.EventType = "ESCROW_STATE_TRANSITION"
	}
	if evt.Timestamp == "" {
		evt.Timestamp = time.Now().UTC().Format(time.RFC3339)
	}
	if evt.NewState == "" {
		evt.NewState = evt.CurrentState
	}
	raw, err := json.Marshal(evt)
	if err != nil {
		return
	}

	h.mu.Lock()
	if len(h.recent) >= 64 {
		h.recent = h.recent[1:]
	}
	h.recent = append(h.recent, evt)
	for sub := range h.subs {
		select {
		case sub <- evt:
		default:
		}
	}
	for cl := range h.clients {
		select {
		case cl.ch <- raw:
		default:
		}
	}
	h.mu.Unlock()
}

// ServeWS implements API-15 (GET /ws/events) with RFC 6455 WebSocket upgrade and HTTP snapshot fallback.
func (h *Hub) ServeWS(w http.ResponseWriter, r *http.Request) {
	wsKey := strings.TrimSpace(r.Header.Get("Sec-WebSocket-Key"))
	if !strings.EqualFold(r.Header.Get("Upgrade"), "websocket") || wsKey == "" {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		_ = json.NewEncoder(w).Encode(map[string]any{
			"status":        "WS_HUB_READY",
			"recent_events": h.RecentEvents(),
		})
		return
	}

	hj, ok := w.(http.Hijacker)
	if !ok {
		http.Error(w, "websocket hijack unsupported", http.StatusInternalServerError)
		return
	}
	conn, rw, err := hj.Hijack()
	if err != nil {
		return
	}

	accept := computeAcceptKey(wsKey)
	handshake := "HTTP/1.1 101 Switching Protocols\r\n" +
		"Upgrade: websocket\r\n" +
		"Connection: Upgrade\r\n" +
		"Sec-WebSocket-Accept: " + accept + "\r\n\r\n"
	if _, err := rw.WriteString(handshake); err != nil {
		_ = conn.Close()
		return
	}
	if err := rw.Flush(); err != nil {
		_ = conn.Close()
		return
	}

	cl := &wsClient{conn: conn, ch: make(chan []byte, 32)}
	h.mu.Lock()
	h.clients[cl] = struct{}{}
	h.mu.Unlock()

	go h.writePump(cl)
	go h.readPump(cl, rw.Reader)
}

func (h *Hub) removeClient(cl *wsClient) {
	h.mu.Lock()
	if _, exists := h.clients[cl]; exists {
		delete(h.clients, cl)
		close(cl.ch)
		_ = cl.conn.Close()
	}
	h.mu.Unlock()
}

func (h *Hub) writePump(cl *wsClient) {
	defer h.removeClient(cl)
	for msg := range cl.ch {
		_ = cl.conn.SetWriteDeadline(time.Now().Add(5 * time.Second))
		if err := writeTextFrame(cl.conn, msg); err != nil {
			return
		}
	}
}

func (h *Hub) readPump(cl *wsClient, r *bufio.Reader) {
	defer h.removeClient(cl)
	buf := make([]byte, 512)
	for {
		if _, err := r.Read(buf); err != nil {
			return
		}
	}
}

func computeAcceptKey(key string) string {
	sum := sha1.Sum([]byte(key + wsGUID))
	return base64.StdEncoding.EncodeToString(sum[:])
}

func writeTextFrame(conn net.Conn, payload []byte) error {
	length := len(payload)
	header := make([]byte, 0, 10)
	header = append(header, 0x81) // FIN + Text Frame
	switch {
	case length < 126:
		header = append(header, byte(length))
	case length <= 65535:
		header = append(header, 126, byte(length>>8), byte(length))
	default:
		header = append(header, 127)
		var lenBytes [8]byte
		binary.BigEndian.PutUint64(lenBytes[:], uint64(length))
		header = append(header, lenBytes[:]...)
	}
	if _, err := conn.Write(header); err != nil {
		return err
	}
	_, err := conn.Write(payload)
	return err
}
