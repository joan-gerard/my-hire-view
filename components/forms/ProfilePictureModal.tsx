"use client";

import { AvatarIcon } from "@/components/admin/icons";
import ProfilePictureIconActions from "@/components/forms/ProfilePictureIconActions";
import Button from "@/components/ui/Button";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import { notifyOnboardingChecklistChanged } from "@/lib/utils/onboarding-checklist-sync";
import { cacheBustProfilePictureUrl } from "@/lib/utils/profile-picture-storage";
import { mapProfileSaveWarnings } from "@/lib/utils/upload-form-messages";
import {
    putProfilePictureUrl,
    uploadProfilePictureFile,
} from "@/lib/utils/upload-profile-picture-client";
import { useEffect, useId, useRef, useState } from "react";
import { FiAlertCircle, FiAlertTriangle } from "react-icons/fi";

const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_SIZE_BYTES = 5 * 1024 * 1024;

export type ProfilePictureSaveResult = {
  url: string | null;
  updated_at?: string | null;
};

export type ProfilePictureModalUsage = "application" | "account";

export interface ProfilePictureModalProps {
  open: boolean;
  /** Current saved profile picture URL (from profiles). */
  currentUrl: string | null;
  /** Cache-bust key for currentUrl (e.g. profiles.updated_at). */
  currentUrlVersion?: string | null;
  /** Used for initials when there is no picture (same idea as Profile). */
  firstName?: string | null;
  lastName?: string | null;
  /**
   * Where the dialog was opened from — drives empty-state helper copy.
   * Defaults to `application` (New/Edit form). Use `account` on Profile.
   */
  usage?: ProfilePictureModalUsage;
  onClose: () => void;
  /** Called after a successful save with the new URL (or null if removed). */
  onSaved: (result: ProfilePictureSaveResult) => void;
}

/**
 * Modal to view / replace / remove the account profile picture (upload-on-save).
 * Used from application new/edit flows so users need not leave for /admin/profile.
 */
export default function ProfilePictureModal({
  open,
  currentUrl,
  currentUrlVersion,
  firstName,
  lastName,
  usage = "application",
  onClose,
  onSaved,
}: ProfilePictureModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  /** Initial focus target: Choose/Change (not Remove). */
  const chooseChangeButtonRef = useRef<HTMLButtonElement>(null);
  const primaryButtonRef = useRef<HTMLButtonElement>(null);
  const titleId = useId();
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [previewObjectUrl, setPreviewObjectUrl] = useState<string | null>(null);
  /**
   * URL from a successful upload when PUT /api/profile has not yet succeeded.
   * Retries reuse this instead of uploading again.
   */
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);
  const [removed, setRemoved] = useState(false);
  const [submitPhase, setSubmitPhase] = useState<
    "idle" | "uploading" | "saving"
  >("idle");
  const [error, setError] = useState<string | null>(null);
  /** Post-save side-effect notice (not a failure). */
  const [notice, setNotice] = useState<string | null>(null);
  const [discardConfirmOpen, setDiscardConfirmOpen] = useState(false);
  /** Polite live announcements (progress + selection cues). */
  const [liveMessage, setLiveMessage] = useState("");

  const announce = (message: string) => {
    // Clear first so identical strings still re-announce (WCAG live regions).
    setLiveMessage("");
    queueMicrotask(() => {
      setLiveMessage(message);
    });
  };

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      setPendingFile(null);
      setUploadedUrl(null);
      setRemoved(false);
      setError(null);
      setNotice(null);
      setLiveMessage("");
      setDiscardConfirmOpen(false);
      dialog.showModal();
      queueMicrotask(() => {
        chooseChangeButtonRef.current?.focus();
      });
    } else if (!open && dialog.open) {
      setDiscardConfirmOpen(false);
      dialog.close();
    }
  }, [open]);

  useEffect(() => {
    if (!pendingFile) {
      setPreviewObjectUrl(null);
      return;
    }
    const url = URL.createObjectURL(pendingFile);
    setPreviewObjectUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [pendingFile]);

  const savedDisplayUrl = cacheBustProfilePictureUrl(
    currentUrl,
    currentUrlVersion,
  );
  const displayUrl = removed ? null : (previewObjectUrl ?? savedDisplayUrl);
  const loading = submitPhase !== "idle";
  const isRemoveOnly = removed && !pendingFile;
  const primaryLabel = isRemoveOnly ? "Remove and save" : "Save picture";
  const primaryLoadingLabel = isRemoveOnly
    ? "Removing…"
    : submitPhase === "uploading"
      ? "Uploading…"
      : "Saving…";
  const dirty = Boolean(pendingFile) || removed;
  const canSave = dirty && !loading;
  const hasExistingPicture = Boolean(currentUrl?.trim());
  const dismissLabel = (notice || error) && !dirty ? "Close" : "Cancel";

  const requestClose = () => {
    if (loading) return;
    if (dirty) {
      setDiscardConfirmOpen(true);
      return;
    }
    onClose();
  };

  const focusParentAfterDiscardCancel = () => {
    setDiscardConfirmOpen(false);
    queueMicrotask(() => {
      if (canSave) {
        primaryButtonRef.current?.focus();
        return;
      }
      chooseChangeButtonRef.current?.focus();
    });
  };

  const helperLead = isRemoveOnly
    ? "Removes your picture from your account. Applications that show it will be marked Picture missing."
    : hasExistingPicture
      ? "Replaces your picture on all your applications."
      : usage === "account"
        ? "This picture will be available on applications where you choose to show it."
        : "This picture will show on this application. You can turn it off later.";
  const helperEmphasis = isRemoveOnly
    ? null
    : "Your new picture goes live when you click Save picture.";
  const initials =
    `${(firstName ?? "").charAt(0)}${(lastName ?? "").charAt(0)}`.toUpperCase();
  const hasInitials = Boolean(initials.trim());

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      setNotice(null);
      setError("Please choose a JPEG, PNG or WebP image.");
      return;
    }
    if (file.size > MAX_SIZE_BYTES) {
      setNotice(null);
      setError("Image must be 5 MB or smaller.");
      return;
    }
    setError(null);
    setNotice(null);
    setUploadedUrl(null);
    setRemoved(false);
    setPendingFile(file);
    announce(`New picture selected: ${file.name}. Not saved yet.`);
  };

  const handleDiscardNew = () => {
    setPendingFile(null);
    setUploadedUrl(null);
    setError(null);
    setNotice(null);
    announce(
      hasExistingPicture
        ? "New picture discarded. Showing your saved picture."
        : "New picture discarded.",
    );
  };

  const handleMarkRemoved = () => {
    setPendingFile(null);
    setUploadedUrl(null);
    setError(null);
    setNotice(null);
    setRemoved(true);
    announce("Picture marked for removal. Will be removed when you save.");
  };

  const handleSave = async () => {
    if (!canSave) return;
    setError(null);
    setNotice(null);
    const needsUpload = Boolean(pendingFile) && !uploadedUrl;
    setSubmitPhase(needsUpload ? "uploading" : "saving");
    if (needsUpload) {
      announce("Uploading…");
    } else {
      announce(isRemoveOnly ? "Removing…" : "Saving…");
    }
    try {
      let profilePictureUrl: string | null = null;
      let uploadWarning: string | undefined;

      if (removed && !pendingFile) {
        profilePictureUrl = null;
      } else if (pendingFile) {
        if (uploadedUrl) {
          profilePictureUrl = uploadedUrl;
        } else {
          const upload = await uploadProfilePictureFile(pendingFile);
          if (!upload.ok) {
            setNotice(null);
            setError(upload.error);
            setLiveMessage("");
            return;
          }
          profilePictureUrl = upload.url;
          setUploadedUrl(upload.url);
          uploadWarning = upload.warning;
          setSubmitPhase("saving");
          announce("Saving…");
        }
      }

      const put = await putProfilePictureUrl(profilePictureUrl);
      if (!put.ok) {
        setNotice(null);
        setError(put.error);
        setLiveMessage("");
        return;
      }

      const nextNotice = mapProfileSaveWarnings([
        uploadWarning,
        ...put.warnings,
      ]);

      const data = put.data as
        | { profile_picture_url?: unknown; updated_at?: unknown }
        | null
        | undefined;
      const savedUrl =
        typeof data?.profile_picture_url === "string"
          ? data.profile_picture_url
          : profilePictureUrl;
      const updatedAt =
        typeof data?.updated_at === "string"
          ? data.updated_at
          : String(Date.now());
      onSaved({
        url: savedUrl?.trim() || null,
        updated_at: updatedAt,
      });
      setPendingFile(null);
      setUploadedUrl(null);
      setRemoved(false);
      notifyOnboardingChecklistChanged();

      if (nextNotice) {
        setNotice(nextNotice);
        setLiveMessage("");
        return;
      }
      onClose();
    } catch {
      setNotice(null);
      setError(
        "Couldn’t save your picture. Check your connection and try again.",
      );
      setLiveMessage("");
    } finally {
      setSubmitPhase("idle");
    }
  };

  return (
    <>
      <dialog
        ref={dialogRef}
        className="fixed left-1/2 top-1/2 z-50 w-[min(100vw-2rem,26rem)] max-h-[min(90vh,36rem)] -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-[28px] border border-[var(--ink)]/8 bg-[var(--white)] p-0 text-[var(--ink)] shadow-lg backdrop:bg-black/40"
        aria-labelledby={titleId}
        onClose={onClose}
        onCancel={(e) => {
          if (loading || dirty) {
            e.preventDefault();
            if (!loading && dirty && !discardConfirmOpen) {
              setDiscardConfirmOpen(true);
            }
          }
        }}
      >
        <div className="space-y-4 p-5">
          <h2
            id={titleId}
            className="font-heading text-lg font-semibold tracking-[-0.02em]"
          >
            Profile picture
          </h2>
          <p className="text-sm text-[var(--muted)]">
            {helperLead}
            {helperEmphasis ? (
              <>
                {" "}
                <span className="font-semibold text-[var(--ink)]">
                  {helperEmphasis}
                </span>
              </>
            ) : null}
          </p>
          <p
            className={
              isRemoveOnly || pendingFile
                ? "text-sm font-semibold text-[var(--ink)]"
                : "text-sm text-[var(--muted)]"
            }
          >
            {isRemoveOnly
              ? "Will be removed when you save"
              : pendingFile
                ? "Not saved yet"
                : "JPEG, PNG or WebP, up to 5 MB."}
          </p>

          {notice ? (
            <p
              className="flex items-start gap-2 rounded-xl border border-[var(--ink)]/12 bg-[var(--status-wash-notice)] p-3 text-sm text-[var(--ink)]"
              role="status"
            >
              <FiAlertTriangle className="mt-0.5 size-4 shrink-0" aria-hidden />
              <span>{notice}</span>
            </p>
          ) : null}
          {error ? (
            <p
              className="flex items-start gap-2 rounded-xl border border-[var(--status-danger-fg)]/20 bg-[var(--status-danger-bg)] p-3 text-sm text-[var(--status-danger-fg)]"
              role="alert"
            >
              <FiAlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden />
              <span>{error}</span>
            </p>
          ) : null}

          <p className="sr-only" aria-live="polite" aria-atomic="true">
            {liveMessage}
          </p>

          <input
            ref={fileInputRef}
            type="file"
            accept={ALLOWED_IMAGE_TYPES.join(",")}
            className="hidden"
            onChange={handleFileChange}
          />

          <ProfilePictureIconActions
            ref={chooseChangeButtonRef}
            disabled={loading}
            chooseLabel={displayUrl ? "Change picture" : "Choose picture"}
            onChooseOrChange={() => fileInputRef.current?.click()}
            onRemove={
              pendingFile
                ? handleDiscardNew
                : displayUrl
                  ? handleMarkRemoved
                  : undefined
            }
            removeLabel={pendingFile ? "Discard new picture" : "Remove picture"}
          >
            {displayUrl ? (
              <div className="h-48 w-48 overflow-hidden rounded-full bg-[var(--ink)]/10 ring-2 ring-[var(--ink)]/10">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={displayUrl}
                  alt={
                    pendingFile
                      ? "New profile picture preview"
                      : "Your profile picture"
                  }
                  className="h-full w-full object-cover"
                  width={192}
                  height={192}
                />
              </div>
            ) : (
              <div className="flex h-48 w-48 items-center justify-center overflow-hidden rounded-full bg-[var(--lime)] text-[var(--ink)]">
                {hasInitials ? (
                  <span
                    className="font-heading text-5xl font-semibold tracking-[-0.02em]"
                    aria-hidden
                  >
                    {initials}
                  </span>
                ) : (
                  <AvatarIcon className="h-16 w-16" />
                )}
              </div>
            )}
          </ProfilePictureIconActions>

          {/* Primary then dismiss — same order for save and remove confirm. */}
          <div className="flex flex-col gap-2 min-[400px]:flex-row min-[400px]:justify-end">
            <Button
              ref={primaryButtonRef}
              type="button"
              variant={isRemoveOnly ? "danger" : "primary"}
              shape="rounded"
              loading={loading}
              loadingLabel={primaryLoadingLabel}
              disabled={!canSave}
              className="min-h-11 w-full min-[400px]:w-auto"
              onClick={() => void handleSave()}
            >
              {primaryLabel}
            </Button>
            <Button
              type="button"
              variant="secondary"
              shape="rounded"
              disabled={loading}
              className="min-h-11 w-full min-[400px]:w-auto"
              onClick={requestClose}
            >
              {dismissLabel}
            </Button>
          </div>
        </div>
      </dialog>
      <ConfirmDialog
        open={discardConfirmOpen}
        title="Discard picture changes?"
        message="Your picture changes aren’t saved yet. Discard them?"
        confirmLabel="Discard"
        cancelLabel="Keep editing"
        confirmVariant="danger"
        onConfirm={() => {
          setDiscardConfirmOpen(false);
          onClose();
        }}
        onCancel={focusParentAfterDiscardCancel}
      />
    </>
  );
}
