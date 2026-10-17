/**
 * Browser preference for dashboard application status markers.
 * Default: bright color dots. Optional high-contrast: wash + ink glyphs (WCAG 1.4.11).
 * Styles are stored per account key so switching users in one browser keeps each choice.
 */

import { isValidPublicId } from "@/lib/utils/public-id";
import { resolveOnboardingAccountKey } from "@/lib/utils/onboarding-checklist-storage";

export const STATUS_INDICATOR_STORAGE_KEY =
  "myhireview:status-indicator-style";

export const STATUS_INDICATOR_CHANGED_EVENT =
  "myhireview:status-indicator-style-changed";

export type StatusIndicatorStyle = "colorful" | "high_contrast";

/** @deprecated Legacy single-account blob shape (migrated on read). */
export type StatusIndicatorStorageV1 = {
  accountKey: string;
  style: StatusIndicatorStyle;
};

export type StatusIndicatorStorage = {
  byAccount: Record<string, StatusIndicatorStyle>;
};

/** Detail payload for same-tab CustomEvent updates. */
export type StatusIndicatorChangedDetail = {
  accountKey: string;
  style: StatusIndicatorStyle;
};

export const DEFAULT_STATUS_INDICATOR_STYLE: StatusIndicatorStyle = "colorful";

function getBrowserLocalStorage(): Storage | null {
  try {
    const { localStorage } = globalThis;
    if (!localStorage) return null;
    return localStorage;
  } catch {
    return null;
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function isStatusIndicatorStyle(
  value: unknown,
): value is StatusIndicatorStyle {
  return value === "colorful" || value === "high_contrast";
}

/**
 * Accept only canonical public ids for prefs keys (matches profile control /
 * share-id validation). Whitespace-only or malformed values are ignored.
 */
export function normalizeProfilePublicIdForPrefs(
  raw: unknown,
): string | null {
  if (typeof raw !== "string") return null;
  const trimmed = raw.trim();
  if (!trimmed || !isValidPublicId(trimmed)) return null;
  return trimmed;
}

export function parseStatusIndicatorStorage(
  raw: unknown,
): StatusIndicatorStorage | null {
  if (!isRecord(raw)) return null;

  // v2: { byAccount: { [accountKey]: style } }
  if (isRecord(raw.byAccount)) {
    const byAccount: Record<string, StatusIndicatorStyle> = {};
    for (const [key, value] of Object.entries(raw.byAccount)) {
      const accountKey = key.trim();
      if (accountKey && isStatusIndicatorStyle(value)) {
        byAccount[accountKey] = value;
      }
    }
    return { byAccount };
  }

  // v1: { accountKey, style }
  const accountKey =
    typeof raw.accountKey === "string" ? raw.accountKey.trim() : "";
  if (accountKey && isStatusIndicatorStyle(raw.style)) {
    return { byAccount: { [accountKey]: raw.style } };
  }

  return null;
}

function readStorageBlob(): StatusIndicatorStorage {
  const localStorage = getBrowserLocalStorage();
  if (!localStorage) return { byAccount: {} };
  try {
    const raw = localStorage.getItem(STATUS_INDICATOR_STORAGE_KEY);
    if (!raw) return { byAccount: {} };
    return (
      parseStatusIndicatorStorage(JSON.parse(raw) as unknown) ?? {
        byAccount: {},
      }
    );
  } catch {
    return { byAccount: {} };
  }
}

function writeStorageBlob(blob: StatusIndicatorStorage): void {
  const localStorage = getBrowserLocalStorage();
  if (!localStorage) return;
  localStorage.setItem(STATUS_INDICATOR_STORAGE_KEY, JSON.stringify(blob));
}

export function readStatusIndicatorStyle(
  accountKey: string,
): StatusIndicatorStyle {
  const key = accountKey.trim();
  if (!key) return DEFAULT_STATUS_INDICATOR_STYLE;
  const blob = readStorageBlob();
  const style = blob.byAccount[key];
  return isStatusIndicatorStyle(style) ? style : DEFAULT_STATUS_INDICATOR_STYLE;
}

export function writeStatusIndicatorStyle(
  accountKey: string,
  style: StatusIndicatorStyle,
): void {
  const key = accountKey.trim();
  if (!key || !isStatusIndicatorStyle(style)) return;
  try {
    const blob = readStorageBlob();
    blob.byAccount[key] = style;
    writeStorageBlob(blob);
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent<StatusIndicatorChangedDetail>(
          STATUS_INDICATOR_CHANGED_EVENT,
          { detail: { accountKey: key, style } },
        ),
      );
    }
  } catch {
    // Quota / private mode — ignore
  }
}

/**
 * Apply a storage-event update for this account when another tab wrote the blob.
 * Returns the new style for `accountKey`, or null if this event is irrelevant.
 */
export function styleFromStorageEvent(
  event: StorageEvent,
  accountKey: string,
): StatusIndicatorStyle | null {
  if (event.key !== STATUS_INDICATOR_STORAGE_KEY || event.newValue == null) {
    return null;
  }
  const key = accountKey.trim();
  if (!key) return null;
  try {
    const parsed = parseStatusIndicatorStorage(
      JSON.parse(event.newValue) as unknown,
    );
    if (!parsed) return null;
    const style = parsed.byAccount[key];
    return isStatusIndicatorStyle(style) ? style : null;
  } catch {
    return null;
  }
}

export { resolveOnboardingAccountKey as resolveStatusIndicatorAccountKey };
