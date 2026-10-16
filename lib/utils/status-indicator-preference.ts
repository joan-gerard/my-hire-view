/**
 * Browser preference for dashboard application status markers.
 * Default: bright color dots. Optional high-contrast: wash + ink glyphs (WCAG 1.4.11).
 * Scoped by account key (same resolution as onboarding checklist prefs).
 */

import { resolveOnboardingAccountKey } from "@/lib/utils/onboarding-checklist-storage";

export const STATUS_INDICATOR_STORAGE_KEY =
  "myhireview:status-indicator-style";

export const STATUS_INDICATOR_CHANGED_EVENT =
  "myhireview:status-indicator-style-changed";

export type StatusIndicatorStyle = "colorful" | "high_contrast";

export type StatusIndicatorStorage = {
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

export function parseStatusIndicatorStorage(
  raw: unknown,
): StatusIndicatorStorage | null {
  if (!isRecord(raw)) return null;
  const accountKey =
    typeof raw.accountKey === "string" ? raw.accountKey.trim() : "";
  if (!accountKey || !isStatusIndicatorStyle(raw.style)) return null;
  return { accountKey, style: raw.style };
}

export function readStatusIndicatorStyle(
  accountKey: string,
): StatusIndicatorStyle {
  const localStorage = getBrowserLocalStorage();
  if (!localStorage) return DEFAULT_STATUS_INDICATOR_STYLE;
  try {
    const raw = localStorage.getItem(STATUS_INDICATOR_STORAGE_KEY);
    if (!raw) return DEFAULT_STATUS_INDICATOR_STYLE;
    const parsed = parseStatusIndicatorStorage(JSON.parse(raw) as unknown);
    if (!parsed || parsed.accountKey !== accountKey) {
      return DEFAULT_STATUS_INDICATOR_STYLE;
    }
    return parsed.style;
  } catch {
    return DEFAULT_STATUS_INDICATOR_STYLE;
  }
}

export function writeStatusIndicatorStyle(
  accountKey: string,
  style: StatusIndicatorStyle,
): void {
  const localStorage = getBrowserLocalStorage();
  if (!localStorage || !accountKey.trim()) return;
  const payload: StatusIndicatorStorage = {
    accountKey: accountKey.trim(),
    style,
  };
  try {
    localStorage.setItem(STATUS_INDICATOR_STORAGE_KEY, JSON.stringify(payload));
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent(STATUS_INDICATOR_CHANGED_EVENT, {
          detail: payload,
        }),
      );
    }
  } catch {
    // Quota / private mode — ignore
  }
}

export { resolveOnboardingAccountKey as resolveStatusIndicatorAccountKey };
