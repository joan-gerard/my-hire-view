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
import UnavailableApplicationView from "./UnavailableApplicationView";

interface ViewPageContentProps {
  initialApplication: PublicApplication;
  publicId: string;
  slug: string;
}

export default function ViewPageContent({
  initialApplication,
  publicId,
  slug,
}: ViewPageContentProps) {
  const [application, setApplication] =
    useState<PublicApplicationResponse>(initialApplication);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);

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
    if (response.status === 404) {
      setApplication({ status: "unavailable" });
      return;
    }
    if (!response.ok) return;
    const { data } = (await response.json()) as {
      data: PublicApplicationResponse;
    };
    setApplication(data);
  }, [publicId, slug]);

  if (isUnavailablePublicApplication(application)) {
    return <UnavailableApplicationView />;
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
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

      <div className="mx-auto w-full max-w-6xl flex-1 mt-6">
        <ApplicationPageContent
          publicId={publicId}
          slug={slug}
          application={application}
          refetchApplication={refetchApplication}
          isVideoModalOpen={isVideoModalOpen}
          onCloseVideoModal={() => setIsVideoModalOpen(false)}
        />
      </div>

      <ApplicationViewFooter />
    </div>
  );
}
