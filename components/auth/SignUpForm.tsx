'use client';

import { useState } from 'react';
import AuthPageShell from '@/components/auth/AuthPageShell';
import { AuthErrorAlert, AuthNoticeAlert } from '@/components/auth/AuthAlert';
import AuthSubmitButton from '@/components/auth/AuthSubmitButton';
import PasswordField from '@/components/auth/PasswordField';
import { AUTH_INPUT_CLASS } from '@/components/auth/auth-form-styles';
import {
  getSignupPasswordError,
  SIGNUP_PASSWORD_MIN_LENGTH,
  SIGNUP_PASSWORD_RULES_HINT,
} from '@/lib/validation/auth';

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

    const passwordError = getSignupPasswordError(password);
    if (passwordError) {
      setError(passwordError);
      return;
    }

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

  return (
    <AuthPageShell
      title="Create your account"
      alternateHref="/login"
      alternateLabel="sign in to your existing account"
    >
      <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
        {error && <AuthErrorAlert message={error} />}
        {notice && <AuthNoticeAlert message={notice} />}
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
                className={`${AUTH_INPUT_CLASS} rounded-t-md sm:rounded-tr-none sm:rounded-tl-md`}
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
                className={`${AUTH_INPUT_CLASS} sm:rounded-tr-md`}
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
              className={AUTH_INPUT_CLASS}
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <PasswordField
            id="password"
            name="password"
            label="Password"
            autoComplete="new-password"
            required
            minLength={SIGNUP_PASSWORD_MIN_LENGTH}
            placeholder="Password *"
            aria-describedby="signup-password-hint"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <PasswordField
            id="confirm-password"
            name="confirmPassword"
            label="Confirm password"
            autoComplete="new-password"
            required
            minLength={SIGNUP_PASSWORD_MIN_LENGTH}
            className="rounded-b-md"
            placeholder="Confirm password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
        </div>
        <p
          id="signup-password-hint"
          className="text-xs text-[var(--foreground)]/70"
        >
          * {SIGNUP_PASSWORD_RULES_HINT}.
        </p>

        <div>
          <AuthSubmitButton
            loading={loading}
            idleLabel="Sign up"
            loadingLabel="Creating account..."
          />
        </div>
      </form>
    </AuthPageShell>
  );
}
