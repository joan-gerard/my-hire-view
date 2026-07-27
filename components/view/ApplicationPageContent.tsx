"use client";

import PDFViewer from "@/components/pdf/PDFViewer";
import CvUnavailableWithRetry from "@/components/public/CvUnavailableWithRetry";
import VideoModal from "@/components/view/VideoModal";
import ViewTracker from "@/components/view/ViewTracker";
import type { Application } from "@/lib/types/application";

interface ApplicationPageContentProps {
  publicId: string;
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
  publicId,
  slug,
  application,
  refetchApplication,
  isVideoModalOpen,
  onCloseVideoModal,
}: ApplicationPageContentProps) {
  return (
    <div className="pb-12">
      <ViewTracker publicId={publicId} slug={slug} />
      <div className="space-y-12">
        <section className="bg-[var(--secondary-background)] rounded-xl border border-[var(--foreground)]/10">
          {application.cv_exists === false ? (
            <CvUnavailableWithRetry onRetry={refetchApplication} />
          ) : (
            <PDFViewer
              url={application.cv_url}
              publicId={publicId}
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
      </div>
    </div>
  );
}
