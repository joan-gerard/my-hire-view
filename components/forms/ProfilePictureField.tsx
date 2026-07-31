"use client";

import Button from "@/components/ui/Button";
import ProfilePictureModal, {
  type ProfilePictureSaveResult,
} from "@/components/forms/ProfilePictureModal";
import { cacheBustProfilePictureUrl } from "@/lib/utils/profile-picture-storage";
import { useState } from "react";

export interface ProfilePictureFieldProps {
  /** Live profile picture URL from profiles (not stored on the application). */
  profilePictureUrl?: string | null;
  /** Cache-bust key (e.g. profiles.updated_at). */
  profilePictureVersion?: string | null;
  /** Called when the user saves a new/cleared picture via the modal. */
  onProfilePictureSaved?: (result: ProfilePictureSaveResult) => void;
  showProfilePicture: boolean;
  onShowProfilePictureChange: (show: boolean) => void;
}

export default function ProfilePictureField({
  profilePictureUrl,
  profilePictureVersion,
  onProfilePictureSaved,
  showProfilePicture,
  onShowProfilePictureChange,
}: ProfilePictureFieldProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const hasProfilePicture = Boolean(profilePictureUrl?.trim());
  const canManage = typeof onProfilePictureSaved === "function";
  const thumbnailUrl = cacheBustProfilePictureUrl(
    profilePictureUrl,
    profilePictureVersion,
  );

  return (
    <>
      <fieldset className="rounded-lg border border-[var(--foreground)]/10 bg-[var(--background)] p-4">
        <legend className="px-1 text-base font-semibold text-[var(--foreground)]">
          Profile picture
        </legend>
        <p className="mt-0.5 mb-3 text-sm text-[var(--foreground)]/80">
          {hasProfilePicture
            ? "Show your profile picture on this application?"
            : "Add a profile picture to show it on applications."}
        </p>

        {hasProfilePicture && thumbnailUrl && (
          <div className="mb-3 flex items-center gap-3">
            <div className="h-12 w-12 shrink-0 overflow-hidden rounded-full bg-[var(--foreground)]/10 ring-1 ring-[var(--foreground)]/10">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={thumbnailUrl}
                alt=""
                className="h-full w-full object-cover"
                width={48}
                height={48}
              />
            </div>
            {canManage && (
              <Button
                type="button"
                variant="secondary"
                onClick={() => setModalOpen(true)}
              >
                Change picture
              </Button>
            )}
          </div>
        )}

        {!hasProfilePicture && canManage && (
          <div className="mb-3">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setModalOpen(true)}
            >
              Add profile picture
            </Button>
          </div>
        )}

        <div className="flex flex-wrap gap-x-6 gap-y-3">
          <label className="inline-flex cursor-pointer items-center gap-2.5">
            <input
              type="radio"
              name="showProfilePicture"
              checked={hasProfilePicture && showProfilePicture === true}
              disabled={!hasProfilePicture}
              onChange={() => onShowProfilePictureChange(true)}
              className="h-4 w-4 border-[var(--foreground)]/30 text-[var(--brand-primary)] focus:ring-[var(--brand-primary)] disabled:opacity-60"
            />
            <span className="text-base font-medium text-[var(--foreground)]">
              Yes
            </span>
          </label>
          <label className="inline-flex cursor-pointer items-center gap-2.5">
            <input
              type="radio"
              name="showProfilePicture"
              checked={!hasProfilePicture || showProfilePicture === false}
              disabled={!hasProfilePicture}
              onChange={() => onShowProfilePictureChange(false)}
              className="h-4 w-4 border-[var(--foreground)]/30 text-[var(--brand-primary)] focus:ring-[var(--brand-primary)] disabled:opacity-60"
            />
            <span className="text-base font-medium text-[var(--foreground)]">
              No
            </span>
          </label>
        </div>
      </fieldset>

      {canManage && (
        <ProfilePictureModal
          open={modalOpen}
          currentUrl={profilePictureUrl ?? null}
          currentUrlVersion={profilePictureVersion}
          onClose={() => setModalOpen(false)}
          onSaved={(result) => {
            onProfilePictureSaved!(result);
            if (result.url) onShowProfilePictureChange(true);
            else onShowProfilePictureChange(false);
          }}
        />
      )}
    </>
  );
}
