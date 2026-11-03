"use client";

import { ADMIN_FIELDSET_CLASS } from "@/components/admin/admin-chrome";
import { AvatarIcon } from "@/components/admin/icons";
import ProfilePictureModal, {
  type ProfilePictureSaveResult,
} from "@/components/forms/ProfilePictureModal";
import Button from "@/components/ui/Button";
import { cacheBustProfilePictureUrl } from "@/lib/utils/profile-picture-storage";
import { useRef, useState } from "react";

export interface ProfilePictureFieldProps {
  /** Live profile picture URL from profiles (not stored on the application). */
  profilePictureUrl?: string | null;
  /** Cache-bust key (e.g. profiles.updated_at). */
  profilePictureVersion?: string | null;
  /** Used for initials when there is no picture (same idea as Profile). */
  firstName?: string | null;
  lastName?: string | null;
  /** Called when the user saves a new/cleared picture via the modal. */
  onProfilePictureSaved?: (result: ProfilePictureSaveResult) => void;
  showProfilePicture: boolean;
  onShowProfilePictureChange: (show: boolean) => void;
  /**
   * `checklist` matches the create About you demo: Show/Hide cards,
   * short copy, and Manage/Add under the choices.
   */
  variant?: "default" | "checklist";
}

function initialsFromNames(
  firstName?: string | null,
  lastName?: string | null,
): string {
  return `${(firstName ?? "").charAt(0)}${(lastName ?? "").charAt(0)}`.toUpperCase();
}

function choiceCardClass(selected: boolean): string {
  return `flex min-h-11 cursor-pointer items-center gap-3 rounded-xl px-3 py-2 text-sm ring-1 ring-inset ${
    selected
      ? "bg-[var(--paper)] text-[var(--ink)] ring-[var(--ink)]"
      : "bg-[var(--white)] text-[var(--ink)] ring-[var(--ink)]/15 hover:bg-[var(--paper)]/70"
  }`;
}

const manageLinkClass =
  "rounded-sm text-sm font-medium text-[var(--ink)] underline decoration-[var(--ink)]/30 underline-offset-4 outline-none hover:decoration-[var(--ink)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ink)]";

export default function ProfilePictureField({
  profilePictureUrl,
  profilePictureVersion,
  firstName,
  lastName,
  onProfilePictureSaved,
  showProfilePicture,
  onShowProfilePictureChange,
  variant = "default",
}: ProfilePictureFieldProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const hasProfilePicture = Boolean(profilePictureUrl?.trim());
  const canManage = typeof onProfilePictureSaved === "function";
  const thumbnailUrl = cacheBustProfilePictureUrl(
    profilePictureUrl,
    profilePictureVersion,
  );
  const initials = initialsFromNames(firstName, lastName);
  const hasInitials = Boolean(initials.trim());
  const manageLabel = hasProfilePicture
    ? "Manage picture"
    : "Add profile picture";

  const closeModal = () => {
    setModalOpen(false);
    // Return focus to the trigger after the native dialog closes.
    requestAnimationFrame(() => {
      triggerRef.current?.focus();
    });
  };

  const modal = canManage ? (
    <ProfilePictureModal
      open={modalOpen}
      currentUrl={profilePictureUrl ?? null}
      currentUrlVersion={profilePictureVersion}
      firstName={firstName}
      lastName={lastName}
      usage="application"
      onClose={closeModal}
      onSaved={(result) => {
        const hadPictureBefore = hasProfilePicture;
        onProfilePictureSaved!(result);
        if (!result.url) {
          onShowProfilePictureChange(false);
          return;
        }
        // First picture only — replacing must not flip a deliberate No to Yes.
        if (!hadPictureBefore) onShowProfilePictureChange(true);
      }}
    />
  ) : null;

  if (variant === "checklist") {
    return (
      <>
        <fieldset>
          <legend className="text-sm font-medium text-[var(--ink)]">
            Profile picture
          </legend>
          <p className="mt-1 text-sm leading-relaxed text-[var(--muted)]">
            The picture stays on your profile. This only chooses whether the page
            shows it.
          </p>

          {!hasProfilePicture && showProfilePicture ? (
            <p
              className="mt-3 rounded-xl border border-[var(--status-dot-active)]/50 bg-[var(--status-wash-active)] p-3 text-sm text-[var(--ink)]"
              role="status"
            >
              This application is set to show your profile picture, but you do
              not have one. Add a picture below, or the public page will have no
              avatar until you do.
            </p>
          ) : null}

          <div className="mt-3 flex items-center gap-3">
            {showProfilePicture ? (
              hasProfilePicture && thumbnailUrl ? (
                <div className="size-12 shrink-0 overflow-hidden rounded-full bg-[var(--ink)]/10 ring-1 ring-[var(--ink)]/10">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={thumbnailUrl}
                    alt="Your profile picture"
                    className="h-full w-full object-cover"
                    width={48}
                    height={48}
                  />
                </div>
              ) : (
                <span
                  className="flex size-12 shrink-0 items-center justify-center rounded-full bg-[var(--ink)] text-sm font-medium text-[var(--white)]"
                  aria-hidden
                >
                  {hasInitials ? initials : <AvatarIcon className="h-5 w-5" />}
                </span>
              )
            ) : null}
            <div className="grid flex-1 gap-2 sm:grid-cols-2">
              {(
                [
                  [true, "Show picture"],
                  [false, "Hide picture"],
                ] as const
              ).map(([show, label]) => (
                <label
                  key={label}
                  className={choiceCardClass(showProfilePicture === show)}
                >
                  <input
                    type="radio"
                    name="showProfilePicture"
                    checked={showProfilePicture === show}
                    onChange={() => onShowProfilePictureChange(show)}
                    className="size-4 shrink-0 accent-[var(--ink)]"
                  />
                  {label}
                </label>
              ))}
            </div>
          </div>

          {canManage ? (
            <button
              ref={triggerRef}
              type="button"
              className={`mt-3 ${manageLinkClass}`}
              onClick={() => setModalOpen(true)}
            >
              {manageLabel}
            </button>
          ) : null}
        </fieldset>
        {modal}
      </>
    );
  }

  const hideThumbnail = hasProfilePicture && !showProfilePicture;

  return (
    <>
      <fieldset className={ADMIN_FIELDSET_CLASS}>
        <legend className="text-base font-semibold text-[var(--ink)]">
          Profile picture
        </legend>
        <p className="mt-0.5 mb-2 text-sm text-[var(--muted)]">
          {hasProfilePicture
            ? "Show your profile picture on this application?"
            : "Add a picture to use on your applications."}
        </p>

        {!hasProfilePicture && showProfilePicture && (
          <p
            className="mb-3 rounded-xl border border-[var(--status-dot-active)]/50 bg-[var(--status-wash-active)] p-3 text-sm text-[var(--ink)]"
            role="status"
          >
            This application is set to show your profile picture, but you do not
            have one. Add a picture below, or the public page will have no
            avatar until you do.
          </p>
        )}

        {hasProfilePicture && (
          <div className="mb-4 flex flex-wrap gap-x-6 gap-y-3">
            <label className="inline-flex cursor-pointer items-center gap-2.5">
              <input
                type="radio"
                name="showProfilePicture"
                checked={showProfilePicture === true}
                onChange={() => onShowProfilePictureChange(true)}
                className="h-4 w-4 border-[var(--ink)]/30 text-[var(--ink)] focus:ring-[var(--ink)]"
              />
              <span className="text-base font-medium text-[var(--ink)]">
                Yes
              </span>
            </label>
            <label className="inline-flex cursor-pointer items-center gap-2.5">
              <input
                type="radio"
                name="showProfilePicture"
                checked={showProfilePicture === false}
                onChange={() => onShowProfilePictureChange(false)}
                className="h-4 w-4 border-[var(--ink)]/30 text-[var(--ink)] focus:ring-[var(--ink)]"
              />
              <span className="text-base font-medium text-[var(--ink)]">
                No
              </span>
            </label>
          </div>
        )}

        <div className="flex items-center gap-3">
          {hideThumbnail ? null : hasProfilePicture && thumbnailUrl ? (
            <div className="h-24 w-24 shrink-0 overflow-hidden rounded-full bg-[var(--ink)]/10 ring-1 ring-[var(--ink)]/10">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={thumbnailUrl}
                alt="Your profile picture"
                className="h-full w-full object-cover"
                width={96}
                height={96}
              />
            </div>
          ) : (
            <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[var(--lime)] text-[var(--ink)]">
              {hasInitials ? (
                <span
                  className="font-heading text-2xl font-semibold tracking-[-0.02em]"
                  aria-hidden
                >
                  {initials}
                </span>
              ) : (
                <AvatarIcon className="h-10 w-10" />
              )}
            </div>
          )}
          {canManage && (
            <Button
              ref={triggerRef}
              type="button"
              variant="secondary"
              onClick={() => setModalOpen(true)}
            >
              {manageLabel}
            </Button>
          )}
        </div>
      </fieldset>

      {modal}
    </>
  );
}
