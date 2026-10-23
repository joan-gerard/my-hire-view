'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import ApplicationForm, { type ApplicationFormInitialData } from '@/components/forms/ApplicationForm';
import ApplicationFormPageHeader from '@/components/forms/ApplicationFormPageHeader';
import AdminPageSkeleton from '@/components/admin/AdminPageSkeleton';
import {
  ADMIN_FORM_SHELL_CLASS,
  ADMIN_TIP_CLASS,
} from '@/components/admin/admin-chrome';
import type { ApplicationFormData, Application } from '@/lib/types/application';
import type { Profile } from '@/lib/types/profile';
import { publicIdFromUserMetadata } from '@/lib/auth/ensure-public-id';
import { createClient } from '@/lib/supabase/client';

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

  /**
   * Re-check whether the saved CV is still in storage, without a full-page load.
   * Returns false when the file is still missing so the form can say so.
   */
  const refetchCvCheck = async (): Promise<boolean> => {
    const response = await fetch(`/api/applications/by-id/${id}`);
    if (!response.ok) {
      throw new Error("Could not check the CV.");
    }
    const { data } = await response.json();
    setApplication(data);
    return data?.cv_exists !== false;
  };

  const handleSubmit = async (data: ApplicationFormData) => {
    try {
      setLoading(true);

      // Manual edits are validated by ApplicationForm (/api/slug/validate); keep them.
      // Auto mode: if company/role/segment order changed, re-derive via /api/slug.
      const savedOrder = application?.slug_segment_order ?? 'company_role';
      const slugOrPreferenceChanged =
        data.slug !== application?.slug ||
        (data.slugSegmentOrder ?? 'company_role') !== savedOrder;
      let slug = data.slug.trim();
      if (slugOrPreferenceChanged && data.slugManuallyEdited !== true) {
        const slugResponse = await fetch('/api/slug', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({
            company: data.company,
            role: data.role,
            excludeId: id,
            slugSegmentOrder: data.slugSegmentOrder ?? 'company_role',
          }),
        });

        if (!slugResponse.ok) {
          const errJson: { error?: string } = await slugResponse
            .json()
            .catch(() => ({}));
          throw new Error(errJson.error || 'Failed to generate slug');
        }

        const { slug: uniqueSlug } = await slugResponse.json();
        if (typeof uniqueSlug !== 'string' || !uniqueSlug.trim()) {
          throw new Error('Failed to generate slug');
        }
        slug = uniqueSlug.trim();
      }

      const { slugManuallyEdited, ...dataForApi } = data;
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
    return <AdminPageSkeleton variant="form" showTip />;
  }

  if (!application) {
    return null;
  }

  // Normalize DB shape to form shape; candidate fields and slug order from application only
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
    slugSegmentOrder: application.slug_segment_order ?? 'company_role',
    cv_filename: application.cv_filename ?? null,
    use_original_cv_filename: application.use_original_cv_filename ?? true,
    cvUrlExists: application.cv_exists,
    show_profile_picture: application.show_profile_picture ?? false,
    cv_type: application.cv_type ?? 'tailored',
    primary_cv_id: application.primary_cv_id ?? null,
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <ApplicationFormPageHeader title="Edit Application" />
      <p className={ADMIN_TIP_CLASS}>
        The candidate details below (name, location, links) are from when this
        application was saved, not from your current profile. Updating your
        profile does not change those fields here. Your profile picture is
        live: if this application shows it, recruiters see the current picture
        from your profile.
      </p>
      <div className={ADMIN_FORM_SHELL_CLASS}>
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
