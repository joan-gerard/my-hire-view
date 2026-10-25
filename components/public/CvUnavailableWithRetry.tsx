"use client";

import Button from "@/components/ui/Button";
import { useState } from "react";

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
      <p className="mt-2 text-sm text-[var(--status-warning-fg)]">
        The resume file is no longer available. It may have been removed from
        storage. Please contact the candidate if you need their CV.
      </p>
      <p className="mt-3 text-xs text-[var(--status-warning-fg)]">
        If this might be a temporary issue (e.g. network), you can try again.
      </p>
      <Button
        type="button"
        onClick={handleTryAgain}
        disabled={!onRetry}
        loading={retrying}
        loadingLabel="Reloading…"
        className="mt-4"
      >
        Try again
      </Button>
    </div>
  );
}
