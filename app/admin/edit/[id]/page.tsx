'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import ApplicationForm, { type ApplicationFormInitialData } from '@/components/forms/ApplicationForm';
import type { ApplicationFormData, Application } from '@/lib/types/application';
import type { Profile } from '@/lib/types/profile';
import { publicIdFromUserMetadata } from '@/lib/auth/ensure-public-id';
import { createClient } from '@/lib/supabase/client';

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
  const [profile, setProfile] = useState<Profile | null>(null);
  const [publicId, setPublicId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    fetchApplication();
  }, [id]);

  useEffect(() => {
    let cancelled = false;
    async function loadProfile() {
      try {
        const res = await fetch('/api/profile', { credentials: 'include' });
        const json = await res.json().catch(() => ({}));
        if (!cancelled && json.data) {
          setProfile(json.data);
          if (typeof json.data.public_id === 'string') {
            setPublicId(json.data.public_id);
          }
          return;
        }
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!cancelled && user) {
          const pid = publicIdFromUserMetadata(user);
          if (pid) setPublicId(pid);
        }
      } catch {
        // ignore
      }
    }
    loadProfile();
    return () => {
      cancelled = true;
    };
  }, []);

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

  /** Re-fetch application to get fresh cv_exists (no full-page loading). */
  const refetchCvCheck = async () => {
    try {
      const response = await fetch(`/api/applications/by-id/${id}`);
      if (!response.ok) return;
      const { data } = await response.json();
      setApplication(data);
    } catch {
      // Ignore; user can try again
    }
  };

  const handleSubmit = async (data: ApplicationFormData) => {
    try {
      setLoading(true);

      // Re-check derived slug via API if slug or name position in URL changed
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
              first_name: data.slugFirstName ?? data.first_name ?? undefined,
              last_name: data.slugLastName ?? data.last_name ?? undefined,
            }),
          }),
        });

        if (!slugResponse.ok) {
          const errJson: { error?: string } = await slugResponse
            .json()
            .catch(() => ({}));
          throw new Error(errJson.error || 'Failed to generate slug');
        }

        const { slug: uniqueSlug } = await slugResponse.json();
        slug = uniqueSlug;
      }

      const { slugFirstName, slugLastName, slugManuallyEdited, ...dataForApi } =
        data;
      void slugFirstName;
      void slugLastName;
      void slugManuallyEdited;

      const response = await fetch('/api/applications', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id,
          ...dataForApi,
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
        <div className="h-8 w-64 animate-pulse rounded bg-[var(--foreground)]/10"></div>
        <div className="h-96 animate-pulse rounded-lg bg-[var(--foreground)]/10"></div>
      </div>
    );
  }

  if (!application) {
    return null;
  }

  // Normalize DB shape to form shape; candidate fields and include_name_in_slug from application only
  const initialData: ApplicationFormInitialData = {
    company: application.company,
    role: application.role,
    slug: application.slug,
    cv_url: application.cv_url,
    video_url: application.video_url,
    first_name: application.first_name ?? undefined,
    last_name: application.last_name ?? undefined,
    location: application.location ?? undefined,
    portfolio_url: application.portfolio_url ?? undefined,
    linkedin_url: application.linkedin_url ?? undefined,
    slugNamePosition: slugNamePositionFromDb(application.include_name_in_slug),
    cv_filename: application.cv_filename ?? null,
    use_original_cv_filename: application.use_original_cv_filename ?? true,
    cvUrlExists: application.cv_exists,
    show_profile_picture: application.show_profile_picture ?? false,
    cv_type: application.cv_type ?? 'tailored',
    primary_cv_id: application.primary_cv_id ?? null,
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-[var(--foreground)]">Edit Application</h1>
      <p className="rounded-md border border-[var(--foreground)]/10 bg-[var(--brand-secondary)]/40 px-4 py-3 text-sm text-[var(--foreground)]">
        The candidate details below (name, location, links) are from when this
        application was saved, not from your current profile. Updating your
        profile does not change those fields here. Your profile picture is
        live: if this application shows it, recruiters see the current picture
        from your profile.
      </p>
      <div className="rounded-lg bg-[var(--secondary-background)] p-6 shadow border border-[var(--foreground)]/10">
        <ApplicationForm
          initialData={initialData}
          onSubmit={handleSubmit}
          loading={loading}
          onRetryCvCheck={refetchCvCheck}
          profilePictureUrl={profile?.profile_picture_url ?? null}
          profilePictureVersion={profile?.updated_at ?? null}
          onProfilePictureSaved={({ url, updated_at }) =>
            setProfile((prev) =>
              prev
                ? {
                    ...prev,
                    profile_picture_url: url,
                    updated_at: updated_at ?? prev.updated_at,
                  }
                : prev,
            )
          }
          publicId={publicId ?? undefined}
          slugExcludeApplicationId={id}
        />
      </div>
    </div>
  );
}
