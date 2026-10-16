"use client";

import { ApplicationStatusIconBadge } from "@/components/admin/ApplicationStatusIcon";
import { publicIdFromUserMetadata } from "@/lib/auth/ensure-public-id";
import { createClient } from "@/lib/supabase/client";
import {
  DEFAULT_STATUS_INDICATOR_STYLE,
  normalizeProfilePublicIdForPrefs,
  readStatusIndicatorStyle,
  resolveStatusIndicatorAccountKey,
  writeStatusIndicatorStyle,
  type StatusIndicatorStyle,
} from "@/lib/utils/status-indicator-preference";
import { useEffect, useId, useState } from "react";

const PREVIEW_VISUALS = [
  "draft",
  "active_unviewed",
  "active_viewed",
  "archived",
] as const;

const OPTIONS: {
  value: StatusIndicatorStyle;
  title: string;
  description: string;
}[] = [
  {
    value: "colorful",
    title: "Colorful dots",
    description:
      "Bright gold, sky, lime, and grey dots. Default look; lower contrast on white.",
  },
  {
    value: "high_contrast",
    title: "High contrast icons",
    description:
      "Soft tinted badges with distinct ink icons. Easier to tell apart; meets stronger contrast guidance.",
  },
];

type StatusIndicatorPreferenceProps = {
  /** Profile public_id when known (avoids an extra client fetch for account key). */
  publicId?: string | null;
};

/**
 * Account settings → Preferences control for dashboard status marker style
 * (browser-local preference).
 */
export default function StatusIndicatorPreference({
  publicId = null,
}: StatusIndicatorPreferenceProps) {
  const groupId = useId();
  const [accountKey, setAccountKey] = useState<string | null>(null);
  const [style, setStyle] = useState<StatusIndicatorStyle>(
    DEFAULT_STATUS_INDICATOR_STYLE,
  );
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setAccountKey(null);
    setReady(false);
    setStyle(DEFAULT_STATUS_INDICATOR_STYLE);

    async function hydrate() {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (cancelled || !user) {
        if (!cancelled) setReady(true);
        return;
      }
      const key = resolveStatusIndicatorAccountKey({
        profilePublicId: normalizeProfilePublicIdForPrefs(publicId),
        metadataPublicId: publicIdFromUserMetadata(user),
        authUserId: user.id,
      });
      if (cancelled) return;
      if (!key) {
        setReady(true);
        return;
      }
      setAccountKey(key);
      setStyle(readStatusIndicatorStyle(key));
      setReady(true);
    }
    void hydrate();
    return () => {
      cancelled = true;
    };
  }, [publicId]);

  const select = (next: StatusIndicatorStyle) => {
    setStyle(next);
    if (accountKey) {
      writeStatusIndicatorStyle(accountKey, next);
    }
  };

  return (
    <fieldset className="space-y-4" disabled={!ready || !accountKey}>
      <legend className="font-heading text-base font-semibold tracking-[-0.02em] text-[var(--ink)]">
        Status indicators
      </legend>
      <p className="text-sm text-[var(--muted)]">
        Choose how application status appears on your dashboard. Saved in this
        browser for your account.
      </p>

      <div className="space-y-3" role="radiogroup" aria-labelledby={groupId}>
        <span id={groupId} className="sr-only">
          Status indicator style
        </span>
        {OPTIONS.map((option) => {
          const selected = style === option.value;
          return (
            <label
              key={option.value}
              className={`flex cursor-pointer flex-col gap-3 rounded-2xl border px-4 py-3 transition-colors sm:flex-row sm:items-center sm:justify-between ${
                selected
                  ? "border-[var(--ink)] bg-[var(--ink)]/[0.03]"
                  : "border-[var(--ink)]/12 bg-[var(--white)] hover:border-[var(--ink)]/25"
              }`}
            >
              <span className="flex min-w-0 items-start gap-3">
                <input
                  type="radio"
                  name="status-indicator-style"
                  value={option.value}
                  checked={selected}
                  onChange={() => select(option.value)}
                  className="mt-1 h-4 w-4 shrink-0 accent-[var(--ink)]"
                />
                <span className="min-w-0">
                  <span className="block text-sm font-semibold text-[var(--ink)]">
                    {option.title}
                  </span>
                  <span className="mt-0.5 block text-sm text-[var(--muted)]">
                    {option.description}
                  </span>
                </span>
              </span>
              <span
                className="flex items-center gap-1 sm:shrink-0"
                aria-hidden
              >
                {PREVIEW_VISUALS.map((visual) => (
                  <ApplicationStatusIconBadge
                    key={`${option.value}-${visual}`}
                    visual={visual}
                    decorative
                    style={option.value}
                  />
                ))}
              </span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
