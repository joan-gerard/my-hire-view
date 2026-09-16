/**
 * localStorage blob for onboarding checklist UX prefs (F19-044).
 * Scoped by `accountKey` (profile public_id, else Auth metadata public_id,
 * else `user:{authUserId}`) so delete + recreate does not inherit prefs, and
 * accounts without a profiles row can still persist skips/dismiss.
 */

import {
  parseStoredStepIds,
  type OnboardingStepId,
} from "@/lib/utils/onboarding-checklist";

export const ONBOARDING_CHECKLIST_STORAGE_KEY =
  "myhireview:onboarding-checklist";

const LEGACY_EXPANDED_KEY = "myhireview:onboarding-checklist-expanded";
const LEGACY_SKIPPED_KEY = "myhireview:onboarding-checklist-skipped";
const LEGACY_COMPLETED_KEY = "myhireview:onboarding-checklist-completed";
const LEGACY_DISMISSED_KEY = "myhireview:onboarding-checklist-dismissed";

/** Legacy keys from before the single account-scoped blob. */
const LEGACY_STORAGE_KEYS = [
  LEGACY_EXPANDED_KEY,
  LEGACY_SKIPPED_KEY,
  LEGACY_COMPLETED_KEY,
  LEGACY_DISMISSED_KEY,
] as const;

export type OnboardingChecklistPrefs = {
  skipped: OnboardingStepId[];
  completed: OnboardingStepId[];
  dismissed: boolean;
  expanded: boolean;
};

export type OnboardingChecklistStorage = OnboardingChecklistPrefs & {
  accountKey: string;
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

function readAccountKey(raw: Record<string, unknown>): string {
  if (typeof raw.accountKey === "string" && raw.accountKey.trim()) {
    return raw.accountKey.trim();
  }
  // Legacy field name from the first publicId-scoped blob.
  if (typeof raw.publicId === "string" && raw.publicId.trim()) {
    return raw.publicId.trim();
  }
  return "";
}

/** Parse a stored JSON value; returns null when shape/accountKey is unusable. */
export function parseOnboardingChecklistStorage(
  raw: unknown,
): OnboardingChecklistStorage | null {
  if (!isRecord(raw)) return null;
  const accountKey = readAccountKey(raw);
  if (!accountKey) return null;
  return {
    accountKey,
    skipped: parseStoredStepIds(raw.skipped),
    completed: parseStoredStepIds(raw.completed),
    dismissed: raw.dismissed === true,
    expanded: raw.expanded !== false,
  };
}

/**
 * Prefs for `accountKey`. Mismatched or missing storage → defaults (fresh account).
 */
export function prefsForAccountKey(
  stored: OnboardingChecklistStorage | null,
  accountKey: string,
): OnboardingChecklistPrefs {
  const id = accountKey.trim();
  if (!id || !stored || stored.accountKey !== id) {
    return { ...DEFAULT_ONBOARDING_CHECKLIST_PREFS };
  }
  return {
    skipped: stored.skipped,
    completed: stored.completed,
    dismissed: stored.dismissed,
    expanded: stored.expanded,
  };
}

/** @deprecated Prefer `prefsForAccountKey`. */
export const prefsForPublicId = prefsForAccountKey;

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

function hasLegacyKeys(localStorage: Storage): boolean {
  return LEGACY_STORAGE_KEYS.some((key) => localStorage.getItem(key) != null);
}

/** Read pre-blob checklist prefs (returns null when none are present). */
export function readLegacyOnboardingChecklistPrefs(
  localStorage: Storage,
): OnboardingChecklistPrefs | null {
  if (!hasLegacyKeys(localStorage)) return null;

  let skipped: OnboardingStepId[] = [];
  let completed: OnboardingStepId[] = [];
  try {
    const skippedRaw = localStorage.getItem(LEGACY_SKIPPED_KEY);
    if (skippedRaw) {
      skipped = parseStoredStepIds(JSON.parse(skippedRaw) as unknown);
    }
  } catch {
    skipped = [];
  }
  try {
    const completedRaw = localStorage.getItem(LEGACY_COMPLETED_KEY);
    if (completedRaw) {
      completed = parseStoredStepIds(JSON.parse(completedRaw) as unknown);
    }
  } catch {
    completed = [];
  }

  return {
    skipped,
    completed,
    dismissed: localStorage.getItem(LEGACY_DISMISSED_KEY) === "true",
    expanded: localStorage.getItem(LEGACY_EXPANDED_KEY) !== "false",
  };
}

export function readOnboardingChecklistPrefs(
  accountKey: string,
): OnboardingChecklistPrefs {
  const localStorage = getBrowserLocalStorage();
  if (!localStorage) {
    return { ...DEFAULT_ONBOARDING_CHECKLIST_PREFS };
  }
  const id = accountKey.trim();
  if (!id) {
    return { ...DEFAULT_ONBOARDING_CHECKLIST_PREFS };
  }

  try {
    const raw = localStorage.getItem(ONBOARDING_CHECKLIST_STORAGE_KEY);
    const stored = raw
      ? parseOnboardingChecklistStorage(JSON.parse(raw) as unknown)
      : null;

    if (stored && stored.accountKey === id) {
      // Matching blob wins; drop any leftover legacy keys from older builds.
      if (hasLegacyKeys(localStorage)) {
        clearLegacyKeys(localStorage);
      }
      return {
        skipped: stored.skipped,
        completed: stored.completed,
        dismissed: stored.dismissed,
        expanded: stored.expanded,
      };
    }

    // No blob for this account — migrate unscoped legacy prefs once, then clear.
    const legacy = readLegacyOnboardingChecklistPrefs(localStorage);
    if (legacy) {
      writeOnboardingChecklistStorage({ accountKey: id, ...legacy });
      return legacy;
    }

    return { ...DEFAULT_ONBOARDING_CHECKLIST_PREFS };
  } catch {
    return { ...DEFAULT_ONBOARDING_CHECKLIST_PREFS };
  }
}

export function writeOnboardingChecklistStorage(
  value: OnboardingChecklistStorage,
): void {
  const localStorage = getBrowserLocalStorage();
  if (!localStorage) return;
  const accountKey = value.accountKey.trim();
  if (!accountKey) return;
  try {
    const payload: OnboardingChecklistStorage = {
      accountKey,
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

/**
 * Resolve a stable browser prefs key for the signed-in user.
 * Prefer share public_id; fall back to Auth user id when the profiles row
 * (and metadata public_id) are missing.
 */
export function resolveOnboardingAccountKey(input: {
  profilePublicId?: string | null;
  metadataPublicId?: string | null;
  authUserId?: string | null;
}): string | null {
  const fromProfile =
    typeof input.profilePublicId === "string"
      ? input.profilePublicId.trim()
      : "";
  if (fromProfile) return fromProfile;

  const fromMeta =
    typeof input.metadataPublicId === "string"
      ? input.metadataPublicId.trim()
      : "";
  if (fromMeta) return fromMeta;

  const userId =
    typeof input.authUserId === "string" ? input.authUserId.trim() : "";
  if (userId) return `user:${userId}`;

  return null;
}
