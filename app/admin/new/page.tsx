"use client";

import ApplicationForm from "@/components/forms/ApplicationForm";
import type { ApplicationFormData } from "@/lib/types/application";
import type { Profile } from "@/lib/types/profile";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

export default function NewApplicationPage() {
  const router = useRouter();
  const isSubmittingRef = useRef(false);
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await fetch("/api/profile", { credentials: "include" });
        const json = await res.json().catch(() => ({}));
        if (!cancelled && json.data) setProfile(json.data);
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

      // Generate unique slug via API (optionally include name in URL)
      const slugResponse = await fetch("/api/slug", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          company: data.company,
          role: data.role,
          slugNamePosition: data.slugNamePosition ?? null,
          ...((data.slugNamePosition === "start" ||
            data.slugNamePosition === "end") && {
            first_name: data.first_name ?? undefined,
            last_name: data.last_name ?? undefined,
          }),
        }),
      });

      if (!slugResponse.ok) {
        throw new Error("Failed to generate slug");
      }

      const { slug: uniqueSlug } = await slugResponse.json();

      const response = await fetch("/api/applications", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...data,
          slug: uniqueSlug,
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

  const initialData: Partial<ApplicationFormData> = {
    company: "",
    role: "",
    slug: "",
    cv_url: "",
    video_url: "",
    first_name: profile?.first_name ?? "",
    last_name: profile?.last_name ?? "",
    location: profile?.location ?? "",
    portfolio_url: profile?.portfolio_url ?? "",
    linkedin_url: profile?.linkedin_url ?? "",
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">
        Create New Application
      </h1>
      <div className="rounded-lg bg-white p-6 shadow">
        {profileLoading ? (
          <div className="space-y-4">
            <div className="h-24 animate-pulse rounded-lg bg-gray-100" />
            <div className="h-96 animate-pulse rounded-lg bg-gray-100" />
          </div>
        ) : (
          <ApplicationForm
            initialData={initialData}
            onSubmit={handleSubmit}
            loading={loading}
            profilePictureUrl={profile?.profile_picture_url ?? null}
          />
        )}
      </div>
    </div>
  );
}
