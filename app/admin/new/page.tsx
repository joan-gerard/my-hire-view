'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import ApplicationForm from '@/components/forms/ApplicationForm';
import type { ApplicationFormData } from '@/lib/types/application';

export default function NewApplicationPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (data: ApplicationFormData) => {
    try {
      setLoading(true);

      // Generate unique slug via API
      const slugResponse = await fetch('/api/slug', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          company: data.company,
          role: data.role,
        }),
      });

      if (!slugResponse.ok) {
        throw new Error('Failed to generate slug');
      }

      const { slug: uniqueSlug } = await slugResponse.json();

      const response = await fetch('/api/applications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...data,
          slug: uniqueSlug,
        }),
      });

      if (!response.ok) {
        const { error } = await response.json();
        throw new Error(error || 'Failed to create application');
      }

      router.push('/admin');
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to create application');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Create New Application</h1>
      <div className="rounded-lg bg-white p-6 shadow">
        <ApplicationForm onSubmit={handleSubmit} loading={loading} />
      </div>
    </div>
  );
}
