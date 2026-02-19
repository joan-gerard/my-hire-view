"use client";

export interface ProfilePictureFieldProps {
  /** When true, user can choose Yes/No; when false, toggle is disabled with No. */
  hasProfilePicture: boolean;
  showProfilePicture: boolean;
  onShowProfilePictureChange: (show: boolean) => void;
}

export default function ProfilePictureField({
  hasProfilePicture,
  showProfilePicture,
  onShowProfilePictureChange,
}: ProfilePictureFieldProps) {
  return (
    <fieldset className="rounded-lg border border-[var(--foreground)]/10 bg-[var(--background)] p-4">
      <legend className="px-1 text-base font-semibold text-[var(--foreground)]">
        Profile picture
      </legend>
      <p className="mt-0.5 mb-3 text-sm text-[var(--foreground)]/80">
        {hasProfilePicture
          ? "Show your profile picture on this application?"
          : "Upload a profile picture in Profile to show it on applications!"}
      </p>
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
          <span className="text-base font-medium text-[var(--foreground)]">Yes</span>
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
          <span className="text-base font-medium text-[var(--foreground)]">No</span>
        </label>
      </div>
    </fieldset>
  );
}
