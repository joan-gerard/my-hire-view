'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import ApplicationForm from '@/components/forms/ApplicationForm';
import type { ApplicationFormData, Application } from '@/lib/types/application';

/** Normalize DB value (legacy boolean or 'start'|'end'|null) to form slugNamePosition. */
function slugNamePositionFromDb(
  value: boolean | 'start' | 'end' | null | undefined
): 'start' | 'end' | null {
  if (value === true) return 'start';
  if (value === false) return null;
  return value ?? null;
}

export default function EditApplicationPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const [application, setApplication] = useState<Application | null>(null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    fetchApplication();
  }, [id]);

  const fetchApplication = async () => {
    try {
      setFetching(true);
      const response = await fetch(`/api/applications/by-id/${id}`);
      if (!response.ok) {
        if (response.status === 404) {
          router.push('/admin');
          return;
        }
        throw new Error('Failed to fetch application');
      }
      const { data } = await response.json();
      setApplication(data);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to fetch application');
      router.push('/admin');
    } finally {
      setFetching(false);
    }
  };

  const handleSubmit = async (data: ApplicationFormData) => {
    try {
      setLoading(true);

      // Generate unique slug if slug or name position in URL changed
      const slugOrPreferenceChanged =
        data.slug !== application?.slug ||
        data.slugNamePosition !== slugNamePositionFromDb(application?.include_name_in_slug);
      let slug = data.slug;
      if (slugOrPreferenceChanged) {
        const slugResponse = await fetch('/api/slug', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            company: data.company,
            role: data.role,
            excludeId: id,
            slugNamePosition: data.slugNamePosition ?? null,
            ...((data.slugNamePosition === 'start' || data.slugNamePosition === 'end') && {
              first_name: data.first_name ?? undefined,
              last_name: data.last_name ?? undefined,
            }),
          }),
        });

        if (!slugResponse.ok) {
          throw new Error('Failed to generate slug');
        }

        const { slug: uniqueSlug } = await slugResponse.json();
        slug = uniqueSlug;
      }

      const response = await fetch('/api/applications', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id,
          ...data,
          slug,
        }),
      });

      if (!response.ok) {
        const { error } = await response.json();
        throw new Error(error || 'Failed to update application');
      }

      router.push('/admin');
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to update application');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-64 animate-pulse rounded bg-gray-200"></div>
        <div className="h-96 animate-pulse rounded-lg bg-gray-200"></div>
      </div>
    );
  }

  if (!application) {
    return null;
  }

  // Normalize DB shape to form shape; candidate fields and include_name_in_slug from application only
  const initialData: Partial<ApplicationFormData> = {
    company: application.company,
    role: application.role,
    slug: application.slug,
    cv_url: application.cv_url,
    video_url: application.video_url,
    description: application.description ?? undefined,
    first_name: application.first_name ?? undefined,
    last_name: application.last_name ?? undefined,
    location: application.location ?? undefined,
    portfolio_url: application.portfolio_url ?? undefined,
    linkedin_url: application.linkedin_url ?? undefined,
    slugNamePosition: slugNamePositionFromDb(application.include_name_in_slug),
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Edit Application</h1>
      <div className="rounded-lg bg-white p-6 shadow">
        <ApplicationForm
          initialData={initialData}
          onSubmit={handleSubmit}
          loading={loading}
        />
      </div>
    </div>
  );
}
