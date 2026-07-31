"use client";

import ApplicationForm from "@/components/forms/ApplicationForm";
import { ArrowRightIcon } from "@/components/admin/icons";
import { namesFromUserMetadata } from "@/lib/auth/ensure-profile";
import { publicIdFromUserMetadata } from "@/lib/auth/ensure-public-id";
import { createClient } from "@/lib/supabase/client";
import type { ApplicationFormData } from "@/lib/types/application";
import type { Profile } from "@/lib/types/profile";
import { validateSlugFormat } from "@/lib/utils/slug-generate";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

export default function NewApplicationPage() {
  const router = useRouter();
  const isSubmittingRef = useRef(false);
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [metaNames, setMetaNames] = useState<{
    first_name: string;
    last_name: string;
  } | null>(null);
  const [publicId, setPublicId] = useState<string | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await fetch("/api/profile", { credentials: "include" });
        const json = await res.json().catch(() => ({}));
        if (cancelled) return;

        if (res.ok && json.data) {
          setProfile(json.data);
          if (typeof json.data.public_id === "string") {
            setPublicId(json.data.public_id);
          }
          return;
        }

        // No profiles row yet — seed names and public id from Auth user_metadata.
        const supabase = createClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!cancelled && user) {
          setMetaNames(namesFromUserMetadata(user));
          const pid = publicIdFromUserMetadata(user);
          if (pid) setPublicId(pid);
        }
      } finally {
        if (!cancelled) setProfileLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleSubmit = async (data: ApplicationFormData) => {
    if (isSubmittingRef.current) return;
    isSubmittingRef.current = true;
    try {
      setLoading(true);

      const slugBody = {
        company: data.company,
        role: data.role,
        slugNamePosition: data.slugNamePosition ?? null,
        ...((data.slugNamePosition === "start" ||
          data.slugNamePosition === "end") && {
          first_name: data.first_name ?? undefined,
          last_name: data.last_name ?? undefined,
        }),
      };

      async function reserveSlugFromRole(): Promise<string> {
        const slugResponse = await fetch("/api/slug", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify(slugBody),
        });
        if (!slugResponse.ok) {
          const errJson: { error?: string } = await slugResponse
            .json()
            .catch(() => ({}));
          throw new Error(errJson.error || "Failed to generate slug");
        }
        const { slug: generated } = await slugResponse.json();
        if (typeof generated !== "string" || !generated.trim()) {
          throw new Error("Failed to generate slug");
        }
        return generated.trim();
      }

      let finalSlug: string;

      if (data.slugManuallyEdited === true) {
        const trimmed = data.slug.trim();
        const format = validateSlugFormat(trimmed);
        if (format.ok) {
          const validateRes = await fetch("/api/slug/validate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ slug: trimmed }),
          });
          const validateJson: { ok?: boolean } = await validateRes
            .json()
            .catch(() => ({}));
          if (validateRes.ok && validateJson.ok === true) {
            finalSlug = trimmed;
          } else {
            finalSlug = await reserveSlugFromRole();
          }
        } else {
          finalSlug = await reserveSlugFromRole();
        }
      } else {
        finalSlug = await reserveSlugFromRole();
      }

      const { slugManuallyEdited, ...dataForApi } = data;
      void slugManuallyEdited;

      const response = await fetch("/api/applications", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...dataForApi,
          slug: finalSlug,
        }),
      });

      if (!response.ok) {
        const { error } = await response.json();
        throw new Error(error || "Failed to create application");
      }

      router.push("/admin");
    } catch (err) {
      alert(
        err instanceof Error ? err.message : "Failed to create application",
      );
    } finally {
      isSubmittingRef.current = false;
      setLoading(false);
    }
  };

  const hasSavedProfile = Boolean(profile);
  const profileNeedsOptionalFields =
    hasSavedProfile &&
    !profile?.location?.trim() &&
    !profile?.portfolio_url?.trim() &&
    !profile?.linkedin_url?.trim() &&
    !profile?.profile_picture_url?.trim();
  const showProfileNudge =
    !profileLoading && (!hasSavedProfile || profileNeedsOptionalFields);
  const initialData: Partial<ApplicationFormData> = {
    company: "",
    role: "",
    slug: "",
    cv_url: "",
    video_url: "",
    first_name: profile?.first_name ?? metaNames?.first_name ?? "",
    last_name: profile?.last_name ?? metaNames?.last_name ?? "",
    location: profile?.location ?? "",
    portfolio_url: profile?.portfolio_url ?? "",
    linkedin_url: profile?.linkedin_url ?? "",
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-[var(--foreground)]">
        Create New Application
      </h1>
      {showProfileNudge && (
        <p className="flex items-start gap-2 rounded-md border border-[var(--foreground)]/10 bg-[var(--brand-secondary)]/40 px-4 py-3 text-sm text-[var(--foreground)]">
          <span className="min-w-0 flex-1">
            {hasSavedProfile
              ? "Add location, links, or a picture on your profile for richer prefills — or use Add picture below."
              : "Complete your profile to prefill location, links, and picture on new applications. Your name from signup is used below until then."}
          </span>
          <Link
            href="/admin/profile"
            className="mt-0.5 inline-flex shrink-0 rounded p-0.5 text-[var(--brand-primary)] hover:opacity-80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--brand-primary)]"
            aria-label="Go to profile"
            title="Go to profile"
          >
            <ArrowRightIcon className="h-4 w-4" />
          </Link>
        </p>
      )}
      <div className="rounded-lg bg-[var(--secondary-background)] p-6 shadow border border-[var(--foreground)]/10">
        {profileLoading ? (
          <div className="space-y-4">
            <div className="h-24 animate-pulse rounded-lg bg-[var(--background)]" />
            <div className="h-96 animate-pulse rounded-lg bg-[var(--background)]" />
          </div>
        ) : (
          <ApplicationForm
            initialData={initialData}
            onSubmit={handleSubmit}
            loading={loading}
            profilePictureUrl={profile?.profile_picture_url ?? null}
            profilePictureVersion={profile?.updated_at ?? null}
            onProfilePictureSaved={({ url, updated_at }) =>
              setProfile((prev) => {
                if (prev) {
                  return {
                    ...prev,
                    profile_picture_url: url,
                    updated_at: updated_at ?? prev.updated_at,
                  };
                }
                return {
                  user_id: "",
                  public_id: publicId ?? undefined,
                  first_name: metaNames?.first_name ?? null,
                  last_name: metaNames?.last_name ?? null,
                  location: null,
                  portfolio_url: null,
                  linkedin_url: null,
                  updated_at: updated_at ?? new Date().toISOString(),
                  profile_picture_url: url,
                };
              })
            }
            publicId={publicId ?? undefined}
            resolveSlugOnCreate
          />
        )}
      </div>
    </div>
  );
}
