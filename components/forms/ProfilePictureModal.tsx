"use client";

import Button from "@/components/ui/Button";
import { cacheBustProfilePictureUrl } from "@/lib/utils/profile-picture-storage";
import { useEffect, useId, useRef, useState } from "react";

const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

export type ProfilePictureSaveResult = {
  url: string | null;
  updated_at?: string | null;
};

export interface ProfilePictureModalProps {
  open: boolean;
  /** Current saved profile picture URL (from profiles). */
  currentUrl: string | null;
  /** Cache-bust key for currentUrl (e.g. profiles.updated_at). */
  currentUrlVersion?: string | null;
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
  onClose,
  onSaved,
}: ProfilePictureModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const titleId = useId();
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [previewObjectUrl, setPreviewObjectUrl] = useState<string | null>(null);
  const [removed, setRemoved] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      setPendingFile(null);
      setRemoved(false);
      setError(null);
      dialog.showModal();
    } else if (!open && dialog.open) {
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
  const displayUrl = removed
    ? null
    : (previewObjectUrl ?? savedDisplayUrl);
  const dirty = Boolean(pendingFile) || removed;
  const canSave = dirty && !loading;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      setError("Please choose a JPEG, PNG or WebP image.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("Image must be smaller than 5MB.");
      return;
    }
    setError(null);
    setRemoved(false);
    setPendingFile(file);
  };

  const handleSave = async () => {
    if (!canSave) return;
    setError(null);
    setLoading(true);
    try {
      let profilePictureUrl: string | null = null;

      if (removed && !pendingFile) {
        profilePictureUrl = null;
      } else if (pendingFile) {
        const fd = new FormData();
        fd.append("file", pendingFile);
        const uploadRes = await fetch("/api/upload/profile-picture", {
          method: "POST",
          body: fd,
        });
        const uploadJson = await uploadRes.json().catch(() => ({}));
        if (!uploadRes.ok) {
          setError(uploadJson.error ?? "Upload failed");
          return;
        }
        profilePictureUrl =
          typeof uploadJson.url === "string" ? uploadJson.url : null;
        if (!profilePictureUrl) {
          setError("Upload failed");
          return;
        }
      }

      const response = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profile_picture_url: profilePictureUrl }),
      });
      const json = await response.json().catch(() => ({}));
      if (!response.ok) {
        setError(json.error ?? "Failed to save profile picture");
        return;
      }
      if (Array.isArray(json.warnings) && json.warnings.length > 0) {
        setError(json.warnings.join(" "));
      }
      const savedUrl =
        typeof json.data?.profile_picture_url === "string"
          ? json.data.profile_picture_url
          : profilePictureUrl;
      const updatedAt =
        typeof json.data?.updated_at === "string"
          ? json.data.updated_at
          : String(Date.now());
      onSaved({
        url: savedUrl?.trim() || null,
        updated_at: updatedAt,
      });
      onClose();
    } catch {
      setError("Failed to save profile picture");
    } finally {
      setLoading(false);
    }
  };

  return (
    <dialog
      ref={dialogRef}
      className="fixed left-1/2 top-1/2 z-50 w-[min(100vw-2rem,26rem)] -translate-x-1/2 -translate-y-1/2 rounded-lg border border-[var(--foreground)]/15 bg-[var(--secondary-background)] p-0 text-[var(--foreground)] shadow-lg backdrop:bg-black/40"
      aria-labelledby={titleId}
      onClose={onClose}
      onClick={(e) => {
        if (e.target === dialogRef.current) onClose();
      }}
    >
      <div className="space-y-4 p-5">
        <h2 id={titleId} className="text-lg font-semibold">
          Profile picture
        </h2>
        <p className="text-sm text-[var(--foreground)]/80">
          One picture per account. Changes are saved when you click Save
          picture — then you can show it on this application.
        </p>

        {error && (
          <p
            className="rounded-md bg-red-50 p-3 text-sm text-red-700"
            role="alert"
          >
            {error}
          </p>
        )}

        <div className="flex flex-wrap items-center gap-4">
          {displayUrl ? (
            <div className="h-20 w-20 shrink-0 overflow-hidden rounded-full bg-[var(--foreground)]/10 ring-2 ring-[var(--foreground)]/10">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={displayUrl}
                alt=""
                className="h-full w-full object-cover"
                width={80}
                height={80}
              />
            </div>
          ) : (
            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-[var(--foreground)]/10 text-xs text-[var(--foreground)]/50">
              No photo
            </div>
          )}
          <div className="flex flex-wrap gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept={ALLOWED_IMAGE_TYPES.join(",")}
              className="hidden"
              onChange={handleFileChange}
            />
            <Button
              type="button"
              variant="secondary"
              disabled={loading}
              onClick={() => fileInputRef.current?.click()}
            >
              {displayUrl ? "Change" : "Choose picture"}
            </Button>
            {displayUrl && (
              <Button
                type="button"
                variant="secondary"
                disabled={loading}
                onClick={() => {
                  setPendingFile(null);
                  setRemoved(true);
                }}
              >
                Remove
              </Button>
            )}
          </div>
        </div>

        <div className="flex flex-wrap justify-end gap-2">
          <Button
            type="button"
            variant="secondary"
            disabled={loading}
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="primary"
            loading={loading}
            disabled={!canSave}
            onClick={() => void handleSave()}
          >
            Save picture
          </Button>
        </div>
      </div>
    </dialog>
  );
}
