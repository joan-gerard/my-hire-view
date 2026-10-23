"use client";

import {
    ADMIN_PANEL_CLASS,
    ADMIN_TIP_CLASS,
} from "@/components/admin/admin-chrome";
import { AvatarIcon } from "@/components/admin/icons";
import PublicIdAccountField from "@/components/admin/PublicIdAccountField";
import ProfilePictureIconActions from "@/components/forms/ProfilePictureIconActions";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import type { Profile } from "@/lib/types/profile";
import {
    PROFILE_LOCATION_MAX_LENGTH,
    PROFILE_NAME_MAX_LENGTH,
    PROFILE_URL_MAX_LENGTH,
} from "@/lib/types/profile";
import { notifyOnboardingChecklistChanged } from "@/lib/utils/onboarding-checklist-sync";
import { cacheBustProfilePictureUrl } from "@/lib/utils/profile-picture-storage";
import { mapProfileSaveWarnings } from "@/lib/utils/upload-form-messages";
import { uploadProfilePictureFile } from "@/lib/utils/upload-profile-picture-client";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { FiAlertTriangle } from "react-icons/fi";

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
   * Account settings chrome: identity header (picture + camera / remove icon actions),
   * email / public id, and profile details fields.
   */
  accountChrome: ProfileFormAccountChrome;
}

function normalizeText(value: string | null | undefined): string {
  return (value ?? "").trim();
}

/**
 * Account settings → Profile tab form. Picture preview and camera / remove icon actions live
 * only in the identity header (uploaded on Save).
 */
export default function ProfileForm({
  initialData,
  hasExistingProfile,
  accountChrome,
}: ProfileFormProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [submitPhase, setSubmitPhase] = useState<
    "idle" | "uploading" | "saving"
  >("idle");
  const [error, setError] = useState<string | null>(null);
  const [warning, setWarning] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    first_name: initialData?.first_name ?? "",
    last_name: initialData?.last_name ?? "",
    location: initialData?.location ?? "",
    portfolio_url: initialData?.portfolio_url ?? "",
    linkedin_url: initialData?.linkedin_url ?? "",
  });
  /** File chosen locally; uploaded only on Save. */
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  /**
   * URL from a successful upload kept across Save retries so a failed PUT
   * does not orphan another UUID object on each attempt.
   */
  const [uploadedPendingUrl, setUploadedPendingUrl] = useState<string | null>(
    null,
  );
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
    normalizeText(formData.location) !== normalizeText(initialData?.location) ||
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
      setWarning(null);
      setError("Please choose a JPEG, PNG or WebP image.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setWarning(null);
      setError("Image must be 5 MB or smaller.");
      return;
    }
    setError(null);
    setWarning(null);
    setPictureRemoved(false);
    setUploadedPendingUrl(null);
    setPendingFile(file);
  };

  const handleDiscardNewPicture = () => {
    setPendingFile(null);
    setUploadedPendingUrl(null);
    setError(null);
    setWarning(null);
  };

  const handleRemovePicture = () => {
    setPendingFile(null);
    setUploadedPendingUrl(null);
    setPictureRemoved(true);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!canSave) return;
    setError(null);
    setWarning(null);
    const needsUpload = Boolean(pendingFile) && !uploadedPendingUrl;
    setSubmitPhase(needsUpload ? "uploading" : "saving");
    try {
      let profilePictureUrl: string | null | undefined = undefined;
      let uploadWarning: string | undefined;
      if (pictureRemoved && !pendingFile) {
        profilePictureUrl = null;
      } else if (pendingFile) {
        if (uploadedPendingUrl) {
          profilePictureUrl = uploadedPendingUrl;
        } else {
          const upload = await uploadProfilePictureFile(pendingFile);
          if (!upload.ok) {
            setError(upload.error);
            return;
          }
          profilePictureUrl = upload.url;
          setUploadedPendingUrl(upload.url);
          uploadWarning = upload.warning;
          setSubmitPhase("saving");
        }
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
      const putWarnings = Array.isArray(json.warnings)
        ? (json.warnings as unknown[]).filter(
            (w): w is string => typeof w === "string" && Boolean(w.trim()),
          )
        : [];
      const notice = mapProfileSaveWarnings([uploadWarning, ...putWarnings]);
      if (notice) {
        setWarning(notice);
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
      setUploadedPendingUrl(null);
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
    (accountChrome.email?.charAt(0).toUpperCase() ?? "?");

  return (
    <form onSubmit={handleSubmit}>
      <section
        className={`${ADMIN_PANEL_CLASS} overflow-hidden`}
        aria-labelledby="profile-identity-heading"
      >
        <div className="border-b border-[var(--ink)]/8 bg-[var(--ink)]/[0.02] px-5 py-5 sm:px-6 sm:py-6">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:gap-6">
            <div className="flex shrink-0 flex-col items-start gap-3">
              <div className="flex flex-col items-start gap-1.5">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept={ALLOWED_IMAGE_TYPES.join(",")}
                  className="hidden"
                  onChange={handleFileChange}
                />
                <ProfilePictureIconActions
                  size="sm"
                  disabled={loading}
                  chooseLabel={
                    hasProfilePicture ? "Change picture" : "Choose picture"
                  }
                  onChooseOrChange={() => fileInputRef.current?.click()}
                  onRemove={
                    pendingFile
                      ? handleDiscardNewPicture
                      : hasProfilePicture
                        ? handleRemovePicture
                        : undefined
                  }
                  removeLabel={
                    pendingFile ? "Discard new picture" : "Remove picture"
                  }
                >
                  <div className="flex h-36 w-36 items-center justify-center overflow-hidden rounded-full bg-[var(--lime)] text-[var(--ink)] sm:h-40 sm:w-40">
                    {hasProfilePicture ? (
                      // eslint-disable-next-line @next/next/no-img-element -- local preview or Storage URL; cache-busted when saved
                      <img
                        src={displayPictureUrl!}
                        alt={
                          pendingFile
                            ? "New profile picture preview"
                            : "Your profile picture"
                        }
                        className="h-full w-full object-cover"
                        width={160}
                        height={160}
                      />
                    ) : firstName || lastName || accountChrome.email ? (
                      <span
                        className="font-heading text-4xl font-semibold tracking-[-0.02em] sm:text-5xl"
                        aria-hidden
                      >
                        {initials}
                      </span>
                    ) : (
                      <AvatarIcon className="h-14 w-14 sm:h-16 sm:w-16" />
                    )}
                  </div>
                </ProfilePictureIconActions>
                {pendingFile ? (
                  <p
                    className="text-xs font-semibold text-[var(--ink)]"
                    role="status"
                  >
                    Not saved yet
                  </p>
                ) : null}
                {pictureRemoved ? (
                  <p className="max-w-[9rem] text-xs font-semibold text-[var(--ink)]">
                    Will be removed when you save
                  </p>
                ) : null}
              </div>
              <p className="text-xs text-[var(--muted)]">
                JPEG, PNG or WebP, up to 5 MB.
              </p>
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
              <div className="space-y-1.5 pt-1">
                <p className="text-sm text-[var(--muted)]">
                  One picture per account. The file is uploaded when you save.
                  You can choose whether to show it on each application when
                  creating or editing.
                </p>
                {submitPhase === "uploading" && (
                  <p className="text-sm text-[var(--muted)]" role="status">
                    Uploading…
                  </p>
                )}
                {hadProfilePictureOnLoad && (
                  <p className="text-sm text-[var(--muted)]">
                    When you change your profile picture and save, applications
                    that show your picture will use the new image automatically.
                    If you remove it, those applications show a Picture missing
                    warning on the dashboard until you add a picture again or
                    turn show-picture off when editing.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6 px-5 py-5 sm:px-6 sm:py-6">
          {warning ? (
            <p
              className="flex items-start gap-2 rounded-xl border border-[var(--ink)]/12 bg-[var(--status-wash-notice)] p-3 text-sm text-[var(--ink)]"
              role="status"
            >
              <FiAlertTriangle className="mt-0.5 size-4 shrink-0" aria-hidden />
              <span>{warning}</span>
            </p>
          ) : null}
          {error ? (
            <p
              className="rounded-xl border border-[var(--status-danger-fg)]/20 bg-[var(--status-danger-bg)] p-3 text-sm text-[var(--status-danger-fg)]"
              role="alert"
            >
              {error}
            </p>
          ) : null}

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
              <PublicIdAccountField publicId={accountChrome.publicId} />
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
                Your name is prefilled from signup. Save your profile to finish
                creating your profile record (location, links, and picture).
              </p>
            )}
            <div className="mt-5 space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Input
                  label="First name"
                  type="text"
                  value={formData.first_name}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      first_name: e.target.value,
                    }))
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
                    setFormData((prev) => ({
                      ...prev,
                      last_name: e.target.value,
                    }))
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
                  setFormData((prev) => ({
                    ...prev,
                    location: e.target.value,
                  }))
                }
                placeholder="e.g. London, UK"
                maxLength={PROFILE_LOCATION_MAX_LENGTH}
              />
              <Input
                label="Portfolio URL"
                type="url"
                value={formData.portfolio_url}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    portfolio_url: e.target.value,
                  }))
                }
                placeholder="https://..."
                maxLength={PROFILE_URL_MAX_LENGTH}
              />
              <Input
                label="LinkedIn URL"
                type="url"
                value={formData.linkedin_url}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    linkedin_url: e.target.value,
                  }))
                }
                placeholder="https://linkedin.com/in/..."
                maxLength={PROFILE_URL_MAX_LENGTH}
              />
            </div>
          </div>

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
              className="min-h-11"
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
        </div>
      </section>
    </form>
  );
}
