'use client';

import { useState } from 'react';
import AuthPageShell from '@/components/auth/AuthPageShell';
import { AuthErrorAlert, AuthNoticeAlert } from '@/components/auth/AuthAlert';
import AuthSubmitButton from '@/components/auth/AuthSubmitButton';
import PasswordField from '@/components/auth/PasswordField';
import {
  AUTH_FIELD_CLASS,
  AUTH_INPUT_CLASS,
  AUTH_LABEL_CLASS,
} from '@/components/auth/auth-form-styles';
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
      variant="signup"
      title="Create your account"
      description="Start free. Build a hire view you can share with one URL."
      alternateHref="/login"
      alternateLabel="Log in"
      alternatePrompt="Already have an account?"
    >
      <form className="mhv-auth-form" onSubmit={handleSubmit}>
        {error && <AuthErrorAlert message={error} />}
        {notice && <AuthNoticeAlert message={notice} />}

        <div className="mhv-auth-name-row">
          <div className={AUTH_FIELD_CLASS}>
            <label className={AUTH_LABEL_CLASS} htmlFor="first-name">
              First name
            </label>
            <input
              id="first-name"
              name="first_name"
              type="text"
              autoComplete="given-name"
              required
              className={AUTH_INPUT_CLASS}
              placeholder="Jordan"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
            />
          </div>
          <div className={AUTH_FIELD_CLASS}>
            <label className={AUTH_LABEL_CLASS} htmlFor="last-name">
              Last name
            </label>
            <input
              id="last-name"
              name="last_name"
              type="text"
              autoComplete="family-name"
              required
              className={AUTH_INPUT_CLASS}
              placeholder="Lee"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
            />
          </div>
        </div>

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
            autoComplete="new-password"
            required
            minLength={SIGNUP_PASSWORD_MIN_LENGTH}
            placeholder="At least 8 characters"
            aria-describedby="signup-password-hint"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <div className={AUTH_FIELD_CLASS}>
          <PasswordField
            id="confirm-password"
            name="confirmPassword"
            label="Confirm password"
            labelVisible
            autoComplete="new-password"
            required
            minLength={SIGNUP_PASSWORD_MIN_LENGTH}
            placeholder="Confirm password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
        </div>

        <p id="signup-password-hint" className="mhv-auth-hint">
          {SIGNUP_PASSWORD_RULES_HINT}.
        </p>

        <AuthSubmitButton
          loading={loading}
          idleLabel="Sign up"
          loadingLabel="Creating account..."
        />
      </form>
    </AuthPageShell>
  );
}
