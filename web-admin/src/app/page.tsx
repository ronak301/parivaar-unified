'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function LoginPage() {
  const router = useRouter();
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('auth_token');
      if (!token) return;

      try {
        const res = await fetch('/api/auth/restore', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token }),
        });
        // Only bounce to /admin if the token was actually accepted —
        // otherwise a stale token silently strands the user on a redirect loop.
        if (res.ok) {
          router.push('/admin');
        } else {
          localStorage.removeItem('auth_token');
        }
      } catch {
        // Network hiccup — stay on the login page instead of redirecting blind.
      }
    };
    checkAuth();
  }, [router]);

  function handleClearStorage() {
    localStorage.clear();
    setError('');
    window.location.reload();
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, password }),
      });

      const data = await res.json();

      if (res.ok && data.token) {
        localStorage.setItem('auth_token', data.token);
        router.push('/admin');
        return;
      }

      setError(data.error || 'Invalid credentials');
    } catch {
      setError('Login failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#07006c] via-[#3230c4] to-[#6a44c7]">
      <div className="w-full max-w-md p-8 bg-white rounded-xl shadow-2xl">
        <div className="flex flex-col gap-2 mb-8 items-center text-center">
          <img src="/logo.png" alt="Parivaar" className="h-16 w-16" />
          <h1 className="text-3xl font-bold text-foreground">Admin Portal</h1>
          <p className="text-sm text-muted-foreground">Community Management System</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="phone">Phone or Username</Label>
            <Input
              id="phone"
              type="text"
              autoCapitalize="none"
              autoCorrect="off"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
            />
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <Button type="submit" className="w-full" disabled={loading} size="lg">
            {loading ? 'Logging in...' : 'Login'}
          </Button>
        </form>

        <div className="mt-6 flex flex-col items-center gap-2 text-sm">
          <Link href="/m/login" className="text-primary hover:underline">
            Member Login
          </Link>
          <button
            type="button"
            onClick={handleClearStorage}
            className="text-muted-foreground hover:underline"
          >
            Having trouble logging in? Clear local storage
          </button>
        </div>
      </div>
    </div>
  );
}
