"use client";

import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import type { Profile } from "@/lib/types/profile";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";

const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

interface ProfileFormProps {
  initialData: Profile | null;
}

export default function ProfileForm({ initialData }: ProfileFormProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    first_name: initialData?.first_name ?? "",
    last_name: initialData?.last_name ?? "",
    location: initialData?.location ?? "",
    portfolio_url: initialData?.portfolio_url ?? "",
    linkedin_url: initialData?.linkedin_url ?? "",
    profile_picture_url:
      initialData?.profile_picture_url ?? (null as string | null),
  });

  const hasProfilePicture = Boolean(formData.profile_picture_url?.trim());

  /** True when the profile had a picture when the page loaded (from DB). Used to show the "new picture will sync to applications" message only then. */
  const hadProfilePictureOnLoad = Boolean(
    initialData?.profile_picture_url?.trim()
  );

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
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
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload/profile-picture", {
        method: "POST",
        body: fd,
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error ?? "Upload failed");
        return;
      }
      setFormData((prev) => ({
        ...prev,
        profile_picture_url: json.url ?? null,
      }));
    } catch {
      setError("Upload failed");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const handleRemovePicture = () => {
    setFormData((prev) => ({ ...prev, profile_picture_url: null }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const response = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          first_name: formData.first_name.trim() || null,
          last_name: formData.last_name.trim() || null,
          location: formData.location.trim() || null,
          portfolio_url: formData.portfolio_url.trim() || null,
          linkedin_url: formData.linkedin_url.trim() || null,
          profile_picture_url: formData.profile_picture_url?.trim() || null,
        }),
      });
      const json = await response.json();
      if (!response.ok) {
        setError(json.error ?? "Failed to save profile");
        return;
      }
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
      />
      <Input
        label="Portfolio URL"
        type="url"
        value={formData.portfolio_url}
        onChange={(e) =>
          setFormData((prev) => ({ ...prev, portfolio_url: e.target.value }))
        }
        placeholder="https://..."
      />
      <Input
        label="LinkedIn URL"
        type="url"
        value={formData.linkedin_url}
        onChange={(e) =>
          setFormData((prev) => ({ ...prev, linkedin_url: e.target.value }))
        }
        placeholder="https://linkedin.com/in/..."
      />

      <fieldset className="rounded-lg border border-[var(--foreground)]/10 bg-[var(--background)] p-4">
        <legend className="px-1 text-base font-semibold text-[var(--foreground)]">
          Profile picture
        </legend>
        <p className="mt-0.5 mb-3 text-sm text-[var(--foreground)]/80">
          One picture per account. You can choose whether to show it on each
          application when creating or editing.
        </p>
        {hadProfilePictureOnLoad && (
          <p className="mb-3 text-sm text-[var(--foreground)]/80">
            When you change your profile picture and save, the new picture will
            be shown on existing applications for which you have chosen &quot;Show
            your profile picture on this application?&quot;
          </p>
        )}
        {hasProfilePicture ? (
          <div className="flex flex-wrap items-center gap-4">
            <div className="h-20 w-20 shrink-0 overflow-hidden rounded-full bg-[var(--foreground)]/10 ring-2 ring-[var(--foreground)]/10">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={formData.profile_picture_url!}
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
                disabled={uploading}
                onClick={() => fileInputRef.current?.click()}
              >
                {uploading ? "Uploading…" : "Change"}
              </Button>
              <Button
                type="button"
                variant="secondary"
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
              disabled={uploading}
              onClick={() => fileInputRef.current?.click()}
            >
              {uploading ? "Uploading…" : "Upload picture"}
            </Button>
          </div>
        )}
      </fieldset>

      <Button type="submit" variant="primary" loading={loading}>
        Save profile
      </Button>
    </form>
  );
}
