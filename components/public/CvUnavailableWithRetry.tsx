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
      className="rounded-lg border border-amber-300 bg-amber-50 px-6 py-8 text-center"
    >
      <p className="font-semibold text-amber-900">CV is not available</p>
      <p className="mt-2 text-sm text-amber-800">
        The resume file is no longer available. It may have been removed from
        storage. Please contact the candidate if you need their CV.
      </p>
      <p className="mt-3 text-xs text-amber-700">
        If this might be a temporary issue (e.g. network), you can try again.
      </p>
      <button
        type="button"
        onClick={handleTryAgain}
        disabled={retrying || !onRetry}
        className={`mt-4 flex items-center justify-center gap-2 rounded-md bg-amber-600 px-4 py-2 text-sm font-medium text-white hover:bg-amber-500 disabled:opacity-90 disabled:hover:bg-amber-600 ${
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
