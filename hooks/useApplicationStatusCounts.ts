"use client";

import { useCallback, useEffect, useState } from "react";
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

  const refetch = useCallback(async () => {
    try {
      setError(null);
      const next = await fetchApplicationStatusCounts();
      setCounts(next);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load counts");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refetch();
  }, [refetch]);

  return { counts, loading, error, refetch };
}
