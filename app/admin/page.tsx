'use client';

import Link from 'next/link';
import ApplicationCard from '@/components/admin/ApplicationCard';
import SearchBar from '@/components/admin/SearchBar';
import AdminDashboardSkeleton from '@/components/admin/AdminDashboardSkeleton';
import AdminDashboardError from '@/components/admin/AdminDashboardError';
import AdminDashboardEmpty from '@/components/admin/AdminDashboardEmpty';
import { useApplications } from '@/hooks/useApplications';

export default function AdminDashboard() {
  const {
    filteredApplications,
    searchQuery,
    setSearchQuery,
    loading,
    error,
    handleDelete,
    handleArchive,
    handleRestore,
  } = useApplications();

  if (loading) {
    return <AdminDashboardSkeleton />;
  }

  if (error) {
    return <AdminDashboardError message={error} />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-[var(--foreground)]">Applications</h1>
        <Link
          href="/admin/new"
          className="rounded-md bg-[var(--brand-primary)] px-4 py-2 text-sm font-semibold text-[var(--brand-primary-text)] hover:opacity-95"
        >
          Create New Application
        </Link>
      </div>

      <div className="max-w-md">
        <SearchBar value={searchQuery} onChange={setSearchQuery} />
      </div>

      {filteredApplications.length === 0 ? (
        <AdminDashboardEmpty hasSearchQuery={searchQuery.trim() !== ''} />
      ) : (
        <div className="flex flex-col gap-4">
          {filteredApplications.map((application) => (
            <ApplicationCard
              key={application.id}
              application={application}
              onDelete={handleDelete}
              onArchive={handleArchive}
              onRestore={handleRestore}
            />
          ))}
        </div>
      )}
    </div>
  );
}
