import { NextResponse } from "next/server";

export interface WebHealthzPayload {
  service: "talos-console-web";
  status: "ok";
  version: string;
  runtime: "nextjs-15-app-router";
  sponsors: string[];
  orchestrator_url: string;
  sandbox_fallback_enabled: boolean;
  timestamp_utc: string;
}

function buildHealthzPayload(): WebHealthzPayload {
  return {
    service: "talos-console-web",
    status: "ok",
    version: "1.0.0",
    runtime: "nextjs-15-app-router",
    sponsors: [
      "paypal-js-sdk-v6",
      "paypal-agent-toolkit",
      "apimatic-sdk",
      "ag-grid-enterprise-v33",
      "bryntum-scheduler-pro",
      "render-blueprint",
    ],
    orchestrator_url:
      process.env.NEXT_PUBLIC_ORCHESTRATOR_URL || "http://localhost:8080",
    sandbox_fallback_enabled:
      process.env.NEXT_PUBLIC_TALOS_SANDBOX_FALLBACK_ENABLED !== "false",
    timestamp_utc: new Date().toISOString(),
  };
}

export async function GET() {
  return NextResponse.json(buildHealthzPayload(), {
    status: 200,
    headers: {
      "Cache-Control": "no-store, max-age=0",
    },
  });
}

export async function HEAD() {
  return new NextResponse(null, { status: 200 });
}
