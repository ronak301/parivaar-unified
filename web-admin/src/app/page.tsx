'use client';

import { useState } from 'react';
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

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (phone === '9999999999' && password === '000000') {
      // Set dummy auth token
      document.cookie = 'auth_token=dummy_token; path=/';
      router.push('/admin');
      return;
    }

    setError('Invalid credentials. Use 9999999999 / 000000');
    setLoading(false);
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-slate-900 to-black">
      <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-lg">
        <div className="flex flex-col gap-2 mb-8 text-center">
          <h1 className="text-3xl font-bold text-foreground">Parivaar Admin</h1>
          <p className="text-sm text-muted-foreground">Community Management System</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              type="tel"
              placeholder="9999999999"
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
              placeholder="••••••"
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

        <div className="mt-6 p-4 bg-muted rounded text-xs text-muted-foreground">
          <p className="font-semibold mb-2">Demo Credentials:</p>
          <p>Phone: <code className="bg-background px-1 rounded">9999999999</code></p>
          <p>Password: <code className="bg-background px-1 rounded">000000</code></p>
        </div>
      </div>
    </div>
  );
}
