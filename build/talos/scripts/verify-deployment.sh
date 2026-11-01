#!/usr/bin/env bash
set -euo pipefail
echo "Verifying TALOS services..."
curl -fsS "${RUST_FIREWALL_URL:-http://localhost:8081}/healthz"
curl -fsS "${GO_ORCHESTRATOR_URL:-http://localhost:8080}/healthz"
echo "All TALOS services healthy!"
