package ws

import (
	"bufio"
	"encoding/json"
	"net"
	"net/http"
	"net/http/httptest"
	"strings"
	"sync"
	"testing"
	"time"
)

func TestHubConcurrentBroadcastAndSubscription(t *testing.T) {
	hub := NewHub()
	_, ch1, unsub1 := hub.Subscribe()
	defer unsub1()
	_, ch2, unsub2 := hub.Subscribe()
	defer unsub2()

	if hub.SubscriberCount() != 2 {
		t.Fatalf("expected 2 subscribers, got %d", hub.SubscriberCount())
	}

	var wg sync.WaitGroup
	for i := 0; i < 10; i++ {
		wg.Add(1)
		go func(idx int) {
			defer wg.Done()
			hub.Broadcast(EventMessage{
				EventType: "ESCROW_STATE_TRANSITION",
				EscrowID:  "esc-902-sm7b",
				Payload:   map[string]any{"seq": idx, "state": "PAYPAL_CAPTURED"},
			})
		}(i)
	}
	wg.Wait()

	select {
	case msg := <-ch1:
		if msg.EventType != "ESCROW_STATE_TRANSITION" || msg.EscrowID != "esc-902-sm7b" {
			t.Fatalf("unexpected message on ch1: %+v", msg)
		}
	case <-time.After(time.Second):
		t.Fatal("timed out waiting for broadcast on ch1")
	}

	select {
	case msg := <-ch2:
		if msg.EventType != "ESCROW_STATE_TRANSITION" {
			t.Fatalf("unexpected message on ch2: %+v", msg)
		}
	case <-time.After(time.Second):
		t.Fatal("timed out waiting for broadcast on ch2")
	}

	if len(hub.RecentEvents()) < 10 {
		t.Fatalf("expected at least 10 recent events in ring buffer, got %d", len(hub.RecentEvents()))
	}
}

func TestHubHTTPAndWebSocketUpgradeHandshake(t *testing.T) {
	hub := NewHub()
	srv := httptest.NewServer(hub)
	defer srv.Close()

	// 1. Standard HTTP GET probe returns 200 OK JSON snapshot
	resp, err := http.Get(srv.URL + "/ws/events")
	if err != nil {
		t.Fatalf("GET /ws/events failed: %v", err)
	}
	defer resp.Body.Close()
	if resp.StatusCode != http.StatusOK {
		t.Fatalf("expected 200 OK on HTTP snapshot probe, got %d", resp.StatusCode)
	}
	var snap map[string]any
	if err := json.NewDecoder(resp.Body).Decode(&snap); err != nil || snap["service"] != "talos-ws-hub" {
		t.Fatalf("unexpected snapshot response: %+v err=%v", snap, err)
	}

	// 2. RFC 6455 WebSocket Upgrade returns 101 Switching Protocols and streams frame
	addr := strings.TrimPrefix(srv.URL, "http://")
	conn, err := net.DialTimeout("tcp", addr, 2*time.Second)
	if err != nil {
		t.Fatalf("tcp dial failed: %v", err)
	}
	defer conn.Close()

	req := "GET /ws/events HTTP/1.1\r\n" +
		"Host: " + addr + "\r\n" +
		"Upgrade: websocket\r\n" +
		"Connection: Upgrade\r\n" +
		"Sec-WebSocket-Key: dGhlIHNhbXBsZSBub25jZQ==\r\n" +
		"Sec-WebSocket-Version: 13\r\n\r\n"
	if _, err := conn.Write([]byte(req)); err != nil {
		t.Fatalf("write upgrade request failed: %v", err)
	}

	reader := bufio.NewReader(conn)
	statusLine, err := reader.ReadString('\n')
	if err != nil || !strings.Contains(statusLine, "101 Switching Protocols") {
		t.Fatalf("expected 101 Switching Protocols, got %q (err=%v)", statusLine, err)
	}
}
