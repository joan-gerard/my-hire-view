'use client';

import { useEffect, useState } from 'react';
import { Application } from '@/lib/types/application';
import ApplicationCard from '@/components/admin/ApplicationCard';
import SearchBar from '@/components/admin/SearchBar';
import Link from 'next/link';

export default function AdminDashboard() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [filteredApplications, setFilteredApplications] = useState<Application[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchApplications();
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredApplications(applications);
    } else {
      const query = searchQuery.toLowerCase();
      setFilteredApplications(
        applications.filter(
          (app) =>
            app.company.toLowerCase().includes(query) ||
            app.role.toLowerCase().includes(query) ||
            app.slug.toLowerCase().includes(query)
        )
      );
    }
  }, [searchQuery, applications]);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/applications');
      if (!response.ok) {
        throw new Error('Failed to fetch applications');
      }
      const { data } = await response.json();
      setApplications(data || []);
      setFilteredApplications(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/applications?id=${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete application');
      }

      setApplications(applications.filter((app) => app.id !== id));
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete application');
    }
  };

  const handleArchive = async (id: string) => {
    try {
      const response = await fetch('/api/applications', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, is_active: false }),
      });
      if (!response.ok) {
        const { error } = await response.json().catch(() => ({}));
        throw new Error(error || 'Failed to archive application');
      }
      const { data } = await response.json();
      setApplications(applications.map((app) => (app.id === id ? { ...app, ...data } : app)));
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to archive application');
    }
  };

  const handleRestore = async (id: string) => {
    try {
      const response = await fetch('/api/applications', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, is_active: true }),
      });
      if (!response.ok) {
        const { error } = await response.json().catch(() => ({}));
        throw new Error(error || 'Failed to restore application');
      }
      const { data } = await response.json();
      setApplications(applications.map((app) => (app.id === id ? { ...app, ...data } : app)));
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to restore application');
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-64 animate-pulse rounded bg-gray-200"></div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-48 animate-pulse rounded-lg bg-gray-200"></div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-md bg-red-50 p-4">
        <div className="text-sm text-red-800">{error}</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Applications</h1>
        <Link
          href="/admin/new"
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500"
        >
          Create New Application
        </Link>
      </div>

      <div className="max-w-md">
        <SearchBar value={searchQuery} onChange={setSearchQuery} />
      </div>

      {filteredApplications.length === 0 ? (
        <div className="rounded-lg bg-white p-12 text-center shadow">
          <p className="text-gray-500">
            {searchQuery
              ? 'No applications match your search.'
              : "You don't have any applications yet. Create your first one!"}
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
