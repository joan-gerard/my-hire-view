'use client';

import { useState } from 'react';

interface CvUnavailableWithRetryProps {
  /** When provided, "Try again" calls this instead of refreshing the route. Enables a single API fetch + state update. */
  onRetry?: () => Promise<void>;
}

export default function CvUnavailableWithRetry({
  onRetry,
}: CvUnavailableWithRetryProps) {
  const [retrying, setRetrying] = useState(false);

  const handleTryAgain = async () => {
    if (!onRetry) return;
    setRetrying(true);
    try {
      await onRetry();
    } finally {
      setRetrying(false);
    }
  };

  return (
    <div
      role="alert"
      className="rounded-2xl border border-[var(--status-warning-fg)]/25 bg-[var(--status-warning-bg)] px-6 py-8 text-center"
    >
      <p className="font-semibold text-[var(--status-warning-fg)]">
        CV is not available
      </p>
      <p className="mt-2 text-sm text-[var(--status-warning-fg)]/90">
        The resume file is no longer available. It may have been removed from
        storage. Please contact the candidate if you need their CV.
      </p>
      <p className="mt-3 text-xs text-[var(--status-warning-fg)]/75">
        If this might be a temporary issue (e.g. network), you can try again.
      </p>
      <button
        type="button"
        onClick={handleTryAgain}
        disabled={retrying || !onRetry}
        className={`mt-4 flex items-center justify-center gap-2 rounded-xl bg-[var(--brand-accent-1)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--brand-accent-2)] disabled:opacity-90 ${
          retrying ? 'animate-pulse' : ''
        }`}
      >
        {retrying ? (
          <>
            <span
              className="h-3.5 w-3.5 shrink-0 animate-spin rounded-full border-2 border-white border-t-transparent"
              aria-hidden
            />
            Reloading…
          </>
        ) : (
          'Try again'
        )}
      </button>
    </div>
  );
}
