"use client";

import PDFViewer from "@/components/pdf/PDFViewer";
import ApplicationPageHeader from "@/components/public/ApplicationPageHeader";
import CvUnavailableWithRetry from "@/components/public/CvUnavailableWithRetry";
import YouTubeEmbed from "@/components/video/YouTubeEmbed";
import ViewTracker from "@/components/view/ViewTracker";
import type { Application } from "@/lib/types/application";
import { useCallback, useEffect, useState } from "react";

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
        profileImageUrl={application.profile_picture_url?.trim() || undefined}
        onWatchVideo={!isArchived ? () => setIsVideoModalOpen(true) : undefined}
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

              {/* Right-side floating video modal */}
              {isVideoModalOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setIsVideoModalOpen(false)}
                    aria-hidden
                  />
                  <aside
                    className="fixed right-4 top-1/2 z-50 max-w-md -translate-y-1/2 sm:right-6 sm:max-w-lg"
                    role="dialog"
                    aria-modal="true"
                    aria-label="Video pitch"
                  >
                    <div className="relative w-[min(100vw-2rem,28rem)] overflow-visible">
                      <div className="overflow-hidden rounded-[10px]">
                        <YouTubeEmbed url={application.video_url} />
                      </div>
                      <button
                        type="button"
                        onClick={() => setIsVideoModalOpen(false)}
                        className="absolute -right-2 -top-2 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-black/40 text-white transition-colors hover:bg-black/60 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-black/20"
                        aria-label="Close video modal"
                      >
                        <svg
                          className="h-4 w-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </button>
                    </div>
                  </aside>
                </>
              )}

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
