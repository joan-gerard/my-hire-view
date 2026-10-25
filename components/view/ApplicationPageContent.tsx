"use client";

import { ADMIN_PANEL_CLASS } from "@/components/admin/admin-chrome";
import PDFViewer from "@/components/pdf/PDFViewer";
import CvUnavailableWithRetry from "@/components/public/CvUnavailableWithRetry";
import VideoModal from "@/components/view/VideoModal";
import ViewTracker from "@/components/view/ViewTracker";
import type { PublicApplication } from "@/lib/types/application";

interface ApplicationPageContentProps {
  publicId: string;
  slug: string;
  application: PublicApplication;
  refetchApplication: () => Promise<void>;
  isVideoModalOpen: boolean;
  onCloseVideoModal: () => void;
  /** When false, skip ViewTracker (owner draft preview — F16-050). Default true. */
  trackViews?: boolean;
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
  trackViews = true,
}: ApplicationPageContentProps) {
  return (
    <>
      {trackViews ? <ViewTracker publicId={publicId} slug={slug} /> : null}
      <section className={`${ADMIN_PANEL_CLASS} overflow-hidden`}>
        {application.cv_exists === false ? (
          <div className="p-4 sm:p-6">
            <CvUnavailableWithRetry onRetry={refetchApplication} />
          </div>
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

      {isVideoModalOpen ? (
        <VideoModal
          videoUrl={application.video_url}
          onClose={onCloseVideoModal}
        />
      ) : null}
    </>
  );
}
