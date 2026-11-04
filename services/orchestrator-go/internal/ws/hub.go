// Package ws implements the real-time WebSocket broadcaster (/ws/events) streaming state transitions to AG Grid and Bryntum.
package ws

import (
	"bufio"
	"crypto/sha1"
	"encoding/base64"
	"encoding/binary"
	"encoding/json"
	"fmt"
	"net"
	"net/http"
	"strings"
	"sync"
	"sync/atomic"
	"time"
)

const wsGUID = "258EAFA5-E914-47DA-95CA-C5AB0DC85B11"

type EventMessage struct {
	EventID   string      `json:"event_id,omitempty"`
	EventType string      `json:"event_type"`
	EscrowID  string      `json:"escrow_id"`
	Timestamp string      `json:"timestamp,omitempty"`
	Payload   interface{} `json:"payload"`
}

type Hub struct {
	mu          sync.RWMutex
	nextID      int
	subscribers map[int]chan EventMessage
	recent      []EventMessage
	maxRecent   int
	seq         atomic.Int64
}

func NewHub() *Hub {
	h := &Hub{
		subscribers: make(map[int]chan EventMessage),
		recent:      make([]EventMessage, 0, 64),
		maxRecent:   64,
	}
	h.Broadcast(EventMessage{
		EventID:   "evt-init-001",
		EventType: "HUB_INITIALIZED",
		EscrowID:  "esc-902-sm7b",
		Timestamp: time.Now().UTC().Format(time.RFC3339),
		Payload: map[string]any{
			"state":           "PAYPAL_AUTHORIZED",
			"paypal_order_id": "8XY99887766554433",
			"paypal_auth_id":  "2A112233445566778",
			"amount_cents":    24900,
		},
	})
	return h
}

func (h *Hub) Subscribe() (int, <-chan EventMessage, func()) {
	h.mu.Lock()
	h.nextID++
	id := h.nextID
	ch := make(chan EventMessage, 32)
	h.subscribers[id] = ch
	h.mu.Unlock()

	var once sync.Once
	unsub := func() {
		once.Do(func() {
			h.mu.Lock()
			if sub, ok := h.subscribers[id]; ok {
				delete(h.subscribers, id)
				close(sub)
			}
			h.mu.Unlock()
		})
	}
	return id, ch, unsub
}

func (h *Hub) Broadcast(msg EventMessage) {
	if msg.Timestamp == "" {
		msg.Timestamp = time.Now().UTC().Format(time.RFC3339)
	}
	if msg.EventID == "" {
		msg.EventID = fmt.Sprintf("evt-%d", h.seq.Add(1))
	}
	h.mu.Lock()
	if len(h.recent) >= h.maxRecent {
		h.recent = h.recent[1:]
	}
	h.recent = append(h.recent, msg)
	subs := make([]chan EventMessage, 0, len(h.subscribers))
	for _, ch := range h.subscribers {
		subs = append(subs, ch)
	}
	h.mu.Unlock()

	for _, ch := range subs {
		select {
		case ch <- msg:
		default:
		}
	}
}

func (h *Hub) RecentEvents() []EventMessage {
	h.mu.RLock()
	defer h.mu.RUnlock()
	out := make([]EventMessage, len(h.recent))
	copy(out, h.recent)
	return out
}

func (h *Hub) SubscriberCount() int {
	h.mu.RLock()
	defer h.mu.RUnlock()
	return len(h.subscribers)
}

func (h *Hub) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	wsKey := strings.TrimSpace(r.Header.Get("Sec-WebSocket-Key"))
	isUpgrade := strings.Contains(strings.ToLower(r.Header.Get("Upgrade")), "websocket") && wsKey != ""
	if !isUpgrade {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		_ = json.NewEncoder(w).Encode(map[string]any{
			"service":          "talos-ws-hub",
			"endpoint":         "/ws/events",
			"connected":        true,
			"subscriber_count": h.SubscriberCount(),
			"recent_events":    h.RecentEvents(),
		})
		return
	}

	hijacker, ok := w.(http.Hijacker)
	if !ok {
		http.Error(w, "websocket hijack not supported", http.StatusInternalServerError)
		return
	}
	conn, rw, err := hijacker.Hijack()
	if err != nil {
		return
	}
	defer conn.Close()

	acceptHash := sha1.Sum([]byte(wsKey + wsGUID))
	acceptVal := base64.StdEncoding.EncodeToString(acceptHash[:])
	handshake := "HTTP/1.1 101 Switching Protocols\r\n" +
		"Upgrade: websocket\r\n" +
		"Connection: Upgrade\r\n" +
		"Sec-WebSocket-Accept: " + acceptVal + "\r\n\r\n"
	if _, err := rw.WriteString(handshake); err != nil {
		return
	}
	if err := rw.Flush(); err != nil {
		return
	}

	_, ch, unsub := h.Subscribe()
	defer unsub()

	for _, evt := range h.RecentEvents() {
		if err := writeWSFrame(conn, evt); err != nil {
			return
		}
	}

	done := make(chan struct{})
	go func() {
		defer close(done)
		buf := make([]byte, 256)
		for {
			if _, err := bufio.NewReader(conn).Read(buf); err != nil {
				return
			}
		}
	}()

	for {
		select {
		case <-r.Context().Done():
			return
		case <-done:
			return
		case evt, ok := <-ch:
			if !ok {
				return
			}
			if err := writeWSFrame(conn, evt); err != nil {
				return
			}
		}
	}
}

func writeWSFrame(conn net.Conn, evt EventMessage) error {
	payload, err := json.Marshal(evt)
	if err != nil {
		return err
	}
	_ = conn.SetWriteDeadline(time.Now().Add(2 * time.Second))
	length := len(payload)
	var header []byte
	switch {
	case length < 126:
		header = []byte{0x81, byte(length)}
	case length <= 65535:
		header = []byte{0x81, 126, 0, 0}
		binary.BigEndian.PutUint16(header[2:4], uint16(length))
	default:
		header = make([]byte, 10)
		header[0], header[1] = 0x81, 127
		binary.BigEndian.PutUint64(header[2:10], uint64(length))
	}
	if _, err := conn.Write(header); err != nil {
		return err
	}
	_, err = conn.Write(payload)
	return err
}
