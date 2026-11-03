"use client";

import AdminModal from "@/components/admin/AdminModal";
import {
  ADMIN_PRIMARY_CLASS,
  ADMIN_SECONDARY_CLASS,
} from "@/components/admin/admin-chrome";
import Input from "@/components/ui/Input";
import type { Profile } from "@/lib/types/profile";
import { notifyOnboardingChecklistChanged } from "@/lib/utils/onboarding-checklist-sync";
import {
  formatProfileUpdateZodError,
  profileUpdateSchema,
} from "@/lib/validation/profile";
import { useEffect, useId, useState, type RefObject } from "react";

export type ProfileLinkField = "portfolio_url" | "linkedin_url";

/** Merge a link just saved on the profile into the in-memory profile. */
export function profileWithSavedLink(
  prev: Profile | null,
  field: ProfileLinkField,
  url: string,
  fallback?: Partial<Profile>,
): Profile {
  return {
    user_id: prev?.user_id ?? fallback?.user_id ?? "",
    public_id: prev?.public_id ?? fallback?.public_id,
    first_name: prev?.first_name ?? fallback?.first_name ?? null,
    last_name: prev?.last_name ?? fallback?.last_name ?? null,
    location: prev?.location ?? fallback?.location ?? null,
    portfolio_url:
      field === "portfolio_url"
        ? url
        : (prev?.portfolio_url ?? fallback?.portfolio_url ?? null),
    linkedin_url:
      field === "linkedin_url"
        ? url
        : (prev?.linkedin_url ?? fallback?.linkedin_url ?? null),
    profile_picture_url:
      prev?.profile_picture_url ?? fallback?.profile_picture_url ?? null,
    updated_at: prev?.updated_at ?? new Date().toISOString(),
  };
}

const COPY: Record<
  ProfileLinkField,
  { title: string; label: string; placeholder: string }
> = {
  portfolio_url: {
    title: "Add portfolio",
    label: "Portfolio URL",
    placeholder: "https://yoursite.com",
  },
  linkedin_url: {
    title: "Add LinkedIn",
    label: "LinkedIn URL",
    placeholder: "https://www.linkedin.com/in/…",
  },
};

export interface ProfileLinkDialogProps {
  open: boolean;
  field: ProfileLinkField | null;
  onClose: () => void;
  onSaved: (field: ProfileLinkField, url: string) => void;
  returnFocusRef?: RefObject<HTMLElement | null>;
}

/**
 * Adds a missing portfolio or LinkedIn URL without leaving the application form.
 * The value is written to the profile, which stays the source of truth.
 */
export default function ProfileLinkDialog({
  open,
  field,
  onClose,
  onSaved,
  returnFocusRef,
}: ProfileLinkDialogProps) {
  const inputId = useId();
  const [draft, setDraft] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const activeField = field ?? "portfolio_url";
  const copy = COPY[activeField];

  useEffect(() => {
    if (!open) return;
    setDraft("");
    setError(null);
    setSaving(false);
  }, [open, field]);

  const save = async () => {
    if (!field || saving) return;
    const parsed = profileUpdateSchema.safeParse({ [field]: draft });
    if (!parsed.success) {
      setError(formatProfileUpdateZodError(parsed.error));
      return;
    }
    const url = parsed.data[field];
    if (typeof url !== "string" || !url) {
      setError(`${copy.label}: Please enter a valid URL`);
      return;
    }

    setSaving(true);
    setError(null);
    try {
      const response = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ [field]: url }),
      });
      const json = (await response.json().catch(() => ({}))) as {
        error?: string;
      };
      if (!response.ok) {
        setError(json.error ?? "Could not save that link.");
        setSaving(false);
        return;
      }
      notifyOnboardingChecklistChanged();
      onSaved(field, url);
      onClose();
    } catch {
      setError("Could not save that link. Check your connection and try again.");
      setSaving(false);
    }
  };

  return (
    <AdminModal
      open={open}
      onClose={onClose}
      title={copy.title}
      description="Saved on your profile, then shown on this application."
      widthClassName="w-[min(100vw-2rem,28rem)]"
      returnFocusRef={returnFocusRef}
      dismissDisabled={saving}
      bodyClassName="px-5 py-4 sm:px-6"
      footer={
        <div className="flex gap-2">
          <button
            type="button"
            className={ADMIN_SECONDARY_CLASS}
            onClick={onClose}
            disabled={saving}
          >
            Cancel
          </button>
          <button
            type="button"
            className={ADMIN_PRIMARY_CLASS}
            onClick={() => void save()}
            disabled={saving}
          >
            {saving ? "Saving…" : "Save"}
          </button>
        </div>
      }
    >
      <div
        onKeyDown={(event) => {
          if (event.key !== "Enter") return;
          event.preventDefault();
          event.stopPropagation();
          void save();
        }}
      >
        <Input
          id={inputId}
          dense
          label={copy.label}
          type="url"
          inputMode="url"
          autoComplete="url"
          placeholder={copy.placeholder}
          value={draft}
          disabled={saving}
          error={error ?? undefined}
          onChange={(event) => {
            setDraft(event.target.value);
            if (error) setError(null);
          }}
        />
      </div>
    </AdminModal>
  );
}
