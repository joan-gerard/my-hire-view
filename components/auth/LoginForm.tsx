'use client';

import { useState } from 'react';
import AuthPageShell from '@/components/auth/AuthPageShell';
import { AuthErrorAlert } from '@/components/auth/AuthAlert';
import AuthSubmitButton from '@/components/auth/AuthSubmitButton';
import PasswordField from '@/components/auth/PasswordField';
import { AUTH_INPUT_CLASS } from '@/components/auth/auth-form-styles';

export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // Sign in via API route so the server sets session cookies on the response.
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
        credentials: 'include',
      });

      const body = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(body.error ?? 'Sign in failed');
        setLoading(false);
        return;
      }

      window.location.href = '/admin';
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
      setLoading(false);
    }
  };

  return (
    <AuthPageShell
      title="Sign in to your account"
      alternateHref="/signup"
      alternateLabel="create a new account"
    >
      <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
        {error && <AuthErrorAlert message={error} />}
        <div className="-space-y-px rounded-md shadow-sm">
          <div>
            <label htmlFor="email-address" className="sr-only">
              Email address
            </label>
            <input
              id="email-address"
              name="email"
              type="email"
              autoComplete="email"
              required
              className={`${AUTH_INPUT_CLASS} rounded-t-md`}
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <PasswordField
            id="password"
            name="password"
            label="Password"
            autoComplete="current-password"
            required
            className="rounded-b-md"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <div>
          <AuthSubmitButton
            loading={loading}
            idleLabel="Sign in"
            loadingLabel="Signing in..."
          />
        </div>
      </form>
    </AuthPageShell>
  );
}
