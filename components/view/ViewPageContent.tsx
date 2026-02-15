"use client";

import PDFViewer from "@/components/pdf/PDFViewer";
import ApplicationPageHeader from "@/components/public/ApplicationPageHeader";
import CvUnavailableWithRetry from "@/components/public/CvUnavailableWithRetry";
import YouTubeEmbed from "@/components/video/YouTubeEmbed";
import ViewTracker from "@/components/view/ViewTracker";
import type { Application } from "@/lib/types/application";
import { useCallback, useState } from "react";

interface ViewPageContentProps {
  initialApplication: Application;
  slug: string;
}

export default function ViewPageContent({
  initialApplication,
  slug,
}: ViewPageContentProps) {
  const [application, setApplication] =
    useState<Application>(initialApplication);

  const refetchApplication = useCallback(async () => {
    const response = await fetch(`/api/applications/${slug}`);
    if (!response.ok) return;
    const { data } = await response.json();
    setApplication(data);
  }, [slug]);

  const isArchived = application.is_active === false;

  return (
    <div className="min-h-screen bg-gray-50">
      <ApplicationPageHeader
        company={application.company}
        role={application.role}
        firstName={application.first_name}
        lastName={application.last_name}
        location={application.location}
        portfolioUrl={application.portfolio_url}
        linkedinUrl={application.linkedin_url}
      />

      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        {isArchived ? (
          <div
            className="rounded-lg border border-amber-200 bg-amber-50 p-6 text-amber-900"
            role="alert"
          >
            <p className="font-semibold">
              This application is no longer active
            </p>
            <p className="mt-1 text-sm">
              The candidate has archived this application. The CV and video
              pitch are no longer available.
            </p>
          </div>
        ) : (
          <>
            <ViewTracker slug={slug} />
            <div className="space-y-12">
              <section>
                <h2 className="mb-4 text-2xl font-bold text-gray-900">
                  Resume
                </h2>
                {application.cv_exists === false ? (
                  <CvUnavailableWithRetry onRetry={refetchApplication} />
                ) : (
                  <PDFViewer
                    url={application.cv_url}
                    slug={slug}
                    cvFilename={application.cv_filename}
                    useOriginalCvFilename={application.use_original_cv_filename}
                  />
                )}
              </section>

              <section>
                <h2 className="mb-4 text-2xl font-bold text-gray-900">
                  Video Pitch
                </h2>
                <YouTubeEmbed url={application.video_url} />
              </section>

              {application.description && (
                <section>
                  <h2 className="mb-4 text-2xl font-bold text-gray-900">
                    About
                  </h2>
                  <div className="rounded-lg bg-white p-6 shadow-sm">
                    <p className="whitespace-pre-wrap text-gray-700">
                      {application.description}
                    </p>
                  </div>
                </section>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
