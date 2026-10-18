"use client";

import {
  ADMIN_PANEL_CLASS,
  ADMIN_TIP_CLASS,
} from "@/components/admin/admin-chrome";
import { AvatarIcon } from "@/components/admin/icons";
import PublicIdAccountField from "@/components/admin/PublicIdAccountField";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import type { Profile } from "@/lib/types/profile";
import {
  PROFILE_LOCATION_MAX_LENGTH,
  PROFILE_NAME_MAX_LENGTH,
  PROFILE_URL_MAX_LENGTH,
} from "@/lib/types/profile";
import { cacheBustProfilePictureUrl } from "@/lib/utils/profile-picture-storage";
import { notifyOnboardingChecklistChanged } from "@/lib/utils/onboarding-checklist-sync";
import { uploadProfilePictureFile } from "@/lib/utils/upload-profile-picture-client";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

export type ProfileFormAccountChrome = {
  email: string | null;
  memberSince: string | null;
  publicId: string | null;
};

interface ProfileFormProps {
  initialData: Profile | null;
  /**
   * True when a profiles row already exists in the DB.
   * When false (rare: signup insert failed), Save stays enabled so PUT can create the row.
   */
  hasExistingProfile: boolean;
  /**
   * Account settings layout: one place for avatar preview + Change/Remove,
   * plus identity / public id chrome around the details fields.
   */
  accountChrome?: ProfileFormAccountChrome;
}

function normalizeText(value: string | null | undefined): string {
  return (value ?? "").trim();
}

export default function ProfileForm({
  initialData,
  hasExistingProfile,
  accountChrome,
}: ProfileFormProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [submitPhase, setSubmitPhase] = useState<"idle" | "uploading" | "saving">(
    "idle",
  );
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    first_name: initialData?.first_name ?? "",
    last_name: initialData?.last_name ?? "",
    location: initialData?.location ?? "",
    portfolio_url: initialData?.portfolio_url ?? "",
    linkedin_url: initialData?.linkedin_url ?? "",
  });
  /** File chosen locally; uploaded only on Save. */
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [previewObjectUrl, setPreviewObjectUrl] = useState<string | null>(null);
  /** True when user cleared the picture (will send null on Save). */
  const [pictureRemoved, setPictureRemoved] = useState(false);
  /** After save, prefer response URL until router.refresh updates initialData. */
  const [savedUrlOverride, setSavedUrlOverride] = useState<
    string | null | undefined
  >(undefined);
  const [pictureCacheKey, setPictureCacheKey] = useState(
    initialData?.updated_at ?? "",
  );

  const savedPictureUrl =
    savedUrlOverride !== undefined
      ? savedUrlOverride
      : initialData?.profile_picture_url?.trim() || null;

  useEffect(() => {
    if (savedUrlOverride === undefined && initialData?.updated_at) {
      setPictureCacheKey(initialData.updated_at);
    }
  }, [initialData?.updated_at, savedUrlOverride]);

  useEffect(() => {
    if (!pendingFile) {
      setPreviewObjectUrl(null);
      return;
    }
    const url = URL.createObjectURL(pendingFile);
    setPreviewObjectUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [pendingFile]);

  const rawDisplayUrl = pictureRemoved
    ? null
    : (previewObjectUrl ?? savedPictureUrl);
  const displayPictureUrl = previewObjectUrl
    ? previewObjectUrl
    : cacheBustProfilePictureUrl(rawDisplayUrl, pictureCacheKey);
  const hasProfilePicture = Boolean(displayPictureUrl);

  const hadProfilePictureOnLoad = Boolean(savedPictureUrl);

  const firstName = normalizeText(formData.first_name);
  const lastName = normalizeText(formData.last_name);
  const namesValid = Boolean(firstName && lastName);

  const pictureDirty = Boolean(pendingFile) || pictureRemoved;

  const isDirty =
    !hasExistingProfile ||
    firstName !== normalizeText(initialData?.first_name) ||
    lastName !== normalizeText(initialData?.last_name) ||
    normalizeText(formData.location) !==
      normalizeText(initialData?.location) ||
    normalizeText(formData.portfolio_url) !==
      normalizeText(initialData?.portfolio_url) ||
    normalizeText(formData.linkedin_url) !==
      normalizeText(initialData?.linkedin_url) ||
    pictureDirty;

  const loading = submitPhase !== "idle";
  const saveLoadingLabel =
    submitPhase === "uploading" ? "Uploading…" : "Saving…";

  const canSave = namesValid && isDirty && !loading;

  const disabledReason = (() => {
    if (canSave || loading) return null;
    if (!namesValid) return "First name and last name are required.";
    if (!isDirty) return "No changes to save.";
    return null;
  })();

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
    setPictureRemoved(false);
    setPendingFile(file);
  };

  const handleRemovePicture = () => {
    setPendingFile(null);
    setPictureRemoved(true);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!canSave) return;
    setError(null);
    setSubmitPhase(pendingFile ? "uploading" : "saving");
    try {
      let profilePictureUrl: string | null | undefined = undefined;
      if (pictureRemoved && !pendingFile) {
        profilePictureUrl = null;
      } else if (pendingFile) {
        const upload = await uploadProfilePictureFile(pendingFile);
        if (!upload.ok) {
          setError(upload.error);
          return;
        }
        profilePictureUrl = upload.url;
        if (upload.warning) {
          setError(upload.warning);
        }
        setSubmitPhase("saving");
      }

      const body: Record<string, string | null> = {
        first_name: firstName || null,
        last_name: lastName || null,
        location: normalizeText(formData.location) || null,
        portfolio_url: normalizeText(formData.portfolio_url) || null,
        linkedin_url: normalizeText(formData.linkedin_url) || null,
      };
      if (profilePictureUrl !== undefined) {
        body.profile_picture_url = profilePictureUrl;
      }

      const response = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const json = await response.json();
      if (!response.ok) {
        setError(json.error ?? "Failed to save profile");
        return;
      }
      if (Array.isArray(json.warnings) && json.warnings.length > 0) {
        const warningText = json.warnings.join(" ");
        setError((prev) =>
          prev ? `${prev} ${warningText}` : warningText,
        );
      }
      if (profilePictureUrl !== undefined) {
        setSavedUrlOverride(profilePictureUrl);
        setPictureCacheKey(
          typeof json.data?.updated_at === "string"
            ? json.data.updated_at
            : String(Date.now()),
        );
      }
      setPendingFile(null);
      setPictureRemoved(false);
      notifyOnboardingChecklistChanged();
      router.refresh();
    } catch {
      setError("Failed to save profile");
    } finally {
      setSubmitPhase("idle");
    }
  };

  const displayName =
    [firstName, lastName].filter(Boolean).join(" ") || "Your profile";
  const initials =
    `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase() ||
    (accountChrome?.email?.charAt(0).toUpperCase() ?? "?");

  const fileInput = (
    <input
      ref={fileInputRef}
      type="file"
      accept={ALLOWED_IMAGE_TYPES.join(",")}
      className="hidden"
      onChange={handleFileChange}
    />
  );

  const pictureActions = hasProfilePicture ? (
    <div className="flex flex-wrap gap-2">
      {fileInput}
      <Button
        type="button"
        variant="secondary"
        disabled={loading}
        onClick={() => fileInputRef.current?.click()}
      >
        Change
      </Button>
      <Button
        type="button"
        variant="secondary"
        disabled={loading}
        onClick={handleRemovePicture}
      >
        Remove
      </Button>
    </div>
  ) : (
    <div>
      {fileInput}
      <Button
        type="button"
        variant="secondary"
        disabled={loading}
        onClick={() => fileInputRef.current?.click()}
      >
        Choose picture
      </Button>
    </div>
  );

  const pictureHelp = (
    <>
      <p className="text-sm text-[var(--muted)]">
        One picture per account. The file is uploaded when you save. You can
        choose whether to show it on each application when creating or editing.
      </p>
      {submitPhase === "uploading" && (
        <p className="text-sm text-[var(--muted)]" role="status">
          Uploading…
        </p>
      )}
      {hadProfilePictureOnLoad && (
        <p className="text-sm text-[var(--muted)]">
          When you change your profile picture and save, applications that show
          your picture will use the new image automatically.
        </p>
      )}
    </>
  );

  const detailsFields = (
    <>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Input
          label="First name"
          type="text"
          value={formData.first_name}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, first_name: e.target.value }))
          }
          placeholder="Your first name"
          required
          maxLength={PROFILE_NAME_MAX_LENGTH}
        />
        <Input
          label="Last name"
          type="text"
          value={formData.last_name}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, last_name: e.target.value }))
          }
          placeholder="Your last name"
          required
          maxLength={PROFILE_NAME_MAX_LENGTH}
        />
      </div>
      <Input
        label="Location"
        type="text"
        value={formData.location}
        onChange={(e) =>
          setFormData((prev) => ({ ...prev, location: e.target.value }))
        }
        placeholder="e.g. London, UK"
        maxLength={PROFILE_LOCATION_MAX_LENGTH}
      />
      <Input
        label="Portfolio URL"
        type="url"
        value={formData.portfolio_url}
        onChange={(e) =>
          setFormData((prev) => ({ ...prev, portfolio_url: e.target.value }))
        }
        placeholder="https://..."
        maxLength={PROFILE_URL_MAX_LENGTH}
      />
      <Input
        label="LinkedIn URL"
        type="url"
        value={formData.linkedin_url}
        onChange={(e) =>
          setFormData((prev) => ({ ...prev, linkedin_url: e.target.value }))
        }
        placeholder="https://linkedin.com/in/..."
        maxLength={PROFILE_URL_MAX_LENGTH}
      />
    </>
  );

  const saveButton = (
    <div
      className="group relative inline-flex"
      title={disabledReason ?? undefined}
    >
      <Button
        type="submit"
        variant="primary"
        loading={loading}
        loadingLabel={saveLoadingLabel}
        disabled={!canSave}
        aria-describedby={
          disabledReason ? "save-profile-disabled-reason" : undefined
        }
      >
        Save profile
      </Button>
      {disabledReason && (
        <span
          id="save-profile-disabled-reason"
          role="tooltip"
          className="pointer-events-none absolute bottom-full left-0 z-10 mb-2 hidden max-w-xs rounded-md bg-[var(--ink)] px-2.5 py-1.5 text-xs text-[var(--white)] shadow-lg group-hover:block group-focus-within:block"
        >
          {disabledReason}
        </span>
      )}
    </div>
  );

  const errorAlert = error ? (
    <p
      className="rounded-xl border border-[var(--status-danger-fg)]/20 bg-[var(--status-danger-bg)] p-3 text-sm text-[var(--status-danger-fg)]"
      role="alert"
    >
      {error}
    </p>
  ) : null;

  if (accountChrome) {
    return (
      <form onSubmit={handleSubmit}>
        <section
          className={`${ADMIN_PANEL_CLASS} overflow-hidden`}
          aria-labelledby="profile-identity-heading"
        >
          <div className="border-b border-[var(--ink)]/8 bg-[var(--ink)]/[0.02] px-5 py-5 sm:px-6 sm:py-6">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:gap-6">
              <div className="flex shrink-0 flex-col items-start gap-3">
                <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-full bg-[var(--lime)] text-[var(--ink)] sm:h-[5.5rem] sm:w-[5.5rem]">
                  {hasProfilePicture ? (
                    // eslint-disable-next-line @next/next/no-img-element -- local preview or Storage URL; cache-busted when saved
                    <img
                      src={displayPictureUrl!}
                      alt=""
                      className="h-full w-full object-cover"
                      width={88}
                      height={88}
                    />
                  ) : firstName || lastName ? (
                    <span
                      className="font-heading text-2xl font-semibold tracking-[-0.02em]"
                      aria-hidden
                    >
                      {initials}
                    </span>
                  ) : (
                    <AvatarIcon className="h-9 w-9" />
                  )}
                </div>
                {pictureActions}
              </div>
              <div className="min-w-0 flex-1 space-y-2">
                <h2
                  id="profile-identity-heading"
                  className="font-heading text-xl font-semibold tracking-[-0.02em] text-[var(--ink)] sm:text-2xl"
                >
                  {displayName}
                </h2>
                <p className="truncate text-sm text-[var(--muted)]">
                  {accountChrome.email ?? "—"}
                </p>
                {accountChrome.memberSince ? (
                  <p className="inline-flex rounded-full bg-[var(--white)] px-2.5 py-1 text-xs font-medium text-[var(--muted)] ring-1 ring-[var(--ink)]/10">
                    Member since {accountChrome.memberSince}
                  </p>
                ) : null}
                <div className="space-y-1.5 pt-1">{pictureHelp}</div>
              </div>
            </div>
          </div>

          <div className="space-y-6 px-5 py-5 sm:px-6 sm:py-6">
            {errorAlert}

            <div>
              <h3 className="font-heading text-sm font-semibold tracking-[-0.01em] text-[var(--ink)]">
                Account
              </h3>
              <dl className="mt-3 divide-y divide-[var(--ink)]/8">
                <div className="flex flex-col gap-0.5 py-3 first:pt-0 sm:flex-row sm:gap-6">
                  <dt className="shrink-0 text-sm font-medium text-[var(--muted)] sm:w-36">
                    Email
                  </dt>
                  <dd className="min-w-0 text-sm text-[var(--ink)]">
                    {accountChrome.email ?? "—"}
                  </dd>
                </div>
                <div className="py-3 last:pb-0">
                  <PublicIdAccountField publicId={accountChrome.publicId} />
                </div>
              </dl>
            </div>

            <div className="border-t border-[var(--ink)]/8 pt-5">
              <h3 className="font-heading text-base font-semibold tracking-[-0.02em] text-[var(--ink)]">
                Profile details
              </h3>
              <p className="mt-1 text-sm text-[var(--muted)]">
                This info is used when you create or update applications so
                recruiters see your name and links.
              </p>
              {!hasExistingProfile && (
                <p className={`mt-3 ${ADMIN_TIP_CLASS}`}>
                  Your name is prefilled from signup. Save your profile to
                  finish creating your profile record (location, links, and
                  picture).
                </p>
              )}
              <div className="mt-5 space-y-4">{detailsFields}</div>
            </div>

            {saveButton}
          </div>
        </section>
      </form>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {errorAlert}
      {detailsFields}

      <fieldset className="rounded-xl border border-[var(--ink)]/10 bg-[var(--white)] p-4">
        <legend className="px-1 text-base font-semibold text-[var(--ink)]">
          Profile picture
        </legend>
        <div className="mt-0.5 mb-3 space-y-1.5">{pictureHelp}</div>
        {hasProfilePicture ? (
          <div className="flex flex-wrap items-center gap-4">
            <div className="h-20 w-20 shrink-0 overflow-hidden rounded-full bg-[var(--ink)]/10 ring-2 ring-[var(--ink)]/10">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={displayPictureUrl!}
                alt=""
                className="h-full w-full object-cover"
                width={80}
                height={80}
              />
            </div>
            {pictureActions}
          </div>
        ) : (
          pictureActions
        )}
      </fieldset>

      {saveButton}
    </form>
  );
}
