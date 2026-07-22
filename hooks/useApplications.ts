import { useCallback, useEffect, useState } from 'react';
import type { ApplicationListItem } from '@/lib/types/application';
import { APPLICATION_LIST_DEFAULT_LIMIT } from '@/lib/types/application';
import {
  fetchApplications as fetchApplicationsApi,
  deleteApplication as deleteApplicationApi,
  archiveApplication as archiveApplicationApi,
  restoreApplication as restoreApplicationApi,
} from '@/lib/api/applications';

const SEARCH_DEBOUNCE_MS = 300;

export interface UseApplicationsResult {
  applications: ApplicationListItem[];
  searchQuery: string;
  setSearchQuery: (value: string) => void;
  loading: boolean;
  isFetching: boolean;
  error: string | null;
  limit: number;
  offset: number;
  total: number;
  page: number;
  totalPages: number;
  hasPrevPage: boolean;
  hasNextPage: boolean;
  goToPrevPage: () => void;
  goToNextPage: () => void;
  refetch: () => Promise<void>;
  handleDelete: (id: string) => Promise<void>;
  handleArchive: (id: string) => Promise<void>;
  handleRestore: (id: string) => Promise<void>;
}

/**
 * Hook for the admin dashboard: fetches a paginated applications list,
 * debounced server search, and mutation handlers (delete, archive, restore).
 */
export function useApplications(): UseApplicationsResult {
  const [applications, setApplications] = useState<ApplicationListItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [offset, setOffset] = useState(0);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const limit = APPLICATION_LIST_DEFAULT_LIMIT;

  useEffect(() => {
    const handle = window.setTimeout(() => {
      setDebouncedQuery(searchQuery.trim());
    }, SEARCH_DEBOUNCE_MS);
    return () => window.clearTimeout(handle);
  }, [searchQuery]);

  useEffect(() => {
    setOffset(0);
  }, [debouncedQuery]);

  const fetchApplications = useCallback(async () => {
    try {
      setIsFetching(true);
      setError(null);
      const { data, meta } = await fetchApplicationsApi({
        limit,
        offset,
        q: debouncedQuery || undefined,
      });
      setApplications(data);
      setTotal(meta.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
      setIsFetching(false);
    }
  }, [limit, offset, debouncedQuery]);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  const totalPages = Math.max(1, Math.ceil(total / limit) || 1);
  const page = Math.floor(offset / limit) + 1;
  const hasPrevPage = offset > 0;
  const hasNextPage = offset + limit < total;

  const goToPrevPage = useCallback(() => {
    setOffset((prev) => Math.max(0, prev - limit));
  }, [limit]);

  const goToNextPage = useCallback(() => {
    setOffset((prev) => prev + limit);
  }, [limit]);

  const handleDelete = useCallback(
    async (id: string) => {
      try {
        await deleteApplicationApi(id);
        const nextTotal = Math.max(0, total - 1);
        const lastPageStart =
          nextTotal === 0 ? 0 : Math.floor((nextTotal - 1) / limit) * limit;
        if (offset > lastPageStart) {
          setOffset(lastPageStart);
        } else {
          await fetchApplications();
        }
        setTotal(nextTotal);
      } catch (err) {
        alert(
          err instanceof Error ? err.message : 'Failed to delete application'
        );
      }
    },
    [fetchApplications, limit, offset, total]
  );

  const handleArchive = useCallback(async (id: string) => {
    try {
      const data = await archiveApplicationApi(id);
      setApplications((prev) =>
        prev.map((app) =>
          app.id === id ? { ...app, is_active: data.is_active } : app
        )
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
        prev.map((app) =>
          app.id === id ? { ...app, is_active: data.is_active } : app
        )
      );
    } catch (err) {
      alert(
        err instanceof Error ? err.message : 'Failed to restore application'
      );
    }
  }, []);

  return {
    applications,
    searchQuery,
    setSearchQuery,
    loading,
    isFetching,
    error,
    limit,
    offset,
    total,
    page,
    totalPages,
    hasPrevPage,
    hasNextPage,
    goToPrevPage,
    goToNextPage,
    refetch: fetchApplications,
    handleDelete,
    handleArchive,
    handleRestore,
  };
}
