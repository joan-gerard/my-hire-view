/**
 * localStorage blob for onboarding checklist UX prefs (F19-044).
 * Scoped by `publicId` so delete + recreate (new public id) does not inherit
 * another account’s skips / sticky completions / dismiss.
 */

import {
  parseStoredStepIds,
  type OnboardingStepId,
} from "@/lib/utils/onboarding-checklist";

export const ONBOARDING_CHECKLIST_STORAGE_KEY =
  "myhireview:onboarding-checklist";

/** Legacy keys from before the single publicId-scoped blob. */
const LEGACY_STORAGE_KEYS = [
  "myhireview:onboarding-checklist-expanded",
  "myhireview:onboarding-checklist-skipped",
  "myhireview:onboarding-checklist-completed",
  "myhireview:onboarding-checklist-dismissed",
] as const;

export type OnboardingChecklistPrefs = {
  skipped: OnboardingStepId[];
  completed: OnboardingStepId[];
  dismissed: boolean;
  expanded: boolean;
};

export type OnboardingChecklistStorage = OnboardingChecklistPrefs & {
  publicId: string;
};

export const DEFAULT_ONBOARDING_CHECKLIST_PREFS: OnboardingChecklistPrefs = {
  skipped: [],
  completed: [],
  dismissed: false,
  expanded: true,
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/** Parse a stored JSON value; returns null when shape/publicId is unusable. */
export function parseOnboardingChecklistStorage(
  raw: unknown,
): OnboardingChecklistStorage | null {
  if (!isRecord(raw)) return null;
  const publicId =
    typeof raw.publicId === "string" ? raw.publicId.trim() : "";
  if (!publicId) return null;
  return {
    publicId,
    skipped: parseStoredStepIds(raw.skipped),
    completed: parseStoredStepIds(raw.completed),
    dismissed: raw.dismissed === true,
    expanded: raw.expanded !== false,
  };
}

/**
 * Prefs for `publicId`. Mismatched or missing storage → defaults (fresh account).
 */
export function prefsForPublicId(
  stored: OnboardingChecklistStorage | null,
  publicId: string,
): OnboardingChecklistPrefs {
  const id = publicId.trim();
  if (!id || !stored || stored.publicId !== id) {
    return { ...DEFAULT_ONBOARDING_CHECKLIST_PREFS };
  }
  return {
    skipped: stored.skipped,
    completed: stored.completed,
    dismissed: stored.dismissed,
    expanded: stored.expanded,
  };
}

function getBrowserLocalStorage(): Storage | null {
  try {
    const { localStorage } = globalThis;
    if (!localStorage) return null;
    return localStorage;
  } catch {
    return null;
  }
}

function clearLegacyKeys(localStorage: Storage): void {
  try {
    for (const key of LEGACY_STORAGE_KEYS) {
      localStorage.removeItem(key);
    }
  } catch {
    // ignore
  }
}

export function readOnboardingChecklistPrefs(
  publicId: string,
): OnboardingChecklistPrefs {
  const localStorage = getBrowserLocalStorage();
  if (!localStorage) {
    return { ...DEFAULT_ONBOARDING_CHECKLIST_PREFS };
  }
  try {
    const raw = localStorage.getItem(ONBOARDING_CHECKLIST_STORAGE_KEY);
    const stored = raw
      ? parseOnboardingChecklistStorage(JSON.parse(raw) as unknown)
      : null;
    return prefsForPublicId(stored, publicId);
  } catch {
    return { ...DEFAULT_ONBOARDING_CHECKLIST_PREFS };
  }
}

export function writeOnboardingChecklistStorage(
  value: OnboardingChecklistStorage,
): void {
  const localStorage = getBrowserLocalStorage();
  if (!localStorage) return;
  const publicId = value.publicId.trim();
  if (!publicId) return;
  try {
    const payload: OnboardingChecklistStorage = {
      publicId,
      skipped: parseStoredStepIds(value.skipped),
      completed: parseStoredStepIds(value.completed),
      dismissed: value.dismissed === true,
      expanded: value.expanded !== false,
    };
    localStorage.setItem(
      ONBOARDING_CHECKLIST_STORAGE_KEY,
      JSON.stringify(payload),
    );
    clearLegacyKeys(localStorage);
  } catch {
    // ignore quota / private mode
  }
}
