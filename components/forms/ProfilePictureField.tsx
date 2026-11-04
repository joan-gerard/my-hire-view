"use client";

import { ADMIN_FIELDSET_CLASS } from "@/components/admin/admin-chrome";
import { AvatarIcon } from "@/components/admin/icons";
import {
  FieldLabelTip,
  PROFILE_EMPTY_TIP,
  PROFILE_INITIAL_DATA_TIP,
} from "@/components/forms/ApplicationFormSinglePageLayout";
import Switch from "@/components/ui/Switch";
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
   * `checklist` matches the dense one-page create row.
   * `default` keeps the edit/wizard fieldset chrome.
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

const profileLinkClass =
  "rounded-sm text-sm font-medium text-[var(--ink)] underline decoration-[var(--ink)]/30 underline-offset-4 outline-none hover:decoration-[var(--ink)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ink)]";

function AddPictureOnProfile() {
  return (
    <p className="text-sm text-[var(--muted)]">
      <Link href="/admin/profile" className={profileLinkClass}>
        Add a picture on your profile
      </Link>
    </p>
  );
}

function AvatarPreview({
  thumbnailUrl,
  initials,
  hasInitials,
  dimmed,
  inkInitials,
}: {
  thumbnailUrl: string | null;
  initials: string;
  hasInitials: boolean;
  dimmed: boolean;
  /** Dense create row uses ink initials; edit uses the lime disc. */
  inkInitials: boolean;
}) {
  if (thumbnailUrl) {
    return (
      <div
        className={`size-24 shrink-0 overflow-hidden rounded-full bg-[var(--ink)]/10 ring-1 ring-[var(--ink)]/10 transition-opacity ${
          dimmed ? "opacity-40" : "opacity-100"
        }`}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={thumbnailUrl}
          alt="Your profile picture"
          className="h-full w-full object-cover"
          width={96}
          height={96}
        />
      </div>
    );
  }

  return (
    <span
      className={`flex size-24 shrink-0 items-center justify-center rounded-full ${
        inkInitials
          ? "bg-[var(--ink)] text-[var(--white)]"
          : "bg-[var(--lime)] text-[var(--ink)]"
      }`}
      aria-hidden
    >
      {hasInitials ? (
        <span className="font-heading text-2xl font-semibold tracking-[-0.02em]">
          {initials}
        </span>
      ) : (
        <AvatarIcon className="h-10 w-10" />
      )}
    </span>
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
  const isChecklist = variant === "checklist";

  return (
    <fieldset className={isChecklist ? undefined : ADMIN_FIELDSET_CLASS}>
      {hideLegend ? null : (
        <legend
          className={
            isChecklist
              ? "text-sm font-medium leading-[18px] text-[var(--ink)]"
              : "text-base font-semibold leading-[18px] text-[var(--ink)]"
          }
        >
          Profile picture
          <FieldLabelTip
            tip={
              hasProfilePicture ? PROFILE_INITIAL_DATA_TIP : PROFILE_EMPTY_TIP
            }
            tone={hasProfilePicture ? "ready" : "idle"}
          />
        </legend>
      )}
      {hideLegend || !hasProfilePicture ? null : (
        <p
          className={`mt-0.5 text-sm leading-snug text-[var(--muted)] ${
            isChecklist ? "" : "mb-2"
          }`}
        >
          {isChecklist
            ? "The picture stays on your profile. This only chooses whether the page shows it."
            : "Show your profile picture on this application?"}
        </p>
      )}

      <div className={hideLegend && isChecklist ? "" : "mt-2"}>
        <AvatarPreview
          thumbnailUrl={hasProfilePicture ? thumbnailUrl : null}
          initials={initials}
          hasInitials={hasInitials}
          dimmed={hasProfilePicture && !showProfilePicture}
          inkInitials={isChecklist}
        />
      </div>

      {!hasProfilePicture ? (
        <div className="mt-2">
          <AddPictureOnProfile />
        </div>
      ) : (
        <div className="mt-2 flex justify-end">
          <Switch
            checked={showProfilePicture}
            onCheckedChange={onShowProfilePictureChange}
            aria-label="Show picture to recruiters"
          />
        </div>
      )}
    </fieldset>
  );
}
