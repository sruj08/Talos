package main

import (
	"fmt"
	"net/http"
	"os"
	"time"

	"github.com/talos/services/orchestrator-go/internal/channel3"
	"github.com/talos/services/orchestrator-go/internal/escrow"
	"github.com/talos/services/orchestrator-go/internal/handlers"
	"github.com/talos/services/orchestrator-go/internal/kernel"
	"github.com/talos/services/orchestrator-go/internal/paypal"
	"github.com/talos/services/orchestrator-go/internal/store"
	"github.com/talos/services/orchestrator-go/internal/ws"
)

func main() {
	port := os.Getenv("ORCHESTRATOR_GO_PORT")
	if port == "" {
		port = "8080"
	}

	st := store.NewStore(os.Getenv("DATABASE_URL"), os.Getenv("REDIS_URL"))
	ppSvc := paypal.NewSandboxServiceFromEnv()
	eng := escrow.NewEngine(ppSvc, st)
	ora := channel3.NewOracle()
	krn := kernel.NewInspector()
	hub := ws.NewHub()
	apiSrv := handlers.NewServer(eng, ppSvc, ora, krn, hub)

	mux := http.NewServeMux()
	apiSrv.RegisterRoutes(mux)

	server := &http.Server{
		Addr:              ":" + port,
		Handler:           corsMiddleware(mux),
		ReadHeaderTimeout: 5 * time.Second,
	}

	fmt.Printf("TALOS Orchestrator-Go listening on :%s (service=%s)\n", port, ppSvc.ServiceName())
	if err := server.ListenAndServe(); err != nil && err != http.ErrServerClosed {
		os.Exit(1)
	}
}

func corsMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PATCH, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization, Idempotency-Key, PayPal-Request-Id")
		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusNoContent)
			return
		}
		next.ServeHTTP(w, r)
	})
}
