"use client";

import { motion } from "framer-motion";

/**
 * Shown after a successful waitlist signup. Fills the form column height and
 * centers the message to avoid layout shift.
 */
export function WaitlistSuccessMessage() {
  return (
    <div className="min-h-full flex flex-col justify-center">
      <motion.div
        className="mx-auto w-full max-w-md rounded-3xl border border-[var(--foreground)]/10 bg-[var(--brand-accent)]/30 p-8 text-center"
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
      >
        <div
          className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[var(--brand-primary)] text-[var(--brand-primary-text)]"
          aria-hidden
        >
          <svg
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2.5}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="text-xl font-light tracking-wide text-[var(--brand-primary)]">
          You&apos;re on the list!
        </h3>
        <p className="mt-2 text-[var(--foreground)]/90">
          Check your email for exclusive updates and be among the first to try
          MyHireView when we launch.
        </p>
      </motion.div>
    </div>
  );
}
