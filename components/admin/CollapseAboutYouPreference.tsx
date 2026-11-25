"use client";

import Switch from "@/components/ui/Switch";
import { useState } from "react";

type CollapseAboutYouPreferenceProps = {
  /** Current profile value; defaults to true when omitted. */
  initialCollapseAboutYou?: boolean;
};

/**
 * Account settings → Preferences: whether About you collapses on applications
 * after the first live app. Persisted on the profile row.
 */
export default function CollapseAboutYouPreference({
  initialCollapseAboutYou = true,
}: CollapseAboutYouPreferenceProps) {
  const [checked, setChecked] = useState(initialCollapseAboutYou !== false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const save = async (next: boolean) => {
    const previous = checked;
    setChecked(next);
    setError(null);
    setSaving(true);
    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ collapse_about_you: next }),
      });
      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as {
          error?: string;
        };
        setChecked(previous);
        setError(body.error || "Could not save preference. Try again.");
      }
    } catch {
      setChecked(previous);
      setError("Could not save preference. Try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <fieldset className="space-y-4" disabled={saving}>
      <legend className="font-heading text-base font-semibold tracking-[-0.02em] text-[var(--ink)]">
        About you on applications
      </legend>
      <p className="text-sm text-[var(--muted)]">
        Photo, name, email, phone, location, and links usually stay the same
        from role to role. After your first live application, About you can
        start as a one-line summary.
      </p>
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm text-[var(--ink)]">
          Collapse About you after your first live application
        </span>
        <Switch
          checked={checked}
          onCheckedChange={(next) => {
            void save(next);
          }}
          disabled={saving}
          aria-label="Collapse About you after your first live application"
        />
      </div>
      {error ? (
        <p className="text-sm text-[var(--status-danger-fg)]" role="alert">
          {error}
        </p>
      ) : null}
    </fieldset>
  );
}
