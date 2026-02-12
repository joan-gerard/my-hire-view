import { useCallback, useEffect, useMemo, useState } from 'react';
import type { Application } from '@/lib/types/application';
import {
  fetchApplications as fetchApplicationsApi,
  deleteApplication as deleteApplicationApi,
  archiveApplication as archiveApplicationApi,
  restoreApplication as restoreApplicationApi,
} from '@/lib/api/applications';

/**
 * Filters applications by search query (company, role, or slug).
 */
function filterBySearch(
  applications: Application[],
  query: string
): Application[] {
  const q = query.trim().toLowerCase();
  if (q === '') return applications;
  return applications.filter(
    (app) =>
      app.company.toLowerCase().includes(q) ||
      app.role.toLowerCase().includes(q) ||
      app.slug.toLowerCase().includes(q)
  );
}

export interface UseApplicationsResult {
  applications: Application[];
  filteredApplications: Application[];
  searchQuery: string;
  setSearchQuery: (value: string) => void;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  handleDelete: (id: string) => Promise<void>;
  handleArchive: (id: string) => Promise<void>;
  handleRestore: (id: string) => Promise<void>;
}

/**
 * Hook for the admin dashboard: fetches applications, filters by search,
 * and exposes mutation handlers (delete, archive, restore).
 */
export function useApplications(): UseApplicationsResult {
  const [applications, setApplications] = useState<Application[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchApplications = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchApplicationsApi();
      setApplications(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  const filteredApplications = useMemo(
    () => filterBySearch(applications, searchQuery),
    [applications, searchQuery]
  );

  const handleDelete = useCallback(
    async (id: string) => {
      try {
        await deleteApplicationApi(id);
        setApplications((prev) => prev.filter((app) => app.id !== id));
      } catch (err) {
        alert(
          err instanceof Error ? err.message : 'Failed to delete application'
        );
      }
    },
    []
  );

  const handleArchive = useCallback(async (id: string) => {
    try {
      const data = await archiveApplicationApi(id);
      setApplications((prev) =>
        prev.map((app) => (app.id === id ? { ...app, ...data } : app))
      );
    } catch (err) {
      alert(
        err instanceof Error ? err.message : 'Failed to archive application'
      );
    }
  }, []);

  const handleRestore = useCallback(async (id: string) => {
    try {
      const data = await restoreApplicationApi(id);
      setApplications((prev) =>
        prev.map((app) => (app.id === id ? { ...app, ...data } : app))
      );
    } catch (err) {
      alert(
        err instanceof Error ? err.message : 'Failed to restore application'
      );
    }
  }, []);

  return {
    applications,
    filteredApplications,
    searchQuery,
    setSearchQuery,
    loading,
    error,
    refetch: fetchApplications,
    handleDelete,
    handleArchive,
    handleRestore,
  };
}
