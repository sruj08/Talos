package store

import (
	"bufio"
	"context"
	"fmt"
	"net"
	"strings"
	"time"
)

// ReleaseIdempotencyLock removes `idemp:{PayPal-Request-Id}` when an upstream 2PC operation fails before committing.
func (s *Store) ReleaseIdempotencyLock(ctx context.Context, paypalRequestID string) error {
	reqID := strings.TrimSpace(paypalRequestID)
	if reqID == "" {
		return ErrEmptyRequestID
	}
	key := FormatIdempotencyKey(reqID)
	if addr := parseRedisAddr(s.RedisURL); addr != "" {
		_ = tryRedisDel(ctx, addr, key)
	}
	s.mu.Lock()
	delete(s.idempMap, key)
	s.mu.Unlock()
	return nil
}

func parseRedisAddr(raw string) string {
	raw = strings.TrimPrefix(strings.TrimPrefix(strings.TrimSpace(raw), "redis://"), "valkey://")
	if idx := strings.IndexByte(raw, '/'); idx >= 0 {
		return raw[:idx]
	}
	return raw
}

func tryRedisSetNX(ctx context.Context, addr, key, val string, ttlSec int64) (bool, bool) {
	conn, err := (&net.Dialer{Timeout: 400 * time.Millisecond}).DialContext(ctx, "tcp", addr)
	if err != nil {
		return false, false
	}
	defer conn.Close()
	_ = conn.SetDeadline(time.Now().Add(500 * time.Millisecond))
	ttlStr := fmt.Sprintf("%d", ttlSec)
	cmd := fmt.Sprintf("*6\r\n$3\r\nSET\r\n$%d\r\n%s\r\n$%d\r\n%s\r\n$2\r\nNX\r\n$2\r\nEX\r\n$%d\r\n%s\r\n",
		len(key), key, len(val), val, len(ttlStr), ttlStr)
	if _, err := conn.Write([]byte(cmd)); err != nil {
		return false, false
	}
	line, err := bufio.NewReader(conn).ReadString('\n')
	return strings.HasPrefix(line, "+OK"), err == nil && (strings.HasPrefix(line, "+OK") || strings.HasPrefix(line, "$-1"))
}

func tryRedisDel(ctx context.Context, addr, key string) bool {
	conn, err := (&net.Dialer{Timeout: 400 * time.Millisecond}).DialContext(ctx, "tcp", addr)
	if err != nil {
		return false
	}
	defer conn.Close()
	_ = conn.SetDeadline(time.Now().Add(500 * time.Millisecond))
	cmd := fmt.Sprintf("*2\r\n$3\r\nDEL\r\n$%d\r\n%s\r\n", len(key), key)
	if _, err := conn.Write([]byte(cmd)); err != nil {
		return false
	}
	line, err := bufio.NewReader(conn).ReadString('\n')
	return err == nil && strings.HasPrefix(line, ":")
}
