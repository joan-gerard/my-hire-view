/**
 * New-user onboarding checklist state (F19-044).
 * Pure helpers so the dashboard UI and tests share one definition of “done”.
 */

export type OnboardingStepId =
  | "create_profile"
  | "finish_profile"
  | "photo"
  | "primary_cv"
  | "first_application"
  | "publish_share";

export const ONBOARDING_STEP_IDS: readonly OnboardingStepId[] = [
  "create_profile",
  "finish_profile",
  "photo",
  "primary_cv",
  "first_application",
  "publish_share",
] as const;

export type OnboardingStep = {
  id: OnboardingStepId;
  label: string;
  href: string;
  /**
   * Satisfied from live account data and/or a prior completion persisted in
   * this browser (so deleting the only published app does not reopen the step).
   */
  done: boolean;
  /** User chose to skip this step in this browser (ignored when `done`). */
  skipped: boolean;
};

export type OnboardingChecklistInput = {
  firstName: string | null | undefined;
  lastName: string | null | undefined;
  location: string | null | undefined;
  portfolioUrl: string | null | undefined;
  linkedinUrl: string | null | undefined;
  profilePictureUrl: string | null | undefined;
  primaryCvCount: number;
  applicationTotal: number;
  activeApplicationCount: number;
};

function hasText(value: string | null | undefined): boolean {
  return value != null && String(value).trim() !== "";
}

function toIdSet(
  ids: ReadonlySet<OnboardingStepId> | readonly OnboardingStepId[],
): Set<OnboardingStepId> {
  return ids instanceof Set ? ids : new Set(ids);
}

/** At least one optional profile detail beyond name. */
export function hasOptionalProfileDetails(input: {
  location: string | null | undefined;
  portfolioUrl: string | null | undefined;
  linkedinUrl: string | null | undefined;
}): boolean {
  return (
    hasText(input.location) ||
    hasText(input.portfolioUrl) ||
    hasText(input.linkedinUrl)
  );
}

export function isOnboardingStepId(value: string): value is OnboardingStepId {
  return (ONBOARDING_STEP_IDS as readonly string[]).includes(value);
}

/** Keep only known step ids in checklist order (e.g. after reading localStorage). */
export function parseStoredStepIds(raw: unknown): OnboardingStepId[] {
  if (!Array.isArray(raw)) return [];
  const seen = new Set<OnboardingStepId>();
  for (const item of raw) {
    if (typeof item === "string" && isOnboardingStepId(item)) {
      seen.add(item);
    }
  }
  return ONBOARDING_STEP_IDS.filter((id) => seen.has(id));
}

/** @deprecated Prefer `parseStoredStepIds` — same behavior. */
export const parseSkippedStepIds = parseStoredStepIds;

/** Union of known step ids, preserving checklist order. */
export function mergeStepIdLists(
  ...lists: Array<ReadonlySet<OnboardingStepId> | readonly OnboardingStepId[]>
): OnboardingStepId[] {
  const seen = new Set<OnboardingStepId>();
  for (const list of lists) {
    for (const id of list) {
      seen.add(id);
    }
  }
  return ONBOARDING_STEP_IDS.filter((id) => seen.has(id));
}

/** Steps currently satisfied by live account data (not skips / history). */
export function liveCompletedStepIds(
  input: OnboardingChecklistInput,
): OnboardingStepId[] {
  const live: Record<OnboardingStepId, boolean> = {
    create_profile: hasText(input.firstName) && hasText(input.lastName),
    finish_profile: hasOptionalProfileDetails(input),
    photo: hasText(input.profilePictureUrl),
    primary_cv: input.primaryCvCount >= 1,
    first_application: input.applicationTotal >= 1,
    publish_share: input.activeApplicationCount >= 1,
  };
  return ONBOARDING_STEP_IDS.filter((id) => live[id]);
}

export function buildOnboardingSteps(
  input: OnboardingChecklistInput,
  skippedIds: ReadonlySet<OnboardingStepId> | readonly OnboardingStepId[] = [],
  completedIds: ReadonlySet<OnboardingStepId> | readonly OnboardingStepId[] = [],
): OnboardingStep[] {
  const skipped = toIdSet(skippedIds);
  const completed = toIdSet(completedIds);
  const liveIds = new Set(liveCompletedStepIds(input));

  const labels: Record<OnboardingStepId, { label: string; href: string }> = {
    create_profile: {
      label: "Create your profile",
      href: "/admin/profile",
    },
    finish_profile: {
      label: "Add location or a link",
      href: "/admin/profile",
    },
    photo: {
      label: "Add a profile photo",
      href: "/admin/profile",
    },
    primary_cv: {
      label: "Upload a primary CV",
      href: "/admin/profile",
    },
    first_application: {
      label: "Create your first application draft",
      href: "/admin/new",
    },
    publish_share: {
      label: "Publish & share",
      href: "/admin",
    },
  };

  return ONBOARDING_STEP_IDS.map((id) => {
    const done = liveIds.has(id) || completed.has(id);
    return {
      id,
      label: labels[id].label,
      href: labels[id].href,
      done,
      skipped: !done && skipped.has(id),
    };
  });
}

export function isOnboardingStepSatisfied(step: OnboardingStep): boolean {
  return step.done || step.skipped;
}

export function onboardingProgress(steps: OnboardingStep[]): {
  completed: number;
  total: number;
  allDone: boolean;
} {
  const completed = steps.filter(isOnboardingStepSatisfied).length;
  const total = steps.length;
  return { completed, total, allDone: completed === total };
}
