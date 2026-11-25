"use client";

import AdminModal from "@/components/admin/AdminModal";
import ApplicationPageHeader from "@/components/public/ApplicationPageHeader";
import ApplicationPageContent from "@/components/view/ApplicationPageContent";
import Button from "@/components/ui/Button";
import type { PublicApplication } from "@/lib/types/application";
import { useEffect, useState, type SyntheticEvent } from "react";

export type ApplicationFormPreviewDialogProps = {
  open: boolean;
  onClose: () => void;
  application: PublicApplication;
  publicId: string;
  slug: string;
  /** Confirm go-live from the preview. */
  onPublish: () => void;
  publishLoading?: boolean;
  canPublish?: boolean;
  /** Block Escape / backdrop while Publish is in flight. */
  dismissDisabled?: boolean;
};

/**
 * In-form recruiter page preview (F41-127). Does not save, leave the form, or
 * count a view. Escape closes the video pitch first when it is open.
 */
export default function ApplicationFormPreviewDialog({
  open,
  onClose,
  application,
  publicId,
  slug,
  onPublish,
  publishLoading = false,
  canPublish = true,
  dismissDisabled = false,
}: ApplicationFormPreviewDialogProps) {
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);

  useEffect(() => {
    if (!open) setIsVideoModalOpen(false);
  }, [open]);

  return (
    <AdminModal
      open={open}
      onClose={onClose}
      title="Preview"
      description="How recruiters will see this page after you publish. This does not save or go live yet."
      widthClassName="w-[min(100vw-1.5rem,72rem)]"
      layout="viewport"
      bodyClassName="min-h-0 flex-1 overflow-y-auto bg-[var(--white)] p-0"
      headerClose
      dismissDisabled={dismissDisabled}
      onCancel={(event: SyntheticEvent<HTMLDialogElement>) => {
        if (dismissDisabled) {
          event.preventDefault();
          return;
        }
        if (isVideoModalOpen) {
          event.preventDefault();
          setIsVideoModalOpen(false);
        }
      }}
      footer={
        <div className="flex flex-wrap items-center justify-end gap-2">
          <Button
            type="button"
            variant="secondary"
            disabled={dismissDisabled}
            onClick={onClose}
          >
            Back to form
          </Button>
          <Button
            type="button"
            variant="primary"
            loading={publishLoading}
            loadingLabel="Publishing…"
            disabled={!canPublish || publishLoading}
            onClick={() => {
              if (!canPublish || publishLoading) return;
              onPublish();
            }}
          >
            Publish
          </Button>
        </div>
      }
    >
      <div className="flex min-h-0 flex-col bg-[var(--white)]">
        <ApplicationPageHeader
          company={application.company}
          role={application.role}
          firstName={application.first_name}
          lastName={application.last_name}
          location={application.location}
          email={application.email}
          phone={application.phone}
          portfolioUrl={application.portfolio_url}
          linkedinUrl={application.linkedin_url}
          profileImageUrl={application.profile_picture_url?.trim() || undefined}
          onWatchVideo={
            application.video_url?.trim()
              ? () => setIsVideoModalOpen(true)
              : undefined
          }
          cvUrl={application.cv_url}
          publicId={publicId || undefined}
          slug={slug || undefined}
          cvFilename={application.cv_filename}
          useOriginalCvFilename={application.use_original_cv_filename}
        />
        <div className="mx-auto w-full max-w-6xl flex-1 px-0">
          <ApplicationPageContent
            publicId={publicId || "preview"}
            slug={slug || "preview"}
            application={application}
            refetchApplication={async () => {
              /* Form preview — no server refetch. */
            }}
            isVideoModalOpen={isVideoModalOpen}
            onCloseVideoModal={() => setIsVideoModalOpen(false)}
            trackViews={false}
          />
        </div>
      </div>
    </AdminModal>
  );
}
