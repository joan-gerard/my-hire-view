'use client';

import Link from 'next/link';
import { useState } from 'react';
import ApplicationCard from '@/components/admin/ApplicationCard';
import ApplicationStatusLegend from '@/components/admin/ApplicationStatusLegend';
import ApplicationsPagination from '@/components/admin/ApplicationsPagination';
import SearchBar from '@/components/admin/SearchBar';
import AdminDashboardSkeleton from '@/components/admin/AdminDashboardSkeleton';
import AdminDashboardError from '@/components/admin/AdminDashboardError';
import AdminDashboardEmpty from '@/components/admin/AdminDashboardEmpty';
import { useApplications } from '@/hooks/useApplications';
import { QuestionIcon } from '@/components/admin/icons';
import {
  ADMIN_ACCENT_PRIMARY_CLASS,
  ADMIN_PANEL_CLASS,
  ADMIN_SECONDARY_CLASS,
} from '@/components/admin/admin-chrome';

export default function AdminDashboard() {
  const [legendOpen, setLegendOpen] = useState(false);
  const {
    applications,
    searchQuery,
    setSearchQuery,
    debouncedQuery,
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
    handleDelete,
    handleArchive,
    handleRestore,
    handlePublish,
  } = useApplications();

  if (loading) {
    return <AdminDashboardSkeleton />;
  }

  if (error) {
    return <AdminDashboardError message={error} />;
  }

  // Keep chrome while the input or committed query is non-empty, and through the
  // in-flight refetch after clearing a no-match search (stale applications=[]).
  const hasSearchFilter =
    searchQuery.trim() !== '' || debouncedQuery.trim() !== '';
  const showListChrome =
    applications.length > 0 || hasSearchFilter || isFetching;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <h1 className="font-heading text-3xl font-semibold tracking-[-0.03em] text-[var(--ink)] sm:text-4xl">
          Applications
        </h1>
        <Link href="/admin/new" className={ADMIN_ACCENT_PRIMARY_CLASS}>
          + Create New Application
        </Link>
      </div>

      <ApplicationStatusLegend
        open={showListChrome && legendOpen}
        onClose={() => setLegendOpen(false)}
      />

      {applications.length === 0 && !showListChrome ? (
        <AdminDashboardEmpty
          hasSearchQuery={false}
          onClearSearch={() => setSearchQuery('')}
        />
      ) : (
        <section className={`${ADMIN_PANEL_CLASS} p-5 sm:p-6`}>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex min-w-0 flex-wrap items-center gap-2">
              <h2 className="font-heading text-base font-semibold tracking-[-0.02em] text-[var(--ink)]">
                Your applications
              </h2>
              {showListChrome ? (
                <button
                  type="button"
                  onClick={() => setLegendOpen(true)}
                  className={ADMIN_SECONDARY_CLASS}
                  aria-haspopup="dialog"
                >
                  <QuestionIcon className="h-4 w-4" />
                  What do these icons mean?
                </button>
              ) : null}
            </div>
            {showListChrome ? (
              <div className="w-full sm:max-w-xs sm:shrink-0">
                <SearchBar value={searchQuery} onChange={setSearchQuery} />
              </div>
            ) : null}
          </div>

          {applications.length === 0 &&
          (hasSearchFilter || !isFetching) ? (
            <div className="mt-6">
              <AdminDashboardEmpty
                hasSearchQuery={hasSearchFilter}
                onClearSearch={() => setSearchQuery('')}
                embedded
              />
            </div>
          ) : applications.length > 0 ? (
            <>
              <div
                className={`mt-4 transition-opacity ${isFetching ? 'opacity-60' : ''}`}
              >
                {applications.map((application) => (
                  <ApplicationCard
                    key={application.id}
                    application={application}
                    onDelete={handleDelete}
                    onArchive={handleArchive}
                    onRestore={handleRestore}
                    onPublish={handlePublish}
                  />
                ))}
              </div>
              <div className="mt-4 border-t border-[var(--ink)]/8 pt-4">
                <ApplicationsPagination
                  page={page}
                  totalPages={totalPages}
                  total={total}
                  offset={offset}
                  limit={limit}
                  hasPrevPage={hasPrevPage}
                  hasNextPage={hasNextPage}
                  isFetching={isFetching}
                  onPrev={goToPrevPage}
                  onNext={goToNextPage}
                />
              </div>
            </>
          ) : null}
        </section>
      )}
    </div>
  );
}
