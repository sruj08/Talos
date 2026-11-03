package ws

import (
	"bufio"
	"encoding/json"
	"fmt"
	"io"
	"net"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
	"time"
)

func TestComputeAcceptKey_RFC6455CanonicalVector(t *testing.T) {
	got := computeAcceptKey("dGhlIHNhbXBsZSBub25jZQ==")
	want := "s3pPLMBiTxaQ9kYGzzhZRbK+xOo="
	if got != want {
		t.Fatalf("expected RFC 6455 canonical accept key %q, got %q", want, got)
	}
}

func TestHub_SubscribeAndBoundedRecentEvents(t *testing.T) {
	hub := NewHub()
	subCh, unsub := hub.Subscribe()
	defer unsub()

	for i := 0; i < 70; i++ {
		hub.Broadcast(Event{
			EventID:       fmt.Sprintf("EVT-%03d", i),
			EscrowID:      "ESC-TEST-01",
			PreviousState: "PAYPAL_AUTHORIZED",
			CurrentState:  "PAYPAL_CAPTURED",
		})
	}

	select {
	case evt := <-subCh:
		if evt.EscrowID != "ESC-TEST-01" || evt.EventType != "ESCROW_STATE_TRANSITION" {
			t.Fatalf("unexpected subscriber event: %+v", evt)
		}
	case <-time.After(time.Second):
		t.Fatalf("timed out waiting for subscriber event")
	}

	recent := hub.RecentEvents()
	if len(recent) != 64 {
		t.Fatalf("expected bounded recent buffer of 64 events, got %d", len(recent))
	}
	if recent[len(recent)-1].EventID != "EVT-069" {
		t.Fatalf("expected last event ID EVT-069, got %s", recent[len(recent)-1].EventID)
	}
}

func TestHub_RFC6455WebSocketUpgradeAndFrameStream(t *testing.T) {
	hub := NewHub()
	srv := httptest.NewServer(http.HandlerFunc(hub.ServeWS))
	defer srv.Close()

	addr := strings.TrimPrefix(srv.URL, "http://")
	conn, err := net.DialTimeout("tcp", addr, 2*time.Second)
	if err != nil {
		t.Fatalf("failed to dial test server: %v", err)
	}
	defer conn.Close()

	req := "GET /ws/events HTTP/1.1\r\n" +
		"Host: " + addr + "\r\n" +
		"Upgrade: websocket\r\n" +
		"Connection: Upgrade\r\n" +
		"Sec-WebSocket-Key: dGhlIHNhbXBsZSBub25jZQ==\r\n" +
		"Sec-WebSocket-Version: 13\r\n\r\n"
	if _, err := conn.Write([]byte(req)); err != nil {
		t.Fatalf("failed writing handshake request: %v", err)
	}

	reader := bufio.NewReader(conn)
	statusLine, err := reader.ReadString('\n')
	if err != nil || !strings.Contains(statusLine, "101 Switching Protocols") {
		t.Fatalf("expected 101 Switching Protocols, got %q (err=%v)", statusLine, err)
	}
	for {
		line, err := reader.ReadString('\n')
		if err != nil || line == "\r\n" {
			break
		}
	}

	// Wait briefly for client registration in hub
	time.Sleep(25 * time.Millisecond)

	hub.Broadcast(Event{
		EventID:       "EVT-WS-LIVE-01",
		EscrowID:      "ESC-WS-900",
		PreviousState: "PAYPAL_AUTHORIZED",
		CurrentState:  "PAYPAL_CAPTURED",
		PayPalOrderID: "ORD-TALOS-WS900",
	})

	_ = conn.SetReadDeadline(time.Now().Add(2 * time.Second))
	hdr := make([]byte, 2)
	if _, err := io.ReadFull(reader, hdr); err != nil {
		t.Fatalf("failed reading ws frame header: %v", err)
	}
	if hdr[0] != 0x81 {
		t.Fatalf("expected 0x81 text frame opcode, got 0x%x", hdr[0])
	}
	length := int(hdr[1] & 0x7f)
	if length == 126 {
		ext := make([]byte, 2)
		if _, err := io.ReadFull(reader, ext); err != nil {
			t.Fatalf("failed reading extended length: %v", err)
		}
		length = int(ext[0])<<8 | int(ext[1])
	}
	payload := make([]byte, length)
	if _, err := io.ReadFull(reader, payload); err != nil {
		t.Fatalf("failed reading ws frame payload: %v", err)
	}

	var decoded Event
	if err := json.Unmarshal(payload, &decoded); err != nil {
		t.Fatalf("failed decoding ws json payload: %v", err)
	}
	if decoded.EscrowID != "ESC-WS-900" || decoded.CurrentState != "PAYPAL_CAPTURED" {
		t.Fatalf("unexpected ws broadcast payload: %+v", decoded)
	}
}
