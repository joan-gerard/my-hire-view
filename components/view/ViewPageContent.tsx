"use client";

import ApplicationPageHeader from "@/components/public/ApplicationPageHeader";
import type {
  Application,
  PublicApplication,
  PublicApplicationResponse,
} from "@/lib/types/application";
import {
  isUnavailablePublicApplication,
  toOwnerPreviewApplication,
} from "@/lib/types/application";
import { useCallback, useState } from "react";
import ApplicationPageContent from "./ApplicationPageContent";
import ApplicationViewFooter from "./ApplicationViewFooter";
import DraftPreviewBanner from "./DraftPreviewBanner";
import UnavailableApplicationView from "./UnavailableApplicationView";
import { VIEW_PAGE_CLASS, VIEW_SHELL_CLASS } from "./view-chrome";

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

function hasVideoUrl(videoUrl: string | null | undefined): boolean {
  return videoUrl != null && String(videoUrl).trim() !== "";
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

  const refetchApplication = useCallback(async () => {
    if (draftPreviewApplicationId) {
      const response = await fetch(
        `/api/applications/by-id/${draftPreviewApplicationId}`,
        { credentials: "include" },
      );
      if (response.status === 404) {
        setApplication({ status: "unavailable" });
        return;
      }
      // Other errors (network / 5xx / 429): keep current preview; retry can try again.
      if (!response.ok) return;
      const { data } = (await response.json()) as {
        data: Application & { cv_exists?: boolean };
      };
      // Archived (or any non-previewable status) mid-session → empty state,
      // not a throw from toOwnerPreviewApplication.
      if (data.status !== "draft" && data.status !== "active") {
        setApplication({ status: "unavailable" });
        return;
      }
      // Same mapper as SSR owner preview — keep field mapping in one place.
      setApplication(toOwnerPreviewApplication(data, data.cv_exists));
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

  const canWatchVideo = hasVideoUrl(application.video_url);

  return (
    <div className={VIEW_PAGE_CLASS}>
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
        onWatchVideo={
          canWatchVideo ? () => setIsVideoModalOpen(true) : undefined
        }
        cvUrl={application.cv_url}
        publicId={publicId}
        slug={slug}
        cvFilename={application.cv_filename}
        useOriginalCvFilename={application.use_original_cv_filename}
      />

      <div className={`${VIEW_SHELL_CLASS} mt-6 flex-1 pb-12`}>
        <ApplicationPageContent
          publicId={publicId}
          slug={slug}
          application={application}
          refetchApplication={refetchApplication}
          isVideoModalOpen={isVideoModalOpen && canWatchVideo}
          onCloseVideoModal={() => setIsVideoModalOpen(false)}
          trackViews={!isDraftPreview}
        />
      </div>

      <ApplicationViewFooter />
    </div>
  );
}
