'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { fadeUp, viewport, transition } from '@/lib/landing-animations';

const JOB_SEARCH_OPTIONS = [
  { value: '', label: 'Select your status (optional)' },
  { value: 'Actively searching', label: 'Actively searching' },
  { value: 'Casually looking', label: 'Casually looking' },
  { value: 'Career planning', label: 'Career planning' },
  { value: 'Other', label: 'Other' },
] as const;

/**
 * Email capture form for the pre-launch landing page.
 * Submits to /api/waitlist; shows success message and early bird incentive per LANDING_PAGE_BRIEF.
 */
export default function EmailCaptureForm() {
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [jobSearchStatus, setJobSearchStatus] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrorMessage('');
    setStatus('loading');

    try {
      const res = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim(),
          first_name: firstName.trim() || undefined,
          job_search_status: jobSearchStatus || undefined,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setStatus('error');
        setErrorMessage(data?.error ?? 'Something went wrong. Please try again.');
        return;
      }

      setStatus('success');
      setEmail('');
      setFirstName('');
      setJobSearchStatus('');
    } catch {
      setStatus('error');
      setErrorMessage('Something went wrong. Please try again.');
    }
  }

  if (status === 'success') {
    return (
      <motion.div
        className="mx-auto max-w-xl rounded-xl bg-[var(--background)] p-8 text-center border border-[var(--foreground)]/10"
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
      >
        <p className="text-lg font-medium text-[var(--foreground)]">
          You&apos;re on the list! Check your email for exclusive updates and be among the first to try MyHireView when we launch.
        </p>
      </motion.div>
    );
  }

  return (
    <motion.section
      id="early-access"
      className="bg-[var(--secondary-background)] px-4 py-16 sm:px-6 sm:py-20 lg:px-8"
      initial={fadeUp.initial}
      whileInView={fadeUp.whileInView}
      viewport={viewport}
      transition={transition}
    >
      <div className="mx-auto max-w-xl text-center">
        <p className="text-sm font-semibold uppercase tracking-wide text-[var(--brand-primary)]">
          Be the first to stand out
        </p>
        <p className="mt-4 text-2xl font-bold text-[var(--foreground)] sm:text-3xl">
          Early signups get 3 months of Pro free when we launch!
        </p>
        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <div>
            <label htmlFor="waitlist-email" className="sr-only">
              Email address (required)
            </label>
            <input
              id="waitlist-email"
              type="email"
              required
              placeholder="Email address *"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={status === 'loading'}
              className="w-full rounded-lg border border-[var(--foreground)]/20 bg-[var(--background)] px-4 py-3 text-[var(--foreground)] placeholder:text-[var(--foreground)]/50 focus:border-[var(--brand-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)]/40 disabled:opacity-70"
            />
          </div>
          <div>
            <label htmlFor="waitlist-first-name" className="sr-only">
              First name (optional)
            </label>
            <input
              id="waitlist-first-name"
              type="text"
              autoComplete="given-name"
              placeholder="First name (optional)"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              disabled={status === 'loading'}
              className="w-full rounded-lg border border-[var(--foreground)]/20 bg-[var(--background)] px-4 py-3 text-[var(--foreground)] placeholder:text-[var(--foreground)]/50 focus:border-[var(--brand-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)]/40 disabled:opacity-70"
            />
          </div>
          <div>
            <label htmlFor="waitlist-status" className="sr-only">
              Current job search status (optional)
            </label>
            <select
              id="waitlist-status"
              value={jobSearchStatus}
              onChange={(e) => setJobSearchStatus(e.target.value)}
              disabled={status === 'loading'}
              className="w-full rounded-lg border border-[var(--foreground)]/20 bg-[var(--background)] px-4 py-3 text-[var(--foreground)] focus:border-[var(--brand-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)]/40 disabled:opacity-70"
            >
              {JOB_SEARCH_OPTIONS.map((opt) => (
                <option key={opt.value || 'empty'} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
          {errorMessage && (
            <p className="text-sm text-red-600" role="alert">
              {errorMessage}
            </p>
          )}
          <button
            type="submit"
            disabled={status === 'loading'}
            className="w-full rounded-lg bg-[var(--brand-primary)] px-6 py-4 text-lg font-semibold text-[var(--brand-primary-text)] shadow-md transition hover:opacity-95 focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)] focus:ring-offset-2 focus:ring-offset-[var(--secondary-background)] disabled:opacity-70"
          >
            {status === 'loading' ? 'Joining…' : 'Get Early Access'}
          </button>
        </form>
      </div>
    </motion.section>
  );
}
