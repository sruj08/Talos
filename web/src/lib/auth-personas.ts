// Demo personas for investor / judge 1-click PayPal Sandbox onboarding

export type DemoPersonaId = 'procurement' | 'builder' | 'cfo';
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
    id: 'procurement',
    title: 'Procurement Head',
    name: 'Meera Kapoor',
    role: 'Head of Procurement, Halden Audio Group',
    email: 'meera.kapoor@halden.example',
    summary: 'Sets the agent allowance, then watches it buy studio gear inside the rules.',
    routeAfterLogin: '/mandates',
    highlight: 'Allowance rules and live buying',
    defaultAllowanceUsd: 300,
  },
  {
    id: 'builder',
    title: 'Indie AI Builder',
    name: 'Tomas Reyes',
    role: 'Builds shopping agents on MCP',
    email: 'tomas.reyes@agentlab.example',
    summary: 'Opens the live simulator to throw prompt injections and price traps at the agent.',
    routeAfterLogin: '/simulator',
    highlight: 'Simulator, hazards and X-Ray',
    defaultAllowanceUsd: 300,
  },
  {
    id: 'cfo',
    title: 'CFO Auditor',
    name: 'Grace Okafor',
    role: 'CFO, Halden Audio Group',
    email: 'grace.okafor@halden.example',
    summary: 'Lands in the escrow ledger to audit every hold, capture, refund and blocked attack.',
    routeAfterLogin: '/blotter',
    highlight: 'Escrow ledger and AI copilot',
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
    agentRuntime: persona.id === 'builder' ? 'custom-mcp' : 'claude-37',
    allowanceUsd: persona.defaultAllowanceUsd,
    oauthState: 'connected',
  };
}
