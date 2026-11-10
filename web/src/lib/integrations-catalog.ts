// Partner, service and safe configuration-key catalog for the landing ecosystem showcase.
// Key NAMES only. Values are never read or rendered by the frontend.

export type IntegrationLayer = 'payments' | 'data' | 'experience' | 'infrastructure' | 'security';

export interface IntegrationPartner {
  id: string;
  name: string;
  mark: string;
  layer: IntegrationLayer;
  role: string;
  services: string[];
  configKeys: string[];
}

export const INTEGRATION_LAYER_LABEL: Record<IntegrationLayer, string> = {
  payments: 'Payments',
  data: 'Market data',
  experience: 'Operator experience',
  infrastructure: 'Infrastructure',
  security: 'Security core',
};

export const INTEGRATION_PARTNERS: IntegrationPartner[] = [
  {
    id: 'paypal',
    name: 'PayPal Developer Platform',
    mark: 'PP',
    layer: 'payments',
    role: 'Reversible escrow, tracking, disputes and human co-sign',
    services: [
      'Orders v2 intent AUTHORIZE (29-day hold)',
      'Payments Authorizations v2 CAPTURE and VOID',
      'Shipment Tracking v1',
      'Customer Disputes v1 provide-evidence',
      'Agent Toolkit MCP',
      'Server SDK',
      'JS SDK v6 step-up co-sign',
      'Webhook CRC32 and RSA verification',
    ],
    configKeys: ['PAYPAL_CLIENT_ID', 'PAYPAL_CLIENT_SECRET', 'PAYPAL_WEBHOOK_ID', 'NEXT_PUBLIC_PAYPAL_CLIENT_ID', 'PAYPAL_ENVIRONMENT', 'PAYPAL_API_BASE_URL'],
  },
  {
    id: 'apimatic',
    name: 'APIMatic',
    mark: 'AM',
    layer: 'payments',
    role: 'Typed Go PayPal SDK generated from OpenAPI 3.0',
    services: ['Generated Go SDK for Orders, Authorizations, Tracking, Disputes', 'Context Plugin wired into MCP reasoning'],
    configKeys: ['APIMATIC_API_KEY', 'APIMATIC_CONTEXT_PLUGIN_ENABLED'],
  },
  {
    id: 'channel3',
    name: 'Channel3',
    mark: 'C3',
    layer: 'data',
    role: 'Fair-market medians and merchant authenticity',
    services: ['Real-time price medians across 100M+ SKUs', 'Merchant authenticity oracle', 'Checkout reroute to verified sellers'],
    configKeys: ['CHANNEL3_API_KEY', 'CHANNEL3_API_BASE_URL'],
  },
  {
    id: 'kernel',
    name: 'KERNEL',
    mark: 'KN',
    layer: 'security',
    role: 'Disposable cloud browsers for untrusted storefronts',
    services: ['Headless browser sandbox', 'Storefront capture before DOM sanitization'],
    configKeys: ['KERNEL_API_KEY', 'KERNEL_API_BASE_URL'],
  },
  {
    id: 'aggrid',
    name: 'AG Grid Enterprise and AG Studio',
    mark: 'AG',
    layer: 'experience',
    role: 'Live CFO escrow ledger with an AI copilot',
    services: ['Streaming blotter with cell flash', 'Master-detail forensics', 'Integrated AG Charts', 'Natural-language AG Studio copilot'],
    configKeys: ['NEXT_PUBLIC_AG_GRID_LICENSE_KEY'],
  },
  {
    id: 'bryntum',
    name: 'Bryntum Scheduler Pro and Gantt',
    mark: 'BR',
    layer: 'experience',
    role: 'Delivery SLA timeline wired to PayPal VOID',
    services: ['29-day hold and 48h SLA dependency timeline', 'Two-way drag to live VOID rollback', 'Bryntum MCP'],
    configKeys: ['BRYNTUM_MCP_URL'],
  },
  {
    id: 'elastic',
    name: 'Elastic Cloud',
    mark: 'EL',
    layer: 'infrastructure',
    role: 'Distributed tracing and threat vector index',
    services: ['W3C traceparent spans: Next.js to Go to Rust to PayPal', 'Vector threat index talos-dom-threats-v1', 'PII redaction'],
    configKeys: ['ELASTIC_OTLP_ENDPOINT', 'ELASTIC_API_KEY', 'ELASTICSEARCH_URL'],
  },
  {
    id: 'render',
    name: 'Render',
    mark: 'RD',
    layer: 'infrastructure',
    role: 'Five-service polyglot cloud blueprint',
    services: ['Rust firewall', 'Go orchestrator', 'Next.js console', 'Managed PostgreSQL 16', 'Managed Valkey'],
    configKeys: ['render.yaml blueprint', 'PORT', '/healthz probes'],
  },
  {
    id: 'postman',
    name: 'Postman',
    mark: 'PM',
    layer: 'infrastructure',
    role: 'Runnable collection for every route and MCP tool',
    services: ['16-request Collection v2.1', 'Sandbox environment', 'Full PayPal lifecycle runs'],
    configKeys: ['Talos-Sandbox-MCP collection', 'Sandbox environment'],
  },
  {
    id: 'core',
    name: 'Polyglot security core',
    mark: 'TX',
    layer: 'security',
    role: 'Rust firewall, Go escrow state machine, local AI models',
    services: [
      'Rust 1.85: Ed25519 mandates, RFC 9421 Web Bot Auth, rmcp',
      'lol_html plus DeBERTa-v3 INT8 ONNX classifier',
      'Go 1.24 two-phase commit with PostgreSQL 16',
      'Valkey 24h PayPal-Request-Id idempotency',
      'Deterministic sandbox replay fallback',
    ],
    configKeys: ['RUST_ED25519_SEED_HEX', 'ONNX_MODEL_PATH', 'DATABASE_URL', 'REDIS_URL', 'ANTHROPIC_API_KEY', 'OPENAI_API_KEY', 'TALOS_SANDBOX_FALLBACK_ENABLED'],
  },
];
