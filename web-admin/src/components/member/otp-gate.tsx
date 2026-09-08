'use client';

import { useEffect, useState } from 'react';
import { ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';

type Purpose = 'profile_edit';

interface OtpGateProps {
  purpose: Purpose;
  title?: string;
  description?: string;
  /** Called with a short-lived action token once the OTP is verified. */
  onVerified: (actionToken: string) => void;
  onCancel?: () => void;
}

const RESEND_SECONDS = 30;

/**
 * Re-verifies the logged-in member's phone before a sensitive action.
 * Sends the OTP on mount, then exchanges the code for an action token.
 */
export function OtpGate({ purpose, title, description, onVerified, onCancel }: OtpGateProps) {
  const [phase, setPhase] = useState<'sending' | 'enter' | 'verifying'>('sending');
  const [verificationId, setVerificationId] = useState('');
  const [phoneHint, setPhoneHint] = useState('');
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [resendIn, setResendIn] = useState(RESEND_SECONDS);

  type SendResult =
    | { ok: true; verificationId: string; phoneHint: string }
    | { ok: false; error: string };

  /** Pure network call; callers apply state so the mount effect stays lint-clean. */
  async function requestOtp(): Promise<SendResult> {
    try {
      const res = await fetch('/api/member/auth/action-otp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ purpose }),
      });
      const data = await res.json();
      if (!res.ok) return { ok: false, error: data.error ?? 'Failed to send OTP' };
      return { ok: true, verificationId: data.verificationId, phoneHint: data.phoneHint ?? '' };
    } catch {
      return { ok: false, error: 'Network error. Please try again.' };
    }
  }

  function applySendResult(result: SendResult) {
    if (result.ok) {
      setVerificationId(result.verificationId);
      setPhoneHint(result.phoneHint);
      setResendIn(RESEND_SECONDS);
      setError('');
    } else {
      setError(result.error);
    }
    setPhase('enter');
  }

  // Send once on mount. StrictMode double-invokes effects in dev; the backend
  // rate limit and idempotent store make a duplicate send harmless.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const result = await requestOtp();
      if (!cancelled) applySendResult(result);
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (phase !== 'enter' || resendIn <= 0) return;
    const t = setTimeout(() => setResendIn((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [phase, resendIn]);

  async function verify(code: string) {
    if (code.length < 4 || !verificationId) return;
    setPhase('verifying');
    setError('');
    try {
      const res = await fetch('/api/member/auth/action-otp/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ purpose, otp: code, verificationId }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? 'Invalid OTP');
        setOtp('');
        setPhase('enter');
        return;
      }
      onVerified(data.actionToken);
    } catch {
      setError('Network error. Please try again.');
      setPhase('enter');
    }
  }

  return (
    <div className="flex flex-col items-center px-6 pb-8 pt-10 text-center">
      <div className="flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
        <ShieldCheck className="size-7" />
      </div>
      <h2 className="mt-4 text-lg font-bold">{title ?? 'Verify it’s you'}</h2>
      <p className="mt-1 max-w-xs text-sm text-muted-foreground">
        {description ?? 'For your security, confirm the OTP before editing your profile.'}
      </p>
      <p className="mt-3 text-xs text-muted-foreground">
        {phase === 'sending'
          ? 'Sending OTP…'
          : phoneHint
            ? `OTP sent to your number ending in ${phoneHint}`
            : 'OTP sent to your registered number'}
      </p>

      <div className="mt-6">
        <InputOTP
          maxLength={6}
          value={otp}
          onChange={(v) => {
            setOtp(v);
            if (v.length === 6) void verify(v);
          }}
          disabled={phase !== 'enter'}
          autoFocus
        >
          <InputOTPGroup>
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <InputOTPSlot key={i} index={i} />
            ))}
          </InputOTPGroup>
        </InputOTP>
      </div>

      {error && <p className="mt-3 text-sm text-destructive">{error}</p>}

      <Button
        className="mt-6 h-11 w-full max-w-xs"
        disabled={phase !== 'enter' || otp.length < 4}
        onClick={() => verify(otp)}
      >
        {phase === 'verifying' ? 'Verifying…' : 'Verify & Continue'}
      </Button>

      <div className="mt-3 flex items-center gap-4 text-xs">
        <button
          type="button"
          className="text-primary disabled:text-muted-foreground"
          disabled={phase !== 'enter' || resendIn > 0}
          onClick={async () => {
            setPhase('sending');
            setError('');
            setOtp('');
            applySendResult(await requestOtp());
          }}
        >
          {resendIn > 0 ? `Resend in ${resendIn}s` : 'Resend OTP'}
        </button>
        {onCancel && (
          <button type="button" className="text-muted-foreground" onClick={onCancel}>
            Cancel
          </button>
        )}
      </div>
    </div>
  );
}
