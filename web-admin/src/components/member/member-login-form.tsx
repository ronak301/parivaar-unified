'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Users } from 'lucide-react';
import { useMemberAuth } from '@/context/member-auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from '@/components/ui/input-otp';

type Step = 'phone' | 'otp';

export function MemberLoginForm() {
  const router = useRouter();
  const { refetch } = useMemberAuth();
  const [step, setStep] = useState<Step>('phone');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [verificationId, setVerificationId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSendOtp(e: React.FormEvent) {
    e.preventDefault();
    if (!phone || phone.length < 10) return;

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/member/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? 'Failed to send OTP');
        return;
      }

      setVerificationId(data.verificationId);
      setStep('otp');
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  async function handleVerifyOtp(e: React.FormEvent) {
    e.preventDefault();
    if (!otp || otp.length < 4) return;

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/member/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, otp, verificationId }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? 'Invalid OTP');
        return;
      }

      // Cookie is now set — reload the auth context so /m has the real user
      // (with communityIds) before we navigate; otherwise it renders stale/null.
      await refetch();
      router.replace('/m');
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-dvh flex-col">
      <div className="m-banner flex flex-col items-center gap-3 px-6 pb-10 pt-16">
        <div className="flex size-16 items-center justify-center rounded-2xl bg-white/20">
          <Users className="size-8" />
        </div>
        <h1 className="text-2xl font-bold">Parivaar</h1>
        <p className="text-sm opacity-90">Your community, connected</p>
      </div>

      <div className="-mt-6 flex-1 rounded-t-3xl bg-m-surface px-6 pt-8">
        <h2 className="text-lg font-semibold text-m-ink">
          {step === 'phone' ? 'Log in' : 'Verify OTP'}
        </h2>
        <p className="mt-1 text-sm text-m-ink-2">
          {step === 'phone'
            ? 'Enter your registered phone number'
            : `Enter the OTP sent to ${phone}`}
        </p>

        {step === 'phone' ? (
          <form onSubmit={handleSendOtp} className="mt-6 flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="10-digit mobile number"
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                maxLength={10}
                autoFocus
              />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button type="submit" disabled={loading || phone.length < 10} className="h-11">
              {loading ? 'Sending...' : 'Send OTP'}
            </Button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="mt-6 flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label>Enter OTP</Label>
              <InputOTP maxLength={6} value={otp} onChange={setOtp} autoFocus>
                <InputOTPGroup>
                  <InputOTPSlot index={0} />
                  <InputOTPSlot index={1} />
                  <InputOTPSlot index={2} />
                  <InputOTPSlot index={3} />
                  <InputOTPSlot index={4} />
                  <InputOTPSlot index={5} />
                </InputOTPGroup>
              </InputOTP>
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button type="submit" disabled={loading || otp.length < 4} className="h-11">
              {loading ? 'Verifying...' : 'Verify OTP'}
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                setStep('phone');
                setOtp('');
                setError('');
              }}
            >
              Change Number
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}
