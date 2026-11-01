// PactPay Golang 2PC Escrow Orchestrator (`services/orchestrator-go/cmd/server/main.go`)
package main

import (
	"encoding/json"
	"log"
	"net/http"
	"os"
)

func main() {
	mux := http.NewServeMux()
	mux.HandleFunc("/healthz", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		_ = json.NewEncoder(w).Encode(map[string]string{
			"service": "pactpay-orchestrator-go",
			"status":  "ok",
			"sdk":     "paypal-go-apimatic",
		})
	})

	port := os.Getenv("GO_ORCHESTRATOR_PORT")
	if port == "" {
		port = "8080"
	}
	log.Printf("pactpay-orchestrator-go listening on :%s", port)
	log.Fatal(http.ListenAndServe(":"+port, mux))
}
