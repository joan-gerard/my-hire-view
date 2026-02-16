"use client";

import PDFViewer from "@/components/pdf/PDFViewer";
import CvUnavailableWithRetry from "@/components/public/CvUnavailableWithRetry";
import ViewTracker from "@/components/view/ViewTracker";
import VideoModal from "@/components/view/VideoModal";
import type { Application } from "@/lib/types/application";

interface ApplicationPageContentProps {
  slug: string;
  application: Application;
  refetchApplication: () => Promise<void>;
  isVideoModalOpen: boolean;
  onCloseVideoModal: () => void;
}

/**
 * Main content area when viewing an application: resume PDF, optional
 * video pitch modal, and optional about section.
 */
export default function ApplicationPageContent({
  slug,
  application,
  refetchApplication,
  isVideoModalOpen,
  onCloseVideoModal,
}: ApplicationPageContentProps) {
  return (
    <>
      <ViewTracker slug={slug} />
      <div className="space-y-12">
        <section className="bg-white rounded-xl">
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

        {isVideoModalOpen && (
          <VideoModal
            videoUrl={application.video_url}
            onClose={onCloseVideoModal}
          />
        )}

        {application.description && (
          <section>
            <h2 className="mb-4 text-2xl font-bold text-gray-900">About</h2>
            <div className="rounded-lg bg-white p-6 shadow-sm">
              <p className="whitespace-pre-wrap text-gray-700">
                {application.description}
              </p>
            </div>
          </section>
        )}
      </div>
    </>
  );
}
