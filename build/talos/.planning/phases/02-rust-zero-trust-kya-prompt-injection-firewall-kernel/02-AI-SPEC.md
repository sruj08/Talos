---
phase: 2
slug: rust-zero-trust-kya-prompt-injection-firewall-kernel
title: "Phase 2 AI Specification — M-01 DeBERTa-v3 INT8 ONNX Prompt-Injection Classifier & MCP Boundary"
status: locked
model_id: ProtectAI/deberta-v3-base-prompt-injection-v2
license: Apache-2.0
runtime: Rust 1.85 + lol_html + aho-corasick + ort INT8 ONNX interface
latency_budget_p99_us: 4000
---

# Phase 2 AI Integration Specification (`02-AI-SPEC.md`)

## 1. Model Identity & Provenance (`M-01`)
- **Model ID**: `ProtectAI/deberta-v3-base-prompt-injection-v2` (quantized INT8 ONNX runtime interface in `services/firewall-rs/src/sanitizer.rs`)
- **SPDX License**: `Apache-2.0` (commercial-safe, verified in `docs/04-ai/MODELS.md`)
- **Deployment Tier**: In-process inside `services/firewall-rs` (`POST /v1/sanitize` and `talos_sanitize_dom` MCP tool)
- **Zero-API-Cost Guarantee**: Runs 100% locally in-memory without external LLM calls (`$0.00` per scan, `< 4,000 us` p99 latency).

## 2. Three-Stage Defense-in-Depth Pipeline (`ADR-0004`)
1. **Stage 1 — Streaming `lol_html` DOM Rewriter (`O(1)` memory)**:
   - Strips hidden HTML elements matching CSS obfuscation patterns (`display:none`, `display: none`, `opacity:0`, `opacity: 0`, `visibility:hidden`, `visibility: hidden`, `font-size:0`, `font-size: 0`), boolean `hidden`, `aria-hidden="true"`, `<script>`, and `<template>`.
   - Strips all HTML comments (`<!-- ... -->`) and captures their text into the suspicion buffer for forensic auditing.
   - Inspects high-risk attributes (`aria-label`, `data-llm-instruction`, `title`, `alt`) for hidden instructions or encoded payloads.
2. **Stage 2 — Unicode Steganography & `Aho-Corasick` Multi-Pattern Automaton**:
   - Strips zero-width characters (`U+200B..U+200F`, `U+FEFF`, `U+2060`) and Unicode Tag characters (`U+E0000..U+E007F`) used in invisible prompt smuggling.
   - Scans both raw HTML, extracted comment/hidden buffers, and visible text with a precompiled `AhoCorasick` automaton covering instruction overrides, system prompt overrides, payment/recipient hijacks, tool overrides, and base64-encoded directives.
3. **Stage 3 — `M-01` `DeBERTa-v3` INT8 ONNX Classifier Scoring**:
   - Evaluates extracted suspicion tokens and visible text through the `DebertaPromptClassifier` (`ProtectAI/deberta-v3-base-prompt-injection-v2-int8-onnx`) producing normalized probability `risk_score in [0.0, 1.0]` and binary label `"INJECTION"` (`risk_score >= 0.85`) or `"SAFE"`.
   - Even if `DeBERTa-v3` returns `"SAFE"` on benign text, any Stage 1/2 structural obfuscation is physically stripped from `sanitized_html` / `sanitized_dom` before downstream `M-02` (`Claude Haiku 4.5`) or `M-03` (`Gemini 2.5 Flash`) ever receives the payload.

## 3. MCP Tool Contract (`rmcp` JSON-RPC 2.0)
- `talos_issue_mandate`: Signs a `KyaMandate` with `Ed25519` over RFC 8785 JCS SHA-256 digest.
- `talos_verify_mandate`: Constant-time `Ed25519` signature + budget + category + spread + expiry verification (`< 1ms`).
- `talos_sanitize_dom`: Runs the 3-stage `lol_html` + `aho-corasick` + `DeBERTa-v3` pipeline (`< 4ms`).

## 4. Evaluation & Red-Team Gate (`tests/redteam/prompt_injection_suite.json`)
- **Dataset**: `tests/redteam/prompt_injection_suite.json` covering CVE-2026-22708 vectors (CSS `display:none`, `opacity:0`, HTML comments, `aria-label` smuggling, Unicode zero-width/tag steganography, fake `[SYSTEM]` overrides) plus benign e-commerce product pages.
- **Pass Criteria**:
  - Malicious injection recall: **100%** (`injection_detected == true`, `deberta_label == "INJECTION"`, `risk_score >= 0.85`, malicious payload stripped from `sanitized_html`).
  - Benign product HTML false-positive rate: **0%** (`injection_detected == false`, `deberta_label == "SAFE"`).
  - Latency SLA: `< 4,000 us` per payload in `cargo test`.
