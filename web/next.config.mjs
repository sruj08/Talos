/** @type {import('next').NextConfig} */
const firewallBaseUrl = (
  process.env.RUST_FIREWALL_URL ||
  process.env.FIREWALL_RS_INTERNAL_URL ||
  'http://127.0.0.1:8081'
)
  .replace('://localhost:', '://127.0.0.1:')
  .replace(/\/+$/, '');

const orchestratorBaseUrl = (
  process.env.ORCHESTRATOR_GO_URL ||
  process.env.NEXT_PUBLIC_ORCHESTRATOR_URL ||
  'http://127.0.0.1:8082'
)
  .replace('://localhost:', '://127.0.0.1:')
  .replace(/\/+$/, '');

const nextConfig = {
  devIndicators: false,
  async rewrites() {
    return [
      {
        source: '/v1/mandates/:path*',
        destination: `${firewallBaseUrl}/v1/mandates/:path*`,
      },
      {
        source: '/v1/firewall/:path*',
        destination: `${firewallBaseUrl}/v1/firewall/:path*`,
      },
      {
        source: '/api/v1/:path*',
        destination: `${orchestratorBaseUrl}/api/v1/:path*`,
      },
    ];
  },
};

export default nextConfig;
