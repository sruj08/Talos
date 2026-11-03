import { describe, expect, it, vi, afterEach } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MandateStudio } from './MandateStudio';

afterEach(() => vi.unstubAllGlobals());

describe('MandateStudio', () => {
  it('signs via WebCrypto fallback when firewall-rs is offline and shows pubkey + signature + digest', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('fetch failed')));
    const onSigned = vi.fn();
    render(<MandateStudio onSigned={onSigned} />);

    fireEvent.click(screen.getByRole('button', { name: /sign kya mandate/i }));

    await waitFor(() => expect(screen.getByTestId('mandate-result')).toBeInTheDocument());
    expect(screen.getByTestId('mandate-pubkey').textContent).toMatch(/^[0-9a-f]{64}$/);
    expect(screen.getByTestId('mandate-signature').textContent).toMatch(/^[0-9a-f]{32}…[0-9a-f]{16}$/);
    expect(screen.getByTestId('mandate-digest').textContent).toMatch(/^[0-9a-f]{64}$/);
    expect(screen.getByText(/WebCrypto fallback/i)).toBeInTheDocument();
    await waitFor(() => expect(screen.getByText(/SIGNATURE VERIFIED/)).toBeInTheDocument());
    expect(onSigned).toHaveBeenCalledOnce();
    expect(onSigned.mock.calls[0][0].mandate.max_amount_cents).toBe(30000);
  });

  it('uses the firewall-rs signature when the service responds', async () => {
    const fetchMock = vi.fn(async (_url: string, init?: RequestInit) => {
      const body = JSON.parse(String(init?.body));
      return new Response(
        JSON.stringify({ ...body, ed25519_pubkey_hex: 'ab'.repeat(32), ed25519_signature_hex: 'cd'.repeat(64) }),
        { status: 200, headers: { 'Content-Type': 'application/json' } },
      );
    });
    vi.stubGlobal('fetch', fetchMock);
    render(<MandateStudio />);
    fireEvent.click(screen.getByRole('button', { name: /sign kya mandate/i }));
    await waitFor(() => expect(screen.getByText(/SIGNED BY firewall-rs/)).toBeInTheDocument());
    expect(String(fetchMock.mock.calls[0][0])).toMatch(/\/v1\/mandates\/sign$/);
    expect(screen.getByTestId('mandate-pubkey').textContent).toBe('ab'.repeat(32));
  });

  it('disables signing when no category is selected', () => {
    render(<MandateStudio />);
    fireEvent.click(screen.getByRole('button', { name: 'audio_equipment' }));
    fireEvent.click(screen.getByRole('button', { name: 'electronics' }));
    expect(screen.getByRole('button', { name: /sign kya mandate/i })).toBeDisabled();
  });
});
