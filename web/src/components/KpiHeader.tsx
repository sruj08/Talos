import { Ban, Landmark, PiggyBank, ShieldCheck } from 'lucide-react';
import { formatCents } from '@/lib/format';
import type { Kpis } from '@/lib/types';

interface KpiTileProps {
  label: string;
  value: string;
  foot: string;
  icon: React.ReactNode;
  testId: string;
}

function KpiTile({ label, value, foot, icon, testId }: KpiTileProps) {
  return (
    <div className="kpi" data-testid={testId}>
      <span className="kpi-label">
        {icon}
        {label}
      </span>
      <span className="kpi-value mono">{value}</span>
      <span className="kpi-foot">{foot}</span>
    </div>
  );
}

export function KpiHeader({ kpis }: { kpis: Kpis }) {
  return (
    <section className="kpis" aria-label="Command Center key metrics">
      <KpiTile
        testId="kpi-gmv"
        label="Protected GMV"
        value={formatCents(kpis.protectedGmvCents)}
        foot="Held + captured + blocked exposure"
        icon={<ShieldCheck size={14} aria-hidden="true" />}
      />
      <KpiTile
        testId="kpi-blocked"
        label="Blocked Prompt Injections"
        value={kpis.attacksBlocked.toLocaleString('en-US')}
        foot="firewall-rs DOM + Channel3 gouging blocks"
        icon={<Ban size={14} aria-hidden="true" />}
      />
      <KpiTile
        testId="kpi-savings"
        label="Channel3 Savings"
        value={formatCents(kpis.channel3SavingsCents)}
        foot="Listed price above verified median"
        icon={<PiggyBank size={14} aria-hidden="true" />}
      />
      <KpiTile
        testId="kpi-auths"
        label="Active PayPal Authorizations"
        value={kpis.activeAuthorizations.toLocaleString('en-US')}
        foot={`${formatCents(kpis.heldCents)} held · ${formatCents(kpis.capturedCents)} captured`}
        icon={<Landmark size={14} aria-hidden="true" />}
      />
    </section>
  );
}
