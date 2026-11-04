'use client';

/**
 * Edit application. Default presentation is the parked wizard.
 * `/admin/edit/[id]` passes `presentation="split"`.
 */

import { useEffect, useRef, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import ApplicationForm, { type ApplicationFormInitialData } from '@/components/forms/ApplicationForm';
import { profileWithSavedLink } from '@/components/forms/ProfileLinkDialog';
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

export default function EditApplicationWizardPage({
  presentation = "wizard",
}: {
  /** Parked wizard, or the one-page split layout on `/admin/edit/[id]`. */
  presentation?: "wizard" | "split";
}) {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const idRef = useRef(id);
  idRef.current = id;
  const [application, setApplication] = useState<Application | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [publicId, setPublicId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [profileSettled, setProfileSettled] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadApplication() {
      try {
        setFetching(true);
        const response = await fetch(`/api/applications/by-id/${id}`);
        if (cancelled) return;
        if (!response.ok) {
          if (response.status === 404) {
            router.push('/admin');
            return;
          }
          throw new Error('Failed to fetch application');
        }
        const { data } = await response.json();
        if (cancelled) return;
        setApplication(data);
      } catch (err) {
        if (cancelled) return;
        alert(err instanceof Error ? err.message : 'Failed to fetch application');
        router.push('/admin');
      } finally {
        if (!cancelled) setFetching(false);
      }
    }

    loadApplication();
    return () => {
      cancelled = true;
    };
  }, [id, router]);

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
      } finally {
        if (!cancelled) setProfileSettled(true);
      }
    }
    loadProfile();
    return () => {
      cancelled = true;
    };
  }, []);

  /**
   * Re-check whether the saved CV is still in storage, without a full-page load.
   * Returns false when the file is still missing so the form can say so.
   * A response for a previous id is ignored after the route changes.
   */
  const refetchCvCheck = async (): Promise<boolean> => {
    const requestedId = idRef.current;
    const response = await fetch(`/api/applications/by-id/${requestedId}`);
    if (!response.ok) {
      throw new Error("Could not check the CV.");
    }
    const { data } = await response.json();
    if (idRef.current !== requestedId) {
      return data?.cv_exists !== false;
    }
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
      throw err;
    } finally {
      setLoading(false);
    }
  };

  if (fetching || !profileSettled) {
    return <AdminPageSkeleton variant="form" showTip />;
  }

  if (!application) {
    return null;
  }

  // Identity text comes from the live profile. Include flags come from
  // whether this application currently stores a value (hidden means null).
  const identity = profile ?? application;
  const initialData: ApplicationFormInitialData = {
    company: application.company,
    role: application.role,
    slug: application.slug,
    cv_url: application.cv_url,
    video_url: application.video_url,
    first_name: identity.first_name ?? undefined,
    last_name: identity.last_name ?? undefined,
    location: identity.location ?? undefined,
    portfolio_url: identity.portfolio_url ?? undefined,
    linkedin_url: identity.linkedin_url ?? undefined,
    slugSegmentOrder: application.slug_segment_order ?? 'company_role',
    cv_filename: application.cv_filename ?? null,
    use_original_cv_filename: false,
    cvUrlExists: application.cv_exists,
    show_profile_picture: application.show_profile_picture ?? false,
    cv_type: application.cv_type ?? 'tailored',
    primary_cv_id: application.primary_cv_id ?? null,
  };

  const form = (
    <ApplicationForm
      initialData={initialData}
      onSubmit={handleSubmit}
      loading={loading}
      onRetryCvCheck={refetchCvCheck}
      profilePictureUrl={
        profile
          ? (profile.profile_picture_url ?? null)
          : (application.profile_picture_url ?? null)
      }
      profilePictureVersion={profile?.updated_at ?? null}
      initialInclude={{
        first_name: true,
        last_name: true,
        location: Boolean(application.location?.trim()),
        portfolio_url: Boolean(application.portfolio_url?.trim()),
        linkedin_url: Boolean(application.linkedin_url?.trim()),
      }}
      onProfileLinkSaved={(field, url) => {
        setProfile((prev) =>
          profileWithSavedLink(prev, field, url, {
            user_id: application.user_id,
            public_id: publicId ?? undefined,
            first_name: application.first_name,
            last_name: application.last_name,
            location: application.location,
            portfolio_url: application.portfolio_url,
            linkedin_url: application.linkedin_url,
            profile_picture_url: application.profile_picture_url,
          }),
        );
      }}
      publicId={publicId ?? undefined}
      slugExcludeApplicationId={id}
      submitLabel={
        application.status === "draft" ? "Save draft" : "Save application"
      }
      presentation={presentation}
    />
  );

  return (
    <div className="space-y-4 sm:space-y-6">
      <ApplicationFormPageHeader
        sticky={presentation === "split"}
        title={presentation === "split" ? "Edit application" : "Edit Application"}
      />
      {presentation === "wizard" ? (
        <p className={ADMIN_TIP_CLASS}>
          Name, location, and links come from your profile. This page chooses
          which of them this application shows. Saving copies the current
          profile values onto this application. Your picture stays on your
          profile; this page only chooses whether to show it.
        </p>
      ) : null}
      {presentation === "split" ? (
        form
      ) : (
        <div className={ADMIN_FORM_SHELL_CLASS}>{form}</div>
      )}
    </div>
  );
}
