/**
 * F35 — create/edit application form layout variant.
 * Query param + localStorage for manual A/B testing; env default as fallback.
 */

export const APPLICATION_FORM_STYLE_VALUES = ["wizard", "sections"] as const;

export type ApplicationFormStyle =
  (typeof APPLICATION_FORM_STYLE_VALUES)[number];

/** URL search param: `/admin/new?formStyle=wizard` */
export const APPLICATION_FORM_STYLE_QUERY_PARAM = "formStyle";

/** Browser persistence so the choice survives reloads without the query param. */
export const APPLICATION_FORM_STYLE_STORAGE_KEY =
  "mhv:application-form-style";

/** Default when nothing else is set. */
export const APPLICATION_FORM_STYLE_DEFAULT: ApplicationFormStyle = "sections";

export function isApplicationFormStyle(
  value: unknown,
): value is ApplicationFormStyle {
  return (
    typeof value === "string" &&
    (APPLICATION_FORM_STYLE_VALUES as readonly string[]).includes(value)
  );
}

export function parseApplicationFormStyle(
  value: unknown,
): ApplicationFormStyle | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim().toLowerCase();
  return isApplicationFormStyle(trimmed) ? trimmed : null;
}

/**
 * Resolve active layout: query param → localStorage → env → hard default.
 */
export function resolveApplicationFormStyle(input: {
  searchParam?: string | null;
  stored?: string | null;
  envDefault?: string | null;
}): ApplicationFormStyle {
  return (
    parseApplicationFormStyle(input.searchParam) ??
    parseApplicationFormStyle(input.stored) ??
    parseApplicationFormStyle(input.envDefault) ??
    APPLICATION_FORM_STYLE_DEFAULT
  );
}

/** `NEXT_PUBLIC_APPLICATION_FORM_STYLE` — build-time default variant. */
export function getEnvApplicationFormStyleDefault(): ApplicationFormStyle | null {
  return parseApplicationFormStyle(
    process.env.NEXT_PUBLIC_APPLICATION_FORM_STYLE,
  );
}

/**
 * Show the in-form switch unless explicitly disabled.
 * - `NEXT_PUBLIC_SHOW_FORM_STYLE_SWITCH=0` → hide
 * - `=1` → show (including production preview deploys)
 * - unset → show outside production builds
 */
export function isApplicationFormStyleSwitchEnabled(): boolean {
  const raw = process.env.NEXT_PUBLIC_SHOW_FORM_STYLE_SWITCH;
  if (raw === "0") return false;
  if (raw === "1") return true;
  return process.env.NODE_ENV !== "production";
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

export function readStoredApplicationFormStyle(): ApplicationFormStyle | null {
  const localStorage = getBrowserLocalStorage();
  if (!localStorage) return null;
  try {
    return parseApplicationFormStyle(
      localStorage.getItem(APPLICATION_FORM_STYLE_STORAGE_KEY),
    );
  } catch {
    return null;
  }
}

export function writeStoredApplicationFormStyle(
  style: ApplicationFormStyle,
): void {
  const localStorage = getBrowserLocalStorage();
  if (!localStorage) return;
  try {
    localStorage.setItem(APPLICATION_FORM_STYLE_STORAGE_KEY, style);
  } catch {
    // ignore quota / private mode
  }
}

export function readApplicationFormStyleSearchParam(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return new URLSearchParams(window.location.search).get(
      APPLICATION_FORM_STYLE_QUERY_PARAM,
    );
  } catch {
    return null;
  }
}

/** Update `formStyle` in the current URL without a navigation. */
export function replaceApplicationFormStyleSearchParam(
  style: ApplicationFormStyle,
): void {
  if (typeof window === "undefined") return;
  try {
    const url = new URL(window.location.href);
    url.searchParams.set(APPLICATION_FORM_STYLE_QUERY_PARAM, style);
    window.history.replaceState(window.history.state, "", url.toString());
  } catch {
    // ignore
  }
}
