"use client";

import ApplicationPageHeader from "@/components/public/ApplicationPageHeader";
import type {
  PublicApplication,
  PublicApplicationResponse,
} from "@/lib/types/application";
import { isUnavailablePublicApplication } from "@/lib/types/application";
import { useCallback, useEffect, useState } from "react";
import ApplicationPageContent from "./ApplicationPageContent";
import ApplicationViewFooter from "./ApplicationViewFooter";
import DraftPreviewBanner from "./DraftPreviewBanner";
import UnavailableApplicationView from "./UnavailableApplicationView";

interface ViewPageContentProps {
  initialApplication: PublicApplication;
  publicId: string;
  slug: string;
  /**
   * When set, this is an owner-only draft preview (F16-050): show banner,
   * skip view tracking, and refetch via by-id (public GET stays unavailable).
   */
  draftPreviewApplicationId?: string;
}

export default function ViewPageContent({
  initialApplication,
  publicId,
  slug,
  draftPreviewApplicationId,
}: ViewPageContentProps) {
  const [application, setApplication] =
    useState<PublicApplicationResponse>(initialApplication);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const isDraftPreview = Boolean(draftPreviewApplicationId);

  // Close modal on Escape key
  useEffect(() => {
    if (!isVideoModalOpen) return;
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsVideoModalOpen(false);
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isVideoModalOpen]);

  const refetchApplication = useCallback(async () => {
    if (draftPreviewApplicationId) {
      const response = await fetch(
        `/api/applications/by-id/${draftPreviewApplicationId}`,
        { credentials: "include" },
      );
      if (!response.ok) return;
      const { data } = (await response.json()) as {
        data: PublicApplication & { cv_exists?: boolean };
      };
      setApplication({
        company: data.company,
        role: data.role,
        first_name: data.first_name,
        last_name: data.last_name,
        location: data.location,
        portfolio_url: data.portfolio_url,
        linkedin_url: data.linkedin_url,
        profile_picture_url: data.profile_picture_url ?? null,
        cv_url: data.cv_url,
        video_url: data.video_url,
        status: "active",
        ...(data.cv_filename !== undefined
          ? { cv_filename: data.cv_filename }
          : {}),
        ...(data.use_original_cv_filename !== undefined
          ? { use_original_cv_filename: data.use_original_cv_filename }
          : {}),
        ...(data.cv_exists !== undefined ? { cv_exists: data.cv_exists } : {}),
      });
      return;
    }

    const response = await fetch(`/api/applications/${publicId}/${slug}`);
    if (response.status === 404) {
      setApplication({ status: "unavailable" });
      return;
    }
    if (!response.ok) return;
    const { data } = (await response.json()) as {
      data: PublicApplicationResponse;
    };
    setApplication(data);
  }, [draftPreviewApplicationId, publicId, slug]);

  if (isUnavailablePublicApplication(application)) {
    return <UnavailableApplicationView />;
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {draftPreviewApplicationId ? (
        <DraftPreviewBanner applicationId={draftPreviewApplicationId} />
      ) : null}
      <ApplicationPageHeader
        company={application.company}
        role={application.role}
        firstName={application.first_name}
        lastName={application.last_name}
        location={application.location}
        portfolioUrl={application.portfolio_url}
        linkedinUrl={application.linkedin_url}
        profileImageUrl={application.profile_picture_url?.trim() || undefined}
        onWatchVideo={() => setIsVideoModalOpen(true)}
        cvUrl={application.cv_url}
        publicId={publicId}
        slug={slug}
        cvFilename={application.cv_filename}
        useOriginalCvFilename={application.use_original_cv_filename}
      />

      <div className="mx-auto mt-6 w-full max-w-6xl flex-1">
        <ApplicationPageContent
          publicId={publicId}
          slug={slug}
          application={application}
          refetchApplication={refetchApplication}
          isVideoModalOpen={isVideoModalOpen}
          onCloseVideoModal={() => setIsVideoModalOpen(false)}
          trackViews={!isDraftPreview}
        />
      </div>

      <ApplicationViewFooter />
    </div>
  );
}
