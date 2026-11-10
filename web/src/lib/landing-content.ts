// Landing page content model. Numbers mirror the deterministic simulator presets.

export type PreviewScenarioId = 'SCAM' | 'HONEST' | 'LATE_BIG';

export interface PreviewOutcome {
  amount: string;
  verdict: string;
  beats: string[];
}

export interface PreviewScenario {
  id: PreviewScenarioId;
  tab: string;
  tabMeta: string;
  storeUrl: string;
  item: string;
  unprotected: PreviewOutcome;
  protectedRun: PreviewOutcome;
}

export const PREVIEW_SCENARIOS: PreviewScenario[] = [
  {
    id: 'SCAM',
    tab: 'Poisoned scam store',
    tabMeta: '$480 trap blocked',
    storeUrl: 'shadowgear-outlet.shop',
    item: 'Shure SM7B microphone',
    unprotected: {
      amount: '-$480',
      verdict: 'Lost irreversibly',
      beats: ['Reads hidden "transfer $480" text', 'Skips the price check', 'Pays the seller directly'],
    },
    protectedRun: {
      amount: '+$231',
      verdict: 'Saved, bought at $249',
      beats: ['Hidden text stripped in 2.84ms', '$480 flagged: +92.7% over median', 'Rerouted to a verified store'],
    },
  },
  {
    id: 'HONEST',
    tab: 'Honest verified store',
    tabMeta: '$249 held in escrow',
    storeUrl: 'audiopro-supply.com',
    item: 'Shure SM7B microphone',
    unprotected: {
      amount: '$249',
      verdict: 'Paid, no recourse',
      beats: ['Pays before anything ships', 'No delivery guarantee', 'Dispute is a manual fight'],
    },
    protectedRun: {
      amount: '$249',
      verdict: 'Paid after FedEx delivery',
      beats: ['PayPal AUTHORIZE holds the money', 'FedEx confirms delivery at 26h', 'Seller is paid on proof'],
    },
  },
  {
    id: 'LATE_BIG',
    tab: 'Late delivery + big order',
    tabMeta: '0-second refund',
    storeUrl: 'audiopro-supply.com',
    item: 'Scarlett 4i4 + Genelec monitors',
    unprotected: {
      amount: '-$669',
      verdict: 'Late item and over-cap spend lost',
      beats: ['$450 bought without asking', 'Seller misses 48h delivery', 'Money is already gone'],
    },
    protectedRun: {
      amount: '$0 lost',
      verdict: '$219 refunded, $450 waits for you',
      beats: ['Carrier misses SLA: instant VOID', '$450 over the $300 cap pauses', 'Approve with PayPal in one click'],
    },
  },
];

export interface ArchitecturePillar {
  index: string;
  title: string;
  promise: string;
  stat: string;
  statLabel: string;
  visual: 'allowance' | 'sanitizer' | 'radar' | 'escrow';
}

export const ARCHITECTURE_PILLARS: ArchitecturePillar[] = [
  {
    index: '01',
    title: 'Cryptographic spending allowance',
    promise: 'You sign the rules before the agent shops: budget, fair-price tolerance, delivery deadline.',
    stat: '$300',
    statLabel: 'cap, 15% spread, 48h SLA',
    visual: 'allowance',
  },
  {
    index: '02',
    title: 'Webpage trap sanitizer',
    promise: 'Invisible instructions hidden in merchant pages are stripped before the agent ever reads them.',
    stat: '<4ms',
    statLabel: 'per page, on-device model',
    visual: 'sanitizer',
  },
  {
    index: '03',
    title: 'Fair-market price radar',
    promise: 'Every price is checked against live medians. Gouging is blocked and the agent is rerouted.',
    stat: '100M+',
    statLabel: 'products benchmarked',
    visual: 'radar',
  },
  {
    index: '04',
    title: 'Reversible PayPal delivery escrow',
    promise: 'PayPal holds the money until tracking proves on-time delivery. Miss the SLA and it refunds instantly.',
    stat: '0s',
    statLabel: 'refund on a missed SLA',
    visual: 'escrow',
  },
];

export const INVESTOR_METRICS = [
  { value: '29 days', label: 'Escrow float yield', detail: 'PayPal earns on authorized funds while goods are in transit.' },
  { value: 'Signed caps', label: 'Unlocked agentic spend', detail: 'A per-agent cap lets a CFO approve autonomous buying without writing a blank check.' },
  { value: '$0', label: 'Manual dispute overhead', detail: 'Traps are blocked before payment and late orders void themselves.' },
] as const;
