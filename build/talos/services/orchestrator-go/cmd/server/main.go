// TALOS Golang 2PC Escrow Orchestrator (`services/orchestrator-go/cmd/server/main.go`)
package main

import (
	"log"
	"net/http"
	"os"

	"github.com/talos/services/orchestrator-go/internal/handlers"
)

func main() {
	srv := handlers.NewDefaultServer()
	port := os.Getenv("GO_ORCHESTRATOR_PORT")
	if port == "" {
		port = "8080"
	}
	log.Printf("talos-orchestrator-go listening on :%s", port)
	log.Fatal(http.ListenAndServe(":"+port, srv.Router()))
}
