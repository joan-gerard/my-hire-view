import type { ReactNode } from 'react';
import type { ApplicationStatus } from '@/lib/types/application';
import {
  CV_MISSING_LEGEND,
  getApplicationStatusDisplay,
  getApplicationStatusDisplayByKey,
  type ApplicationStatusVisualKey,
} from '@/lib/utils/application-status-display';
import {
  ArchiveIcon,
  CheckIcon,
  ClockIcon,
} from '@/components/admin/icons';

type ApplicationStatusIconProps = {
  status: ApplicationStatus;
  viewCount: number;
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
};

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
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full"
        aria-hidden
      >
        {children}
      </div>
    );
  }

  return (
    <div
      role="img"
      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full"
      title={`${label}: ${description}`}
      aria-label={label}
    >
      {children}
    </div>
  );
}

/** Renders the circular status badge used on cards and in the legend. */
export function ApplicationStatusIconBadge({
  visual,
  label,
  decorative = false,
}: ApplicationStatusIconBadgeProps) {
  const display = getApplicationStatusDisplayByKey(visual);
  const displayLabel = label ?? display.label;

  if (visual === 'archived') {
    return (
      <StatusBadgeShell
        label={displayLabel}
        description={display.description}
        decorative={decorative}
      >
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--foreground)]/10">
          <ArchiveIcon className="h-5 w-5 text-[var(--foreground)]/60" />
        </span>
      </StatusBadgeShell>
    );
  }

  if (visual === 'draft') {
    return (
      <StatusBadgeShell
        label={displayLabel}
        description={display.description}
        decorative={decorative}
      >
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-amber-100">
          <ClockIcon className="h-5 w-5 text-amber-700" />
        </span>
      </StatusBadgeShell>
    );
  }

  return (
    <StatusBadgeShell
      label={displayLabel}
      description={display.description}
      decorative={decorative}
    >
      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-100">
        {visual === 'active_viewed' ? (
          <CheckIcon className="h-5 w-5 text-emerald-600" />
        ) : (
          <ClockIcon className="h-5 w-5 text-emerald-600" />
        )}
      </span>
    </StatusBadgeShell>
  );
}

/** Status badge for an application list item (resolves draft / viewed / archived). */
export function ApplicationStatusIcon({
  status,
  viewCount,
}: ApplicationStatusIconProps) {
  const display = getApplicationStatusDisplay(status, viewCount);
  return (
    <ApplicationStatusIconBadge visual={display.key} label={display.label} />
  );
}

/** Inline “CV missing” chip (card + legend). */
export function MissingCvBadge() {
  return (
    <span
      className="inline-flex shrink-0 items-center gap-1 rounded-md border border-amber-500/40 bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-900"
      title={CV_MISSING_LEGEND.description}
      aria-label="CV file missing"
    >
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
      CV missing
    </span>
  );
}
