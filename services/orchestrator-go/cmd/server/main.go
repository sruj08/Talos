// TALOS Golang 2PC Escrow Orchestrator (`services/orchestrator-go/cmd/server/main.go`)
package main

import (
	"log"
	"net/http"
	"os"
	"strings"

	"github.com/talos/services/orchestrator-go/internal/handlers"
)

func resolveListenPort() string {
	if p := strings.TrimSpace(os.Getenv("PORT")); p != "" {
		return p
	}
	if p := strings.TrimSpace(os.Getenv("GO_ORCHESTRATOR_PORT")); p != "" {
		return p
	}
	return "8080"
}

func main() {
	srv := handlers.NewDefaultServer()
	port := resolveListenPort()
	log.Printf("talos-orchestrator-go listening on 0.0.0.0:%s", port)
	log.Fatal(http.ListenAndServe("0.0.0.0:"+port, srv.Router()))
}
