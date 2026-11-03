"use client";

import { ADMIN_FIELDSET_CLASS } from "@/components/admin/admin-chrome";
import { AvatarIcon } from "@/components/admin/icons";
import { cacheBustProfilePictureUrl } from "@/lib/utils/profile-picture-storage";
import Link from "next/link";

export interface ProfilePictureFieldProps {
  /** Live profile picture URL from profiles (not stored on the application). */
  profilePictureUrl?: string | null;
  /** Cache-bust key (e.g. profiles.updated_at). */
  profilePictureVersion?: string | null;
  /** Used for initials when there is no picture (same idea as Profile). */
  firstName?: string | null;
  lastName?: string | null;
  showProfilePicture: boolean;
  onShowProfilePictureChange: (show: boolean) => void;
  /**
   * `checklist` uses Show/Hide cards. `default` uses Yes/No.
   * A missing picture links to Profile instead of uploading here.
   */
  variant?: "default" | "checklist";
  /** The surrounding row already names the field. */
  hideLegend?: boolean;
}

function initialsFromNames(
  firstName?: string | null,
  lastName?: string | null,
): string {
  return `${(firstName ?? "").charAt(0)}${(lastName ?? "").charAt(0)}`.toUpperCase();
}

function choiceCardClass(selected: boolean): string {
  return `flex min-h-9 cursor-pointer items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-sm ring-1 ring-inset ${
    selected
      ? "bg-[var(--paper)] text-[var(--ink)] ring-[var(--ink)]"
      : "bg-[var(--white)] text-[var(--ink)] ring-[var(--ink)]/15 hover:bg-[var(--paper)]/70"
  }`;
}

const profileLinkClass =
  "rounded-sm text-sm font-medium text-[var(--ink)] underline decoration-[var(--ink)]/30 underline-offset-4 outline-none hover:decoration-[var(--ink)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ink)]";

function AddPictureOnProfile() {
  return (
    <p className="mt-1 text-sm text-[var(--muted)]">
      <Link href="/admin/profile" className={profileLinkClass}>
        Add a picture on your profile
      </Link>
    </p>
  );
}

export default function ProfilePictureField({
  profilePictureUrl,
  profilePictureVersion,
  firstName,
  lastName,
  showProfilePicture,
  onShowProfilePictureChange,
  variant = "default",
  hideLegend = false,
}: ProfilePictureFieldProps) {
  const hasProfilePicture = Boolean(profilePictureUrl?.trim());
  const thumbnailUrl = cacheBustProfilePictureUrl(
    profilePictureUrl,
    profilePictureVersion,
  );
  const initials = initialsFromNames(firstName, lastName);
  const hasInitials = Boolean(initials.trim());

  if (!hasProfilePicture) {
    return (
      <fieldset
        className={variant === "default" ? ADMIN_FIELDSET_CLASS : undefined}
      >
        {hideLegend ? null : (
          <legend
            className={
              variant === "checklist"
                ? "text-sm font-medium text-[var(--ink)]"
                : "text-base font-semibold text-[var(--ink)]"
            }
          >
            Profile picture
          </legend>
        )}
        <AddPictureOnProfile />
      </fieldset>
    );
  }

  if (variant === "checklist") {
    return (
      <fieldset>
        {hideLegend ? null : (
          <legend className="text-sm font-medium text-[var(--ink)]">
            Profile picture
          </legend>
        )}
        {hideLegend ? null : (
          <p className="mt-0.5 text-sm leading-snug text-[var(--muted)]">
            The picture stays on your profile. This only chooses whether the
            page shows it.
          </p>
        )}

        <div className={`${hideLegend ? "" : "mt-2 "}flex items-center gap-2.5`}>
            {showProfilePicture ? (
              thumbnailUrl ? (
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
            <div className="grid flex-1 gap-1.5 sm:grid-cols-2">
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

      </fieldset>
    );
  }

  const hideThumbnail = hasProfilePicture && !showProfilePicture;

  return (
    <fieldset className={ADMIN_FIELDSET_CLASS}>
      <legend className="text-base font-semibold text-[var(--ink)]">
        Profile picture
      </legend>
      <p className="mt-0.5 mb-2 text-sm text-[var(--muted)]">
        Show your profile picture on this application?
      </p>

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

      <div className="flex items-center gap-3">
        {hideThumbnail ? null : thumbnailUrl ? (
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
      </div>
    </fieldset>
  );
}
