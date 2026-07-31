"use client";

import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import type { Profile } from "@/lib/types/profile";
import {
  PROFILE_LOCATION_MAX_LENGTH,
  PROFILE_NAME_MAX_LENGTH,
  PROFILE_URL_MAX_LENGTH,
} from "@/lib/types/profile";
import { cacheBustProfilePictureUrl } from "@/lib/utils/profile-picture-storage";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

interface ProfileFormProps {
  initialData: Profile | null;
  /**
   * True when a profiles row already exists in the DB.
   * When false (rare: signup insert failed), Save stays enabled so PUT can create the row.
   */
  hasExistingProfile: boolean;
}

function normalizeText(value: string | null | undefined): string {
  return (value ?? "").trim();
}

export default function ProfileForm({
  initialData,
  hasExistingProfile,
}: ProfileFormProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
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
    setLoading(true);
    try {
      let profilePictureUrl: string | null | undefined = undefined;
      if (pictureRemoved && !pendingFile) {
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
        profilePictureUrl = uploadJson.url ?? null;
        if (!profilePictureUrl) {
          setError("Upload failed");
          return;
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
      if (Array.isArray(json.warnings) && json.warnings.length > 0) {
        setError(json.warnings.join(" "));
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
      router.refresh();
    } catch {
      setError("Failed to save profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <p
          className="rounded-md bg-red-50 p-3 text-sm text-red-700"
          role="alert"
        >
          {error}
        </p>
      )}
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

      <fieldset className="rounded-lg border border-[var(--foreground)]/10 bg-[var(--background)] p-4">
        <legend className="px-1 text-base font-semibold text-[var(--foreground)]">
          Profile picture
        </legend>
        <p className="mt-0.5 mb-3 text-sm text-[var(--foreground)]/80">
          One picture per account. The file is uploaded when you save. You can
          choose whether to show it on each application when creating or
          editing.
        </p>
        {hadProfilePictureOnLoad && (
          <p className="mb-3 text-sm text-[var(--foreground)]/80">
            When you change your profile picture and save, applications that
            show your picture will use the new image automatically.
          </p>
        )}
        {hasProfilePicture ? (
          <div className="flex flex-wrap items-center gap-4">
            <div className="h-20 w-20 shrink-0 overflow-hidden rounded-full bg-[var(--foreground)]/10 ring-2 ring-[var(--foreground)]/10">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={displayPictureUrl!}
                alt=""
                className="h-full w-full object-cover"
                width={80}
                height={80}
              />
            </div>
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
          </div>
        ) : (
          <div>
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
              Choose picture
            </Button>
          </div>
        )}
      </fieldset>

      <div
        className="group relative inline-flex"
        title={disabledReason ?? undefined}
      >
        <Button
          type="submit"
          variant="primary"
          loading={loading}
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
            className="pointer-events-none absolute bottom-full left-0 z-10 mb-2 hidden max-w-xs rounded-md bg-[var(--foreground)] px-2.5 py-1.5 text-xs text-[var(--background)] shadow-lg group-hover:block group-focus-within:block"
          >
            {disabledReason}
          </span>
        )}
      </div>
    </form>
  );
}
