'use client';

import { useState, useEffect, useCallback } from 'react';
import { KeyRound, Copy, Check, RefreshCw } from 'lucide-react';

const OTP_TTL = 180;

export default function GenerateOtpPage() {
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState<string | null>(null);
  const [remaining, setRemaining] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (remaining <= 0) return;
    const t = setInterval(() => setRemaining((r) => Math.max(0, r - 1)), 1000);
    return () => clearInterval(t);
  }, [remaining]);

  const generate = useCallback(async () => {
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length !== 10) {
      setError('Enter a valid 10-digit phone number');
      return;
    }
    setLoading(true);
    setError(null);
    setOtp(null);
    try {
      const res = await fetch('/api/admin/auth/generate-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: cleaned }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to generate OTP');
      setOtp(data.otp);
      setRemaining(data.expiresInSeconds || OTP_TTL);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }, [phone]);

  const copyOtp = useCallback(() => {
    if (!otp) return;
    navigator.clipboard.writeText(otp);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [otp]);

  const mm = String(Math.floor(remaining / 60)).padStart(2, '0');
  const ss = String(remaining % 60).padStart(2, '0');

  return (
    <div className="mx-auto max-w-md pt-4">
      <div className="mb-6">
        <h1 className="text-lg font-bold text-m-ink">Generate OTP</h1>
        <p className="mt-1 text-sm text-m-ink-2">
          Generate a one-time password for a user who can&apos;t receive SMS. Valid for 3 minutes.
        </p>
      </div>

      <div className="m-card p-5">
        <label className="block text-sm font-medium text-m-ink" htmlFor="otp-phone">
          Phone number
        </label>
        <div className="mt-2 flex gap-2">
          <input
            id="otp-phone"
            type="tel"
            inputMode="numeric"
            maxLength={10}
            placeholder="10-digit number"
            value={phone}
            onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
            onKeyDown={(e) => e.key === 'Enter' && generate()}
            className="m-field flex-1 tabular-nums"
          />
          <button
            type="button"
            onClick={generate}
            disabled={loading || phone.replace(/\D/g, '').length !== 10}
            className="inline-flex items-center gap-2 rounded-m-field bg-m-brand px-4 text-sm font-semibold text-m-on-brand transition-colors hover:bg-m-brand/90 disabled:opacity-50"
          >
            {loading ? (
              <RefreshCw className="size-4 animate-spin" />
            ) : (
              <KeyRound className="size-4" />
            )}
            Generate
          </button>
        </div>

        {error && (
          <p className="mt-3 text-sm text-m-danger">{error}</p>
        )}

        {otp && (
          <div className="mt-5 rounded-xl border border-m-line bg-m-surface p-4 text-center">
            <p className="text-xs font-medium text-m-ink-2">OTP for {phone}</p>
            <div className="mt-2 flex items-center justify-center gap-3">
              <span className="font-mono text-3xl font-bold tracking-[0.3em] text-m-ink">
                {otp}
              </span>
              <button
                type="button"
                onClick={copyOtp}
                className="rounded-lg p-2 text-m-ink-2 transition-colors hover:bg-m-surface-2"
                aria-label="Copy OTP"
              >
                {copied ? <Check className="size-5 text-green-600" /> : <Copy className="size-5" />}
              </button>
            </div>
            <p className={`mt-3 text-sm font-medium tabular-nums ${remaining > 30 ? 'text-m-ink-2' : 'text-m-danger'}`}>
              {remaining > 0 ? `Expires in ${mm}:${ss}` : 'Expired'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
