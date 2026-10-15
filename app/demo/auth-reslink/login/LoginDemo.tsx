"use client";

import Link from "next/link";
import { useState } from "react";
import DemoAuthBanner from "../DemoAuthBanner";
import DemoLogo from "../DemoLogo";

export default function LoginDemo() {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="mhv-auth-demo mhv-auth-demo--login">
      <DemoAuthBanner active="login" />
      <div className="mhv-auth-demo-login-stage">
        <div className="mhv-auth-demo-card">
          <DemoLogo />
          <h1>Welcome back</h1>
          <p className="mhv-auth-demo-lead">
            No account yet?{" "}
            <Link href="/demo/auth-reslink/signup">Create one</Link>
          </p>

          <form
            onSubmit={(e) => {
              e.preventDefault();
            }}
          >
            <div className="mhv-auth-demo-field">
              <label className="mhv-auth-demo-label" htmlFor="demo-login-email">
                Email
              </label>
              <input
                id="demo-login-email"
                className="mhv-auth-demo-input"
                type="email"
                autoComplete="email"
                defaultValue="you@example.com"
              />
            </div>

            <div className="mhv-auth-demo-field">
              <label
                className="mhv-auth-demo-label"
                htmlFor="demo-login-password"
              >
                Password
              </label>
              <div className="mhv-auth-demo-password-wrap">
                <input
                  id="demo-login-password"
                  className="mhv-auth-demo-input"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  defaultValue="password"
                />
                <button
                  type="button"
                  className="mhv-auth-demo-eye"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  aria-pressed={showPassword}
                  onClick={() => setShowPassword((v) => !v)}
                >
                  <EyeIcon open={showPassword} />
                </button>
              </div>
            </div>

            <button type="submit" className="mhv-auth-demo-submit">
              Sign in
              <span className="mhv-auth-demo-submit-arrow" aria-hidden>
                →
              </span>
            </button>
          </form>

          <p className="mhv-auth-demo-legal">
            Signing in means you accept the{" "}
            <Link href="/terms">Terms</Link> and{" "}
            <Link href="/privacy">Privacy Policy</Link>.
          </p>
        </div>
      </div>
    </div>
  );
}

function EyeIcon({ open }: { open: boolean }) {
  if (open) {
    return (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
        <path
          d="M3 3l18 18M10.5 10.7a2 2 0 002.8 2.8M9.9 5.1A10.5 10.5 0 0121 12c-.5 1-1.2 2-2.1 2.8M6.1 6.1C4.4 7.4 3.1 9.1 2.3 12c1.8 4.5 6 7.5 9.7 7.5 1.4 0 2.8-.3 4-.9"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
        />
      </svg>
    );
  }
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M2.3 12C4.1 7.5 8.3 4.5 12 4.5S19.9 7.5 21.7 12C19.9 16.5 15.7 19.5 12 19.5S4.1 16.5 2.3 12z"
        stroke="currentColor"
        strokeWidth="1.75"
      />
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.75" />
    </svg>
  );
}
