"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { fetchApplicationStatusCounts } from "@/lib/api/applications";
import type { ApplicationDashboardCounts } from "@/lib/types/application";

const EMPTY_COUNTS: ApplicationDashboardCounts = {
  all: 0,
  active: 0,
  draft: 0,
  archived: 0,
};

export type UseApplicationStatusCountsResult = {
  counts: ApplicationDashboardCounts;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
};

/**
 * Global application status tallies for the admin dashboard summary rail.
 */
export function useApplicationStatusCounts(): UseApplicationStatusCountsResult {
  const [counts, setCounts] = useState<ApplicationDashboardCounts>(EMPTY_COUNTS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const requestIdRef = useRef(0);

  const refetch = useCallback(async () => {
    const requestId = ++requestIdRef.current;
    try {
      setError(null);
      const next = await fetchApplicationStatusCounts();
      if (requestId !== requestIdRef.current) return;
      setCounts(next);
    } catch (err) {
      if (requestId !== requestIdRef.current) return;
      setError(err instanceof Error ? err.message : "Failed to load counts");
    } finally {
      if (requestId === requestIdRef.current) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    void refetch();
  }, [refetch]);

  return { counts, loading, error, refetch };
}
