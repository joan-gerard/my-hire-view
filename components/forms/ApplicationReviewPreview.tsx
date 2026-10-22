"use client";

import {
  ADMIN_PANEL_CLASS,
  ADMIN_SECONDARY_CLASS,
} from "@/components/admin/admin-chrome";
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
  const dialogRef = useRef<HTMLDialogElement>(null);
  const openButtonRef = useRef<HTMLButtonElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const closeEmittedRef = useRef(false);
  /** True only when the press started on the dialog backdrop (not the panel). */
  const pointerDownOnBackdropRef = useRef(false);
  const dialogId = useId();
  const titleId = useId();
  const descriptionId = useId();

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

  const requestDismiss = () => {
    setVideoOpen(false);
    const dialog = dialogRef.current;
    if (!dialog) {
      setOpen(false);
      return;
    }
    if (dialog.open) {
      dialog.close();
    } else {
      setOpen(false);
    }
  };

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      closeEmittedRef.current = false;
      dialog.showModal();
      titleRef.current?.focus({
        preventScroll: true,
        focusVisible: false,
      } as FocusOptions & { focusVisible?: boolean });
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    const handleClose = () => {
      if (closeEmittedRef.current) return;
      closeEmittedRef.current = true;
      setVideoOpen(false);
      setOpen(false);
      openButtonRef.current?.focus();
    };
    dialog.addEventListener("close", handleClose);
    return () => dialog.removeEventListener("close", handleClose);
  }, []);

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

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
      <dialog
        ref={dialogRef}
        id={dialogId}
        className="z-50 m-auto h-fit max-h-[90vh] w-[min(100vw-2rem,64rem)] overflow-visible border-0 bg-transparent p-0 shadow-none backdrop:bg-black/40 open:flex open:flex-col"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        onCancel={(event) => {
          if (!videoOpen) return;
          event.preventDefault();
          setVideoOpen(false);
        }}
        onPointerDown={(event) => {
          pointerDownOnBackdropRef.current = event.target === dialogRef.current;
        }}
        onClick={(event) => {
          const startedOnBackdrop = pointerDownOnBackdropRef.current;
          pointerDownOnBackdropRef.current = false;
          if (startedOnBackdrop && event.target === dialogRef.current) {
            requestDismiss();
          }
        }}
      >
        <div
          className={`flex max-h-[90vh] w-full flex-col overflow-hidden text-[var(--ink)] shadow-[0_12px_40px_-16px_rgba(11,11,12,0.28)] ${ADMIN_PANEL_CLASS}`}
        >
          <header className="shrink-0 border-b border-[var(--ink)]/8 px-5 pb-4 pt-5 sm:px-6">
            <h2
              ref={titleRef}
              id={titleId}
              tabIndex={-1}
              className="font-heading text-lg font-semibold tracking-[-0.02em] outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ink)]"
            >
              Preview
            </h2>
            <p
              id={descriptionId}
              className="mt-1.5 text-sm leading-snug text-[var(--muted)]"
            >
              What recruiters will see.
            </p>
          </header>
          <div className="min-h-0 flex-1 overflow-y-auto">
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
          </div>
          <footer className="relative z-10 flex shrink-0 justify-end border-t border-[var(--ink)]/8 bg-[var(--white)] px-5 py-3 sm:px-6">
            <button
              type="button"
              onClick={requestDismiss}
              className={ADMIN_SECONDARY_CLASS}
            >
              Close
            </button>
          </footer>
        </div>
        {videoOpen && previewVideoUrl ? (
          <VideoModal
            videoUrl={previewVideoUrl}
            onClose={() => setVideoOpen(false)}
          />
        ) : null}
      </dialog>
    </div>
  );
}
