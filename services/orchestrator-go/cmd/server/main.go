package main

import (
	"encoding/json"
	"log/slog"
	"net/http"
	"os"
	"time"

	"github.com/talos/services/orchestrator-go/internal/escrow"
	"github.com/talos/services/orchestrator-go/internal/paypal"
	"github.com/talos/services/orchestrator-go/internal/store"
)

func main() {
	logger := slog.New(slog.NewJSONHandler(os.Stdout, nil))
	port := os.Getenv("ORCHESTRATOR_PORT")
	if port == "" {
		port = "8080"
	}

	st := store.NewStore(os.Getenv("DATABASE_URL"), os.Getenv("REDIS_URL"))

	paypalSvc := paypal.NewSandboxServiceFromEnv()
	escrowEngine := escrow.NewEngine(paypalSvc, st)

	mux := http.NewServeMux()
	mux.HandleFunc("GET /healthz", func(w http.ResponseWriter, _ *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		_ = json.NewEncoder(w).Encode(map[string]any{
			"status":         "ok",
			"service":        "orchestrator-go",
			"paypal_adapter": paypalSvc.ServiceName(),
			"timestamp":      time.Now().UTC().Format(time.RFC3339),
		})
	})
	escrowEngine.RegisterRoutes(mux)

	logger.Info("starting talos orchestrator-go", "port", port)
	if err := http.ListenAndServe(":"+port, mux); err != nil {
		logger.Error("server exited", "error", err)
		os.Exit(1)
	}
}
