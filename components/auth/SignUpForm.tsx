'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function SignUpForm() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setNotice(null);

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          password,
          confirmPassword,
          first_name: firstName,
          last_name: lastName,
        }),
        credentials: 'include',
      });

      const body = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(body.error ?? 'Sign up failed');
        setLoading(false);
        return;
      }

      if (body.requiresConfirmation) {
        setNotice(
          'Please check your email to confirm your account before signing in.',
        );
        setLoading(false);
        return;
      }

      window.location.href = '/admin';
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'An unexpected error occurred',
      );
      setLoading(false);
    }
  };

  const inputClassName =
    'relative block w-full border-0 px-3 py-2 text-[var(--foreground)] ring-1 ring-inset ring-[var(--foreground)]/20 placeholder:text-[var(--foreground)]/50 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-[var(--brand-primary)] sm:text-sm sm:leading-6';

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--background)] px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-[var(--foreground)]">
            Create your account
          </h2>
          <p className="mt-2 text-center text-sm text-[var(--foreground)]/80">
            Or{' '}
            <Link
              href="/login"
              className="font-medium text-[var(--brand-primary)] hover:opacity-80"
            >
              sign in to your existing account
            </Link>
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="rounded-md bg-red-50 p-4">
              <div className="text-sm text-red-800">{error}</div>
            </div>
          )}
          {notice && (
            <div className="rounded-md bg-[var(--brand-secondary)] p-4">
              <div className="text-sm text-[var(--foreground)]">{notice}</div>
            </div>
          )}
          <div className="space-y-0 rounded-md shadow-sm">
            <div className="grid grid-cols-1 sm:grid-cols-2">
              <div>
                <label htmlFor="first-name" className="sr-only">
                  First name
                </label>
                <input
                  id="first-name"
                  name="first_name"
                  type="text"
                  autoComplete="given-name"
                  required
                  className={`${inputClassName} rounded-t-md sm:rounded-tr-none sm:rounded-tl-md`}
                  placeholder="First name"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="last-name" className="sr-only">
                  Last name
                </label>
                <input
                  id="last-name"
                  name="last_name"
                  type="text"
                  autoComplete="family-name"
                  required
                  className={`${inputClassName} sm:rounded-tr-md`}
                  placeholder="Last name"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                />
              </div>
            </div>
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
                className={inputClassName}
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                minLength={6}
                className={inputClassName}
                placeholder="Password (min. 6 characters)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="confirm-password" className="sr-only">
                Confirm password
              </label>
              <input
                id="confirm-password"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                required
                minLength={6}
                className={`${inputClassName} rounded-b-md`}
                placeholder="Confirm password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative flex w-full justify-center rounded-md bg-[var(--brand-primary)] px-3 py-2 text-sm font-semibold text-[var(--brand-primary-text)] hover:opacity-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--brand-primary)] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating account...' : 'Sign up'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
