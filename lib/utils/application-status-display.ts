import type { ApplicationStatus } from '@/lib/types/application';

/** Visual keys for the left-side status badge on application cards. */
export type ApplicationStatusVisualKey =
  | 'draft'
  | 'active_unviewed'
  | 'active_viewed'
  | 'archived';

export type ApplicationStatusDisplay = {
  key: ApplicationStatusVisualKey;
  label: string;
  /** Short explanation for tooltips and the dashboard legend. */
  description: string;
};

const STATUS_DISPLAY: Record<ApplicationStatusVisualKey, ApplicationStatusDisplay> =
  {
    draft: {
      key: 'draft',
      label: 'Draft',
      description:
        'Saved but not visible to recruiters yet. Publish when you are ready to share.',
    },
    active_unviewed: {
      key: 'active_unviewed',
      label: 'Active (not viewed yet)',
      description:
        'Live and shareable. No recruiter has opened the page yet.',
    },
    active_viewed: {
      key: 'active_viewed',
      label: 'Active (viewed)',
      description:
        'Live and shareable. At least one recruiter has opened the page.',
    },
    archived: {
      key: 'archived',
      label: 'Archived',
      description:
        'Hidden from sharing until you restore it. The old link shows an empty state.',
    },
  };

/** Ordered legend rows for status icons (matches card badge visuals). */
export const APPLICATION_STATUS_LEGEND_ITEMS: readonly ApplicationStatusDisplay[] =
  [
    STATUS_DISPLAY.draft,
    STATUS_DISPLAY.active_unviewed,
    STATUS_DISPLAY.active_viewed,
    STATUS_DISPLAY.archived,
  ];

export const CV_MISSING_LEGEND = {
  label: 'CV missing',
  description:
    'The CV file is missing from storage. Edit this application and select or upload an available CV.',
} as const;

export type DraftActionLegendItem = {
  label: string;
  description: string;
};

/** Clarifies draft card actions vs live Copy Link / View Application. */
export const DRAFT_ACTION_LEGEND_ITEMS: readonly DraftActionLegendItem[] = [
  {
    label: 'Publish',
    description:
      'Makes the application live so recruiters can open the share link.',
  },
  {
    label: 'Preview',
    description:
      'Opens the public page for you only. Recruiters still cannot see it until you publish.',
  },
  {
    label: 'Publish to share',
    description:
      'Shown instead of Copy Link on drafts. Publish first, then copy the link.',
  },
];

export function resolveApplicationStatusVisual(
  status: ApplicationStatus,
  viewCount: number,
): ApplicationStatusVisualKey {
  if (status === 'archived') return 'archived';
  if (status === 'draft') return 'draft';
  return viewCount > 0 ? 'active_viewed' : 'active_unviewed';
}

export function getApplicationStatusDisplay(
  status: ApplicationStatus,
  viewCount: number,
): ApplicationStatusDisplay {
  return STATUS_DISPLAY[resolveApplicationStatusVisual(status, viewCount)];
}

export function getApplicationStatusDisplayByKey(
  key: ApplicationStatusVisualKey,
): ApplicationStatusDisplay {
  return STATUS_DISPLAY[key];
}
