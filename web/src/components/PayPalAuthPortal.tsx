'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Fingerprint, KeyRound, ShieldCheck, Wallet } from 'lucide-react';
import { useTalosClearing } from '../context/TalosClearingContext';
import {
  AGENT_RUNTIMES,
  AgentRuntimeId,
  DEMO_PERSONAS,
  DemoPersona,
} from '../lib/auth-personas';
import { navigateToRoute } from '../lib/navigation';

export type AuthPortalMode = 'login' | 'signup';

export interface PayPalAuthPortalProps {
  mode: AuthPortalMode;
}

export function PayPalAuthPortal({ mode }: PayPalAuthPortalProps) {
  const {
    authSession,
    signInWithPersona,
    completeOAuthHandshake,
    updateAuthSession,
  } = useTalosClearing();
  const [email, setEmail] = useState('alex.rivera@acme.studio');
  const [workspace, setWorkspace] = useState('Acme Studio · PayPal Sandbox');
  const [agentRuntime, setAgentRuntime] = useState<AgentRuntimeId>('claude-37');
  const [allowanceUsd, setAllowanceUsd] = useState(300);
  const [handshaking, setHandshaking] = useState(false);

  const activatePersona = (persona: DemoPersona) => {
    signInWithPersona(persona);
    navigateToRoute(persona.routeAfterLogin);
  };

  const startOAuth = () => {
    setHandshaking(true);
    updateAuthSession({ oauthState: 'handshake' });
    window.setTimeout(() => {
      completeOAuthHandshake(email.trim(), workspace.trim());
      updateAuthSession({
        agentRuntime: mode === 'signup' ? agentRuntime : authSession.agentRuntime || 'claude-37',
        allowanceUsd: mode === 'signup' ? allowanceUsd : authSession.allowanceUsd || 300,
      });
      setHandshaking(false);
      navigateToRoute(mode === 'signup' ? '/command-center' : '/story');
    }, 700);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8" data-testid="paypal-auth-portal" data-auth-mode={mode}>
      <section className="lg:col-span-7 space-y-5">
        <div className="space-y-2">
          <span className="paypal-label text-accent">
            {mode === 'login' ? 'PayPal Enterprise Sign In' : 'AI Agent Onboarding'}
          </span>
          <h1 className="paypal-headline-lg text-ink">
            {mode === 'login'
              ? 'Sign in with a 1-click demo persona or PayPal Sandbox'
              : 'Pair your AI agent with a PayPal spending vault'}
          </h1>
          <p className="paypal-body-sm text-ink-secondary max-w-[62ch]">
            Investors and judges never need credentials. Pick a persona, or run a mock PayPal OAuth2 + Passkey handshake into the live clearinghouse.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4" data-testid="demo-persona-cards">
          {DEMO_PERSONAS.map((persona) => (
            <button
              key={persona.id}
              type="button"
              data-testid={`persona-card-${persona.id}`}
              onClick={() => activatePersona(persona)}
              className="paypal-feature-card text-left space-y-3 active:scale-[0.99] transition-[transform,opacity] duration-150"
            >
              <span className="w-10 h-10 icon-medallion-paypal" aria-hidden="true">
                {persona.id === 'security' ? (
                  <KeyRound className="w-5 h-5" strokeWidth={1.75} />
                ) : persona.id === 'cfo' ? (
                  <Wallet className="w-5 h-5" strokeWidth={1.75} />
                ) : (
                  <ShieldCheck className="w-5 h-5" strokeWidth={1.75} />
                )}
              </span>
              <div className="space-y-1">
                <h2 className="paypal-title-sm text-ink">{persona.title}</h2>
                <p className="text-xs text-ink-secondary">{persona.name} · {persona.role}</p>
                <p className="text-xs text-ink-muted leading-relaxed">{persona.summary}</p>
              </div>
              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-accent">
                Enter as {persona.name.split(' ')[0]}
                <ArrowRight className="w-3.5 h-3.5" strokeWidth={2} aria-hidden="true" />
              </span>
            </button>
          ))}
        </div>
      </section>

      <section className="lg:col-span-5">
        <div className="paypal-checkout-module space-y-5" data-testid="paypal-oauth-panel">
          <div className="flex items-center gap-3">
            <span className="w-12 h-12 icon-medallion-paypal" aria-hidden="true">
              <Fingerprint className="w-6 h-6" strokeWidth={1.6} />
            </span>
            <div>
              <h2 className="paypal-title-sm text-ink">PayPal Sandbox OAuth2 + Passkey</h2>
              <p className="text-xs text-ink-secondary tabular-nums">
                Mock handshake · session badge syncs to navbar
              </p>
            </div>
          </div>

          <label className="block space-y-2">
            <span className="paypal-label text-ink-secondary">Work email</span>
            <input
              data-testid="auth-email-input"
              className="paypal-input w-full"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@company.com"
            />
          </label>

          <label className="block space-y-2">
            <span className="paypal-label text-ink-secondary">Workspace</span>
            <input
              data-testid="auth-workspace-input"
              className="paypal-input w-full"
              type="text"
              value={workspace}
              onChange={(e) => setWorkspace(e.target.value)}
              placeholder="Acme Studio · PayPal Sandbox"
            />
          </label>

          {mode === 'signup' ? (
            <>
              <fieldset className="space-y-3" data-testid="agent-runtime-picker">
                <legend className="paypal-label text-ink-secondary">AI agent runtime</legend>
                <div className="space-y-2">
                  {AGENT_RUNTIMES.map((runtime) => (
                    <button
                      key={runtime.id}
                      type="button"
                      data-testid={`agent-runtime-${runtime.id}`}
                      onClick={() => setAgentRuntime(runtime.id)}
                      className={
                        agentRuntime === runtime.id
                          ? 'w-full text-left paypal-tab-pill-active px-4 py-3'
                          : 'w-full text-left paypal-tab-pill px-4 py-3'
                      }
                    >
                      <span className="block text-sm font-bold">{runtime.label}</span>
                      <span className="block text-xs opacity-80">{runtime.detail}</span>
                    </button>
                  ))}
                </div>
              </fieldset>

              <label className="block space-y-2">
                <span className="paypal-label text-ink-secondary">Default spending allowance</span>
                <input
                  data-testid="auth-allowance-input"
                  className="paypal-input w-full tabular-nums"
                  type="number"
                  min={50}
                  max={5000}
                  step={50}
                  value={allowanceUsd}
                  onChange={(e) => setAllowanceUsd(Number(e.target.value) || 300)}
                />
              </label>
            </>
          ) : null}

          <button
            type="button"
            data-testid="btn-paypal-oauth-connect"
            onClick={startOAuth}
            disabled={handshaking}
            className="btn-paypal-primary w-full inline-flex items-center justify-center gap-2"
          >
            <span>
              {handshaking
                ? 'Connecting PayPal Sandbox…'
                : mode === 'signup'
                  ? 'Bind Vault & Enter Command Center'
                  : 'Sign In with PayPal Sandbox'}
            </span>
            <ArrowRight className="w-4 h-4" strokeWidth={2} aria-hidden="true" />
          </button>

          <p className="paypal-legal text-ink-muted">
            Session state: {authSession.oauthState}
            {authSession.authenticated ? ` · ${authSession.displayName}` : ''}
          </p>

          <div className="flex flex-wrap gap-3 text-sm">
            {mode === 'login' ? (
              <Link href="/signup" className="text-accent font-bold" data-testid="auth-switch-signup">
                Need agent pairing? Open signup
              </Link>
            ) : (
              <Link href="/login" className="text-accent font-bold" data-testid="auth-switch-login">
                Already onboarded? Sign in
              </Link>
            )}
            <Link href="/" className="text-ink-secondary font-bold" data-testid="auth-back-home">
              Back to landing
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
