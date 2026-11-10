// Demo personas for investor / judge 1-click PayPal Sandbox onboarding

export type DemoPersonaId = 'investor' | 'cfo' | 'security';
export type AgentRuntimeId = 'claude-37' | 'openai-operator' | 'custom-mcp';

export interface DemoPersona {
  id: DemoPersonaId;
  title: string;
  name: string;
  role: string;
  email: string;
  summary: string;
  routeAfterLogin: string;
  highlight: string;
  defaultAllowanceUsd: number;
}

export interface AuthSession {
  authenticated: boolean;
  personaId: DemoPersonaId | null;
  displayName: string;
  email: string;
  workspace: string;
  agentRuntime: AgentRuntimeId | null;
  allowanceUsd: number;
  oauthState: 'idle' | 'handshake' | 'connected';
}

export const DEMO_PERSONAS: DemoPersona[] = [
  {
    id: 'investor',
    title: 'Investor / VC Pitch Mode',
    name: 'Jordan Blake',
    role: 'Partner · Clearwater Ventures',
    email: 'jordan.blake@clearwater.vc',
    summary: 'Opens the guided 60-second storyline with CFO unit economics highlighted.',
    routeAfterLogin: '/story',
    highlight: 'CFO economics + live simulation',
    defaultAllowanceUsd: 300,
  },
  {
    id: 'cfo',
    title: 'Enterprise CFO',
    name: 'Alex Rivera',
    role: 'CFO · Acme Studio',
    email: 'alex.rivera@acme.studio',
    summary: 'Preloads the $300 allowance and live PayPal Escrow blotter.',
    routeAfterLogin: '/command-center',
    highlight: '$300 allowance + escrow blotter',
    defaultAllowanceUsd: 300,
  },
  {
    id: 'security',
    title: 'Security Architect',
    name: 'Dr. Priya Nair',
    role: 'Principal Security Architect',
    email: 'priya.nair@acme.studio',
    summary: 'Preloads the Red-Team simulator with technical proof drawers ready.',
    routeAfterLogin: '/simulator',
    highlight: 'Red-Team simulator + proof drawers',
    defaultAllowanceUsd: 300,
  },
];

export const AGENT_RUNTIMES: Array<{ id: AgentRuntimeId; label: string; detail: string }> = [
  {
    id: 'claude-37',
    label: 'Claude 3.7 Computer Use',
    detail: 'Desktop-use agent with TALOS mandate binding',
  },
  {
    id: 'openai-operator',
    label: 'OpenAI Operator',
    detail: 'Browser operator with PayPal escrow co-sign',
  },
  {
    id: 'custom-mcp',
    label: 'Custom MCP Agent',
    detail: 'Bring-your-own MCP runtime over /mcp',
  },
];

export const EMPTY_AUTH_SESSION: AuthSession = {
  authenticated: false,
  personaId: null,
  displayName: '',
  email: '',
  workspace: '',
  agentRuntime: null,
  allowanceUsd: 300,
  oauthState: 'idle',
};

export function buildPersonaSession(persona: DemoPersona): AuthSession {
  return {
    authenticated: true,
    personaId: persona.id,
    displayName: persona.name,
    email: persona.email,
    workspace: persona.role,
    agentRuntime: persona.id === 'security' ? 'custom-mcp' : 'claude-37',
    allowanceUsd: persona.defaultAllowanceUsd,
    oauthState: 'connected',
  };
}
