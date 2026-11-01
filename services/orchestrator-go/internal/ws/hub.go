// Package ws implements the real-time WebSocket broadcaster (/ws/events) streaming state transitions to AG Grid and Bryntum.
package ws

type EventMessage struct {
	EventType string      `json:"event_type"`
	EscrowID  string      `json:"escrow_id"`
	Payload   interface{} `json:"payload"`
}
