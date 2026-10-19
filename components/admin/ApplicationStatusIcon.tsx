"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import type { ApplicationStatus } from "@/lib/types/application";
import {
  CV_MISSING_LEGEND,
  PROFILE_PICTURE_MISSING_LEGEND,
  getApplicationStatusDisplay,
  getApplicationStatusDisplayByKey,
  type ApplicationStatusVisualKey,
} from "@/lib/utils/application-status-display";
import type { StatusIndicatorStyle } from "@/lib/utils/status-indicator-preference";
import {
  ArchiveIcon,
  CheckIcon,
  ClockIcon,
  PencilIcon,
} from "@/components/admin/icons";
import { useStatusIndicatorStyle } from "@/hooks/useStatusIndicatorStyle";

type ApplicationStatusIconProps = {
  status: ApplicationStatus;
  viewCount: number;
  /** Override preference (e.g. profile preview). */
  style?: StatusIndicatorStyle;
};

type ApplicationStatusIconBadgeProps = {
  visual: ApplicationStatusVisualKey;
  /** Accessible name; defaults to the status label. */
  label?: string;
  /**
   * When true, hide from assistive tech (visible text nearby provides the name).
   * Use on the legend; leave false on cards where the badge is the status name.
   */
  decorative?: boolean;
  /** Override preference (e.g. profile preview). */
  style?: StatusIndicatorStyle;
};

const STATUS_DOT_CLASS: Record<ApplicationStatusVisualKey, string> = {
  draft: "bg-[var(--status-dot-draft)]",
  active_unviewed: "bg-[var(--status-dot-active)]",
  active_viewed: "bg-[var(--status-dot-viewed)]",
  archived: "bg-[var(--status-dot-archived)]",
};

const STATUS_WASH_CLASS: Record<ApplicationStatusVisualKey, string> = {
  draft: "bg-[var(--status-wash-draft)]",
  active_unviewed: "bg-[var(--status-wash-active)]",
  active_viewed: "bg-[var(--status-wash-viewed)]",
  archived: "bg-[var(--status-wash-archived)]",
};

function StatusGlyph({ visual }: { visual: ApplicationStatusVisualKey }) {
  const iconClass = "h-5 w-5 text-[var(--ink)]";
  if (visual === "archived") {
    return <ArchiveIcon className={iconClass} />;
  }
  if (visual === "active_viewed") {
    return <CheckIcon className={iconClass} />;
  }
  if (visual === "draft") {
    // Distinct from active_unviewed clock so high-contrast mode is not color-only.
    return <PencilIcon className={iconClass} />;
  }
  return <ClockIcon className={iconClass} />;
}

function StatusBadgeShell({
  label,
  description,
  decorative,
  children,
}: {
  label: string;
  description: string;
  decorative?: boolean;
  children: ReactNode;
}) {
  if (decorative) {
    return (
      <div
        className="flex h-9 w-9 shrink-0 items-center justify-center"
        aria-hidden
      >
        {children}
      </div>
    );
  }

  return (
    <div
      role="img"
      className="flex h-9 w-9 shrink-0 items-center justify-center"
      title={`${label}: ${description}`}
      aria-label={label}
    >
      {children}
    </div>
  );
}

function ColorfulDot({ visual }: { visual: ApplicationStatusVisualKey }) {
  return (
    <span
      className={`h-3.5 w-3.5 rounded-full ${STATUS_DOT_CLASS[visual]}`}
      aria-hidden
    />
  );
}

function HighContrastBadge({ visual }: { visual: ApplicationStatusVisualKey }) {
  return (
    <span
      className={`flex h-9 w-9 items-center justify-center rounded-full ${STATUS_WASH_CLASS[visual]}`}
    >
      <StatusGlyph visual={visual} />
    </span>
  );
}

/**
 * Status badge for cards and the legend.
 * - colorful (default): bright accent dots
 * - high_contrast: soft wash + ink glyph (WCAG 1.4.11)
 */
export function ApplicationStatusIconBadge({
  visual,
  label,
  decorative = false,
  style: styleProp,
}: ApplicationStatusIconBadgeProps) {
  const preferredStyle = useStatusIndicatorStyle();
  const style = styleProp ?? preferredStyle;
  const display = getApplicationStatusDisplayByKey(visual);
  const displayLabel = label ?? display.label;

  return (
    <StatusBadgeShell
      label={displayLabel}
      description={display.description}
      decorative={decorative}
    >
      {style === "high_contrast" ? (
        <HighContrastBadge visual={visual} />
      ) : (
        <ColorfulDot visual={visual} />
      )}
    </StatusBadgeShell>
  );
}

/** Status badge for an application list item (resolves draft / viewed / archived). */
export function ApplicationStatusIcon({
  status,
  viewCount,
  style,
}: ApplicationStatusIconProps) {
  const display = getApplicationStatusDisplay(status, viewCount);
  return (
    <ApplicationStatusIconBadge
      visual={display.key}
      label={display.label}
      style={style}
    />
  );
}

const WARNING_ICON = (
  <svg
    className="h-3.5 w-3.5"
    viewBox="0 0 20 20"
    fill="currentColor"
    aria-hidden
  >
    <path
      fillRule="evenodd"
      d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l6.518 11.594c.75 1.335-.213 2.982-1.742 2.982H3.48c-1.53 0-2.493-1.647-1.743-2.982L8.257 3.1zM11 14a1 1 0 10-2 0 1 1 0 002 0zm-1-2a1 1 0 01-1-1V8a1 1 0 112 0v3a1 1 0 01-1 1z"
      clipRule="evenodd"
    />
  </svg>
);

/** Inline “CV missing” chip (card + legend) — pink warning wash. */
export function MissingCvBadge() {
  return (
    <span
      className="inline-flex shrink-0 items-center gap-1 rounded-xl border border-[var(--status-warning-fg)]/30 bg-[var(--status-warning-bg)] px-2 py-0.5 text-xs font-medium text-[var(--status-warning-fg)]"
      title={CV_MISSING_LEGEND.description}
      aria-label="CV file missing"
    >
      {WARNING_ICON}
      {CV_MISSING_LEGEND.label}
    </span>
  );
}

/**
 * Inline chip when show-picture is on but the account has no photo.
 * Cool blue wash (distinct from CV missing pink). Links to Profile to add one.
 */
export function MissingProfilePictureBadge() {
  return (
    <Link
      href="/admin/profile"
      className="inline-flex shrink-0 items-center gap-1 rounded-xl border border-[var(--status-dot-active)]/50 bg-[var(--status-wash-active)] px-2 py-0.5 text-xs font-medium text-[var(--ink)] hover:bg-[var(--status-dot-active)]/25 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ink)]"
      title={`${PROFILE_PICTURE_MISSING_LEGEND.description} Open Profile to add a picture.`}
      aria-label="Profile picture missing. Open Profile to add a picture."
    >
      {WARNING_ICON}
      {PROFILE_PICTURE_MISSING_LEGEND.label}
    </Link>
  );
}
