"use client";

import ApplicationPageHeader from "@/components/public/ApplicationPageHeader";
import ViewPageFooter from "@/components/public/ViewPageFooter";
import type { Application } from "@/lib/types/application";
import { useCallback, useEffect, useState } from "react";
import ApplicationPageContent from "./ApplicationPageContent";
import ArchivedApplicationAlert from "./ArchivedApplicationAlert";

interface ViewPageContentProps {
  initialApplication: Application;
  publicId: string;
  slug: string;
}

export default function ViewPageContent({
  initialApplication,
  publicId,
  slug,
}: ViewPageContentProps) {
  const [application, setApplication] =
    useState<Application>(initialApplication);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [showFooter, setShowFooter] = useState<boolean | null>(null);

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
    const response = await fetch(`/api/applications/${publicId}/${slug}`);
    if (!response.ok) return;
    const { data } = await response.json();
    setApplication(data);
  }, [publicId, slug]);

  // Footer is shown only to non-owners (recruiters/visitors)
  useEffect(() => {
    let cancelled = false;
    fetch(`/api/applications/${publicId}/${slug}/viewer-status`, {
      credentials: "include",
    })
      .then((res) => (res.ok ? res.json() : { isOwner: false }))
      .then((data) => {
        if (!cancelled) setShowFooter(data.isOwner === false);
      })
      .catch(() => {
        if (!cancelled) setShowFooter(true);
      });
    return () => {
      cancelled = true;
    };
  }, [publicId, slug]);

  const isArchived = application.status === "archived";

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <ApplicationPageHeader
        company={application.company}
        role={application.role}
        firstName={application.first_name}
        lastName={application.last_name}
        location={application.location}
        portfolioUrl={application.portfolio_url}
        linkedinUrl={application.linkedin_url}
        profileImageUrl={application.profile_picture_url?.trim() || undefined}
        onWatchVideo={!isArchived ? () => setIsVideoModalOpen(true) : undefined}
        cvUrl={application.cv_url}
        publicId={publicId}
        slug={slug}
        cvFilename={application.cv_filename}
        useOriginalCvFilename={application.use_original_cv_filename}
      />

      <div className="mx-auto max-w-6xl mt-6">
        {isArchived ? (
          <ArchivedApplicationAlert />
        ) : (
          <ApplicationPageContent
            publicId={publicId}
            slug={slug}
            application={application}
            refetchApplication={refetchApplication}
            isVideoModalOpen={isVideoModalOpen}
            onCloseVideoModal={() => setIsVideoModalOpen(false)}
          />
        )}
      </div>

      {showFooter === true && <ViewPageFooter />}
    </div>
  );
}
