import AuthSignupPromo from '@/components/auth/AuthSignupPromo';
import '@/components/auth/auth-layout.css';
import { LogoBlack } from '@/components/ui/Logo';
import Link from 'next/link';
import type { ReactNode } from 'react';

type AuthPageShellProps = {
  variant: 'login' | 'signup';
  title: string;
  /** Signup supporting line under the title. Unused on login. */
  description?: string;
  alternateHref: string;
  alternateLabel: string;
  /** Prefix before the alternate link (e.g. "No account yet?"). */
  alternatePrompt: string;
  children: ReactNode;
  footer?: ReactNode;
};

/**
 * Production auth chrome — Reslink-inspired layouts with MyHireView tokens.
 * Login: centered card on soft atmosphere. Signup: white/ink split shell.
 */
export default function AuthPageShell({
  variant,
  title,
  description,
  alternateHref,
  alternateLabel,
  alternatePrompt,
  children,
  footer,
}: AuthPageShellProps) {
  if (variant === 'login') {
    return (
      <div className="mhv-auth mhv-auth--login">
        <div className="mhv-auth-login-stage">
          <div className="mhv-auth-card">
            <div className="mhv-auth-card-logo">
              <LogoBlack />
            </div>
            <h1>{title}</h1>
            <p className="mhv-auth-lead">
              {alternatePrompt}{' '}
              <Link href={alternateHref}>{alternateLabel}</Link>
            </p>
            {children}
            {footer}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mhv-auth mhv-auth--signup">
      <div className="mhv-auth-signup-stage">
        <div className="mhv-auth-shell">
          <div className="mhv-auth-shell-form">
            <div className="mhv-auth-card-logo">
              <LogoBlack />
            </div>
            <h1>{title}</h1>
            {description ? (
              <p className="mhv-auth-lead">{description}</p>
            ) : null}
            {children}
            <p className="mhv-auth-shell-foot">
              {alternatePrompt}{' '}
              <Link href={alternateHref}>{alternateLabel}</Link>
            </p>
            {footer}
          </div>
          <AuthSignupPromo />
        </div>
      </div>
    </div>
  );
}
