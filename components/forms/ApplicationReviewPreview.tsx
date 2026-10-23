"use client";

import AdminModal from "@/components/admin/AdminModal";
import { ADMIN_SECONDARY_CLASS } from "@/components/admin/admin-chrome";
import ApplicationPageHeader from "@/components/public/ApplicationPageHeader";
import PDFViewer from "@/components/pdf/PDFViewer";
import VideoModal from "@/components/view/VideoModal";
import { cacheBustProfilePictureUrl } from "@/lib/utils/profile-picture-storage";
import { useEffect, useId, useRef, useState } from "react";

export interface ApplicationReviewPreviewProps {
  company: string;
  role: string;
  firstName?: string | null;
  lastName?: string | null;
  location?: string | null;
  portfolioUrl?: string | null;
  linkedinUrl?: string | null;
  profilePictureUrl?: string | null;
  profilePictureVersion?: string | null;
  showProfilePicture: boolean;
  cvUrl?: string | null;
  /** Selected tailored file that has not been uploaded yet. */
  cvPendingFile?: File | null;
  cvFilename?: string | null;
  useOriginalCvFilename?: boolean;
  slug?: string;
  videoUrl?: string | null;
}

/**
 * Recruiter-page preview on Review & save. Opens in a dialog so the form
 * stays in place. Same header and CV as `/view`, without view tracking
 * or the public footer.
 */
export default function ApplicationReviewPreview({
  company,
  role,
  firstName,
  lastName,
  location,
  portfolioUrl,
  linkedinUrl,
  profilePictureUrl,
  profilePictureVersion,
  showProfilePicture,
  cvUrl,
  cvPendingFile,
  cvFilename,
  useOriginalCvFilename = true,
  slug,
  videoUrl,
}: ApplicationReviewPreviewProps) {
  const [open, setOpen] = useState(false);
  const [videoOpen, setVideoOpen] = useState(false);
  const [pendingCvUrl, setPendingCvUrl] = useState<string | null>(null);
  const openButtonRef = useRef<HTMLButtonElement>(null);
  const dialogId = useId();

  useEffect(() => {
    if (!cvPendingFile) {
      setPendingCvUrl(null);
      return;
    }
    const url = URL.createObjectURL(cvPendingFile);
    setPendingCvUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [cvPendingFile]);

  const previewCvUrl = pendingCvUrl || cvUrl?.trim() || "";
  const previewVideoUrl = videoUrl?.trim() || "";
  const pictureUrl = showProfilePicture
    ? cacheBustProfilePictureUrl(profilePictureUrl, profilePictureVersion)
    : null;

  return (
    <div>
      <button
        ref={openButtonRef}
        type="button"
        className={ADMIN_SECONDARY_CLASS}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={dialogId}
        onClick={() => setOpen(true)}
      >
        Show preview
      </button>
      <AdminModal
        id={dialogId}
        open={open}
        onClose={() => {
          setVideoOpen(false);
          setOpen(false);
        }}
        title="Preview"
        description="What recruiters will see."
        widthClassName="w-[min(100vw-2rem,64rem)]"
        layout="viewport"
        bodyClassName="min-h-0 flex-1 overflow-y-auto"
        returnFocusRef={openButtonRef}
        onCancel={(event) => {
          if (!videoOpen) return;
          event.preventDefault();
          setVideoOpen(false);
        }}
        overlay={
          videoOpen && previewVideoUrl ? (
            <VideoModal
              videoUrl={previewVideoUrl}
              onClose={() => setVideoOpen(false)}
            />
          ) : null
        }
      >
        <ApplicationPageHeader
          company={company}
          role={role}
          firstName={firstName}
          lastName={lastName}
          location={location}
          portfolioUrl={portfolioUrl}
          linkedinUrl={linkedinUrl}
          profileImageUrl={pictureUrl}
          onWatchVideo={
            previewVideoUrl ? () => setVideoOpen(true) : undefined
          }
          cvUrl={previewCvUrl || null}
          slug={slug}
          cvFilename={cvPendingFile?.name || cvFilename}
          useOriginalCvFilename={useOriginalCvFilename}
        />
        <div className="overflow-x-auto px-2 pb-4 sm:px-4">
          {open && previewCvUrl ? (
            <PDFViewer
              url={previewCvUrl}
              slug={slug}
              cvFilename={cvPendingFile?.name || cvFilename}
              useOriginalCvFilename={useOriginalCvFilename}
            />
          ) : (
            <p className="px-2 py-8 text-center text-sm text-[var(--muted)]">
              Add a CV to preview the resume.
            </p>
          )}
        </div>
      </AdminModal>
    </div>
  );
}
