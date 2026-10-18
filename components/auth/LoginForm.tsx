'use client';

import { useState } from 'react';
import Link from 'next/link';
import AuthPageShell from '@/components/auth/AuthPageShell';
import { AuthErrorAlert } from '@/components/auth/AuthAlert';
import AuthSubmitButton from '@/components/auth/AuthSubmitButton';
import PasswordField from '@/components/auth/PasswordField';
import {
  AUTH_FIELD_CLASS,
  AUTH_INPUT_CLASS,
  AUTH_LABEL_CLASS,
} from '@/components/auth/auth-form-styles';

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
      variant="login"
      title="Welcome back"
      alternateHref="/signup"
      alternateLabel="Create one"
      alternatePrompt="No account yet?"
      footer={
        <p className="mhv-auth-legal">
          Signing in means you accept the <Link href="/terms">Terms</Link> and{' '}
          <Link href="/privacy">Privacy Policy</Link>.
        </p>
      }
    >
      <form className="mhv-auth-form" onSubmit={handleSubmit}>
        {error && <AuthErrorAlert message={error} />}
        <div className={AUTH_FIELD_CLASS}>
          <label className={AUTH_LABEL_CLASS} htmlFor="email-address">
            Email
          </label>
          <input
            id="email-address"
            name="email"
            type="email"
            autoComplete="email"
            required
            className={AUTH_INPUT_CLASS}
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className={AUTH_FIELD_CLASS}>
          <PasswordField
            id="password"
            name="password"
            label="Password"
            labelVisible
            autoComplete="current-password"
            required
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <AuthSubmitButton
          loading={loading}
          idleLabel="Sign in"
          loadingLabel="Signing in..."
        />
      </form>
    </AuthPageShell>
  );
}
