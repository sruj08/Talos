---
phase: 04-channel3-fair-price-oracle-kernel-tracking-disputes
plan: 01
subsystem: channel3-oracle-and-kernel-inspector
tags:
  - channel3
  - kernel
  - price-oracle
  - sku-authenticity
  - cloud-browser
provides:
  - services/orchestrator-go/internal/channel3
  - services/orchestrator-go/internal/kernel
affects:
  - services/orchestrator-go/internal/handlers
  - services/orchestrator-go/cmd/server
tech-stack:
  added: []
  patterns:
    - Integer Basis Points Spread Math (((listed - median) * 10000) / median)
    - Live Channel3 Catalog Search + Deterministic 25-SKU Fallback Dataset
    - Disposable KERNEL Cloud Browser Session + Forensic Screenshot Capture
key-files:
  created:
    - services/orchestrator-go/internal/channel3/oracle_test.go
    - services/orchestrator-go/internal/kernel/browser_test.go
  modified:
    - services/orchestrator-go/internal/channel3/oracle.go
    - services/orchestrator-go/internal/kernel/browser.go
decisions:
  - Used zero-float int64 minor units (cents) and int64 basis points across all Channel3 price evaluations to uphold NFR-05.
  - Configured automatic fallback from live Channel3/KERNEL REST APIs to deterministic local datasets so E2E tests and offline demos remain 100% reproducible.
metrics:
  duration_minutes: 4
  completed_date: "2026-04-04"
---

# Phase 04 Plan 01 (`TASK-07`): Channel3 Fair-Market Price Oracle & KERNEL Cloud Browser Inspector Summary

## Accomplishments
- Implemented `Oracle` in [`oracle.go`](file:///d:/Hackathons/PayPal/Talos/services/orchestrator-go/internal/channel3/oracle.go) (`244` lines) with `ComputeSpreadBps`, `ComputeMedianCents`, `EvaluateSKU`, live `https://api.trychannel3.com/v1/products/search` client, and deterministic fallback catalog blocking `$480.00` Shure SM7B price gouging (`+9277 bps` > `1500 bps` cap) and rerouting to `$249.00` (`https://verified-audio.trychannel3.com/sku/shure-sm7b`, saving `$231.00`).
- Implemented unit, mock-server fallback, edge-case, and 50-goroutine concurrency tests in [`oracle_test.go`](file:///d:/Hackathons/PayPal/Talos/services/orchestrator-go/internal/channel3/oracle_test.go) (`189` lines).
- Implemented `Inspector` in [`browser.go`](file:///d:/Hackathons/PayPal/Talos/services/orchestrator-go/internal/kernel/browser.go) (`160` lines) with disposable KERNEL browser session creation (`POST /v1/browsers/sessions`), SHA-256 DOM hashing, forensic screenshot URLs, and deterministic poisoned/clean DOM fallback.
- Implemented unit, mock-server fallback, URL validation, and 50-goroutine concurrency tests in [`browser_test.go`](file:///d:/Hackathons/PayPal/Talos/services/orchestrator-go/internal/kernel/browser_test.go) (`105` lines).
