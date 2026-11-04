import { describe, expect, it, afterEach } from "vitest";
import { GET, HEAD, type WebHealthzPayload } from "./route";
import { GET as RootHealthzGET } from "../../healthz/route";
import { resolveOrchestratorUrl, resolveOrchestratorWsUrl } from "../../../lib/phase6-events";

describe("talos-console-web /api/healthz, /healthz & Render service discovery", () => {
  afterEach(() => {
    delete process.env.NEXT_PUBLIC_ORCHESTRATOR_URL;
    delete process.env.NEXT_PUBLIC_ORCHESTRATOR_WS_URL;
  });

  it("responds 200 OK with Render readiness metadata on GET /api/healthz", async () => {
    const apiRes = await GET();
    expect(apiRes.status).toBe(200);
    expect(apiRes.headers.get("Cache-Control")).toContain("no-store");
    const payload = (await apiRes.json()) as WebHealthzPayload;
    expect(payload.service).toBe("talos-console-web");
    expect(payload.status).toBe("ok");
    expect(payload.runtime).toBe("nextjs-15-app-router");
    expect(payload.sponsors).toContain("render-blueprint");
  });

  it("responds 200 OK on GET /healthz alias and HEAD /api/healthz", async () => {
    const rootRes = await RootHealthzGET();
    expect(rootRes.status).toBe(200);
    const rootBody = (await rootRes.json()) as WebHealthzPayload;
    expect(rootBody.status).toBe("ok");

    const headRes = await HEAD();
    expect(headRes.status).toBe(200);
  });

  it("resolves Render NEXT_PUBLIC_ORCHESTRATOR_URL for HTTP and wss:// WebSocket endpoints", () => {
    expect(resolveOrchestratorUrl("/api/v1/checkout/evaluate")).toBe("/api/v1/checkout/evaluate");
    expect(resolveOrchestratorWsUrl()).toBe("ws://localhost:8080/ws/events");

    process.env.NEXT_PUBLIC_ORCHESTRATOR_URL = "https://talos-orchestrator-go.onrender.com/";
    expect(resolveOrchestratorUrl("/api/v1/checkout/evaluate")).toBe(
      "https://talos-orchestrator-go.onrender.com/api/v1/checkout/evaluate"
    );
    expect(resolveOrchestratorWsUrl()).toBe("wss://talos-orchestrator-go.onrender.com/ws/events");
  });
});
