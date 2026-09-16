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

export default function AdminDashboard() {
  const [legendOpen, setLegendOpen] = useState(false);
  const {
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

  // Keep search/legend when a filter returns no rows so users can clear the query.
  const showListChrome =
    applications.length > 0 || searchQuery.trim() !== '';

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex min-w-0 flex-wrap items-center gap-3">
          <h1 className="text-3xl font-bold text-[var(--foreground)]">
            Applications
          </h1>
          {showListChrome ? (
            <button
              type="button"
              onClick={() => setLegendOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-md border border-[var(--foreground)]/15 bg-[var(--secondary-background)] px-3 py-1.5 text-sm font-medium text-[var(--foreground)]/80 hover:bg-[var(--foreground)]/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-primary)] focus-visible:ring-offset-1"
              aria-haspopup="dialog"
            >
              <QuestionIcon className="h-4 w-4" />
              What do these icons mean?
            </button>
          ) : null}
        </div>
        <Link
          href="/admin/new"
          className="rounded-md bg-[var(--brand-primary)] px-4 py-2 text-sm font-semibold text-[var(--brand-primary-text)] hover:opacity-95"
        >
          Create New Application
        </Link>
      </div>

      {showListChrome ? (
        <div className="max-w-md">
          <SearchBar value={searchQuery} onChange={setSearchQuery} />
        </div>
      ) : null}

      <ApplicationStatusLegend
        open={showListChrome && legendOpen}
        onClose={() => setLegendOpen(false)}
      />

      {applications.length === 0 ? (
        <AdminDashboardEmpty
          hasSearchQuery={searchQuery.trim() !== ''}
          onClearSearch={() => setSearchQuery('')}
        />
      ) : (
        <>
          <div
            className={`flex flex-col gap-4 transition-opacity ${isFetching ? 'opacity-60' : ''}`}
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
        </>
      )}
    </div>
  );
}
