"use client";

import Link from "next/link";
import { useState } from "react";
import DemoAuthBanner from "../DemoAuthBanner";
import DemoLogo from "../DemoLogo";

export default function SignupDemo() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  return (
    <div className="mhv-auth-demo mhv-auth-demo--signup">
      <DemoAuthBanner active="signup" />
      <div className="mhv-auth-demo-signup-stage">
        <div className="mhv-auth-demo-shell">
          <div className="mhv-auth-demo-shell-form">
            <DemoLogo />
            <h1>Create your account</h1>
            <p className="mhv-auth-demo-lead">
              Start free. Build a hire view you can share with one URL.
            </p>

            <form
              onSubmit={(e) => {
                e.preventDefault();
              }}
            >
              <div className="mhv-auth-demo-name-row">
                <div className="mhv-auth-demo-field">
                  <label
                    className="mhv-auth-demo-label"
                    htmlFor="demo-signup-first"
                  >
                    First name
                  </label>
                  <input
                    id="demo-signup-first"
                    className="mhv-auth-demo-input"
                    type="text"
                    autoComplete="given-name"
                    placeholder="Jordan"
                  />
                </div>
                <div className="mhv-auth-demo-field">
                  <label
                    className="mhv-auth-demo-label"
                    htmlFor="demo-signup-last"
                  >
                    Last name
                  </label>
                  <input
                    id="demo-signup-last"
                    className="mhv-auth-demo-input"
                    type="text"
                    autoComplete="family-name"
                    placeholder="Lee"
                  />
                </div>
              </div>

              <div className="mhv-auth-demo-field">
                <label
                  className="mhv-auth-demo-label"
                  htmlFor="demo-signup-email"
                >
                  Email
                </label>
                <input
                  id="demo-signup-email"
                  className="mhv-auth-demo-input"
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                />
              </div>

              <div className="mhv-auth-demo-field">
                <label
                  className="mhv-auth-demo-label"
                  htmlFor="demo-signup-password"
                >
                  Password
                </label>
                <div className="mhv-auth-demo-password-wrap">
                  <input
                    id="demo-signup-password"
                    className="mhv-auth-demo-input"
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    placeholder="At least 8 characters"
                  />
                  <button
                    type="button"
                    className="mhv-auth-demo-eye"
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                    aria-pressed={showPassword}
                    onClick={() => setShowPassword((v) => !v)}
                  >
                    <EyeIcon open={showPassword} />
                  </button>
                </div>
              </div>

              <div className="mhv-auth-demo-field">
                <label
                  className="mhv-auth-demo-label"
                  htmlFor="demo-signup-confirm"
                >
                  Confirm password
                </label>
                <div className="mhv-auth-demo-password-wrap">
                  <input
                    id="demo-signup-confirm"
                    className="mhv-auth-demo-input"
                    type={showConfirm ? "text" : "password"}
                    autoComplete="new-password"
                    placeholder="Confirm password"
                  />
                  <button
                    type="button"
                    className="mhv-auth-demo-eye"
                    aria-label={
                      showConfirm
                        ? "Hide confirm password"
                        : "Show confirm password"
                    }
                    aria-pressed={showConfirm}
                    onClick={() => setShowConfirm((v) => !v)}
                  >
                    <EyeIcon open={showConfirm} />
                  </button>
                </div>
              </div>

              <p className="mhv-auth-demo-hint">
                At least 8 characters, including one special character.
              </p>

              <button type="submit" className="mhv-auth-demo-submit">
                Sign up
                <span className="mhv-auth-demo-submit-arrow" aria-hidden>
                  →
                </span>
              </button>
            </form>

            <p className="mhv-auth-demo-shell-foot">
              Already have an account?{" "}
              <Link href="/demo/auth-reslink/login">Log in</Link>
            </p>
          </div>

          <aside className="mhv-auth-demo-shell-promo" aria-hidden>
            <div className="mhv-auth-demo-promo-inner">
              <span className="mhv-auth-demo-promo-badge">Published</span>
              <h2>A page that survives the inbox</h2>
              <p className="mhv-auth-demo-promo-lead">
                Tailor one hire view per role — story, proof, and how to reach
                you.
              </p>

              <div className="mhv-auth-demo-preview">
                <div className="mhv-auth-demo-preview-media">
                  <span className="mhv-auth-demo-preview-playing">Live</span>
                  <div className="mhv-auth-demo-preview-avatar">JL</div>
                </div>
                <div className="mhv-auth-demo-preview-body">
                  <strong>Jordan Lee</strong>
                  <p className="mhv-auth-demo-preview-meta">
                    Product designer · applying to Northwind
                  </p>
                  <p className="mhv-auth-demo-preview-stat">
                    Shared for the senior design role
                  </p>
                </div>
              </div>
            </div>
          </aside>
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
