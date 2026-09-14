/**
 * Local draft for `/admin/new` so refresh / navigation does not wipe progress
 * (F15-045). File selections are not persisted (browser File objects).
 *
 * Drafts are keyed by authenticated `user.id` only — never a shared fallback.
 */

import type { ApplicationCvType } from "@/lib/types/application";

export const CREATE_APPLICATION_DRAFT_VERSION = 2 as const;

/** Drop drafts older than this so stale PII does not linger indefinitely. */
export const CREATE_APPLICATION_DRAFT_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

const STORAGE_PREFIX = "myhireview:create-application-draft:";

/** Matches CandidateFieldsSection keys without importing the client component. */
export type CreateApplicationDraftFieldKey =
  | "first_name"
  | "last_name"
  | "location"
  | "portfolio_url"
  | "linkedin_url";

export type CreateApplicationDraftInclude = Record<
  CreateApplicationDraftFieldKey,
  boolean
>;

export type CreateApplicationDraft = {
  v: typeof CREATE_APPLICATION_DRAFT_VERSION;
  savedAt: string;
  company: string;
  role: string;
  slug: string;
  video_url: string;
  first_name: string;
  last_name: string;
  location: string;
  portfolio_url: string;
  linkedin_url: string;
  include: CreateApplicationDraftInclude;
  slugNamePosition: "start" | "end" | null;
  slugManuallyEdited: boolean;
  showProfilePicture: boolean;
  cvMode: ApplicationCvType;
  /** True only when the user (or an explicit prior choice) picked the CV source. */
  cvModeUserChosen: boolean;
  selectedPrimaryId: string | null;
  use_original_cv_filename: boolean;
};

export type CreateApplicationDraftInput = Omit<
  CreateApplicationDraft,
  "v" | "savedAt"
> & {
  savedAt?: string;
};

/**
 * Build a per-user storage key. Returns null when `userId` is empty so callers
 * never share a `"local"` bucket across signed-in accounts.
 */
export function createApplicationDraftStorageKey(
  userId: string,
): string | null {
  const trimmed = userId.trim();
  if (!trimmed) return null;
  return `${STORAGE_PREFIX}${trimmed}`;
}

/** Resolve localStorage without throwing when access is denied. */
function getBrowserLocalStorage(): Storage | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

function isDraftFieldKey(key: string): key is CreateApplicationDraftFieldKey {
  return (
    key === "first_name" ||
    key === "last_name" ||
    key === "location" ||
    key === "portfolio_url" ||
    key === "linkedin_url"
  );
}

function parseInclude(raw: unknown): CreateApplicationDraftInclude | null {
  if (!raw || typeof raw !== "object") return null;
  const obj = raw as Record<string, unknown>;
  const include: CreateApplicationDraftInclude = {
    first_name: false,
    last_name: false,
    location: false,
    portfolio_url: false,
    linkedin_url: false,
  };
  for (const key of Object.keys(include) as CreateApplicationDraftFieldKey[]) {
    if (typeof obj[key] !== "boolean") return null;
    include[key] = obj[key];
  }
  // Reject unexpected keys so we do not silently accept corrupt payloads.
  for (const key of Object.keys(obj)) {
    if (!isDraftFieldKey(key)) return null;
  }
  return include;
}

function isCvMode(value: unknown): value is ApplicationCvType {
  return value === "primary" || value === "tailored";
}

function isSlugNamePosition(
  value: unknown,
): value is "start" | "end" | null {
  return value === "start" || value === "end" || value === null;
}

function defaultIncludeFromValues(
  draft: Pick<
    CreateApplicationDraftInput,
    CreateApplicationDraftFieldKey
  >,
): CreateApplicationDraftInclude {
  return {
    first_name: draft.first_name.trim() !== "",
    last_name: draft.last_name.trim() !== "",
    location: draft.location.trim() !== "",
    portfolio_url: draft.portfolio_url.trim() !== "",
    linkedin_url: draft.linkedin_url.trim() !== "",
  };
}

function includeMatchesDefault(draft: CreateApplicationDraftInput): boolean {
  const expected = defaultIncludeFromValues(draft);
  return (
    Object.keys(expected) as CreateApplicationDraftFieldKey[]
  ).every((key) => draft.include[key] === expected[key]);
}

/** Validate and normalize a parsed JSON value into a draft, or null. */
export function parseCreateApplicationDraft(
  raw: unknown,
  nowMs: number = Date.now(),
): CreateApplicationDraft | null {
  if (!raw || typeof raw !== "object") return null;
  const obj = raw as Record<string, unknown>;
  const version = obj.v;
  // Accept v1 (pre-flag) and migrate; require current fields on v2+.
  if (version !== 1 && version !== CREATE_APPLICATION_DRAFT_VERSION) {
    return null;
  }
  if (typeof obj.savedAt !== "string") return null;
  const savedAtMs = Date.parse(obj.savedAt);
  if (!Number.isFinite(savedAtMs)) return null;
  if (nowMs - savedAtMs > CREATE_APPLICATION_DRAFT_MAX_AGE_MS) return null;
  if (nowMs < savedAtMs - 60_000) return null; // clock skew / future junk

  const include = parseInclude(obj.include);
  if (!include) return null;

  const str = (key: string): string | null =>
    typeof obj[key] === "string" ? (obj[key] as string) : null;

  const company = str("company");
  const role = str("role");
  const slug = str("slug");
  const video_url = str("video_url");
  const first_name = str("first_name");
  const last_name = str("last_name");
  const location = str("location");
  const portfolio_url = str("portfolio_url");
  const linkedin_url = str("linkedin_url");
  if (
    company === null ||
    role === null ||
    slug === null ||
    video_url === null ||
    first_name === null ||
    last_name === null ||
    location === null ||
    portfolio_url === null ||
    linkedin_url === null
  ) {
    return null;
  }

  if (typeof obj.slugManuallyEdited !== "boolean") return null;
  if (typeof obj.showProfilePicture !== "boolean") return null;
  if (typeof obj.use_original_cv_filename !== "boolean") return null;
  if (!isCvMode(obj.cvMode)) return null;
  if (!isSlugNamePosition(obj.slugNamePosition)) return null;
  if (
    obj.selectedPrimaryId !== null &&
    typeof obj.selectedPrimaryId !== "string"
  ) {
    return null;
  }

  let cvModeUserChosen: boolean;
  if (version === CREATE_APPLICATION_DRAFT_VERSION) {
    if (typeof obj.cvModeUserChosen !== "boolean") return null;
    cvModeUserChosen = obj.cvModeUserChosen;
  } else {
    // v1 had no flag. Tailored in a saved draft was almost always an explicit
    // choice — preserve it so a late library load cannot flip back to primary.
    cvModeUserChosen = obj.cvMode === "tailored";
  }

  return {
    v: CREATE_APPLICATION_DRAFT_VERSION,
    savedAt: obj.savedAt,
    company,
    role,
    slug,
    video_url,
    first_name,
    last_name,
    location,
    portfolio_url,
    linkedin_url,
    include,
    slugNamePosition: obj.slugNamePosition,
    slugManuallyEdited: obj.slugManuallyEdited,
    showProfilePicture: obj.showProfilePicture,
    cvMode: obj.cvMode,
    cvModeUserChosen,
    selectedPrimaryId: obj.selectedPrimaryId,
    use_original_cv_filename: obj.use_original_cv_filename,
  };
}

/**
 * True when there is nothing worth restoring (avoid writing empty noise).
 * Includes candidate fields / include toggles / picture + filename prefs so
 * personal-only progress is not discarded (F15-045 review).
 */
export function isCreateApplicationDraftBlank(
  draft: CreateApplicationDraftInput,
): boolean {
  const noCoreProgress =
    !draft.company.trim() &&
    !draft.role.trim() &&
    !draft.video_url.trim() &&
    !draft.cvModeUserChosen &&
    !draft.slugManuallyEdited &&
    draft.slugNamePosition == null &&
    draft.showProfilePicture === true &&
    draft.use_original_cv_filename === true;

  const noPersonalProgress =
    !draft.first_name.trim() &&
    !draft.last_name.trim() &&
    !draft.location.trim() &&
    !draft.portfolio_url.trim() &&
    !draft.linkedin_url.trim() &&
    includeMatchesDefault(draft);

  return noCoreProgress && noPersonalProgress;
}

export function loadCreateApplicationDraft(
  storageKey: string,
  storage: Pick<Storage, "getItem" | "removeItem"> | null = getBrowserLocalStorage(),
  nowMs: number = Date.now(),
): CreateApplicationDraft | null {
  if (!storage) return null;
  try {
    const raw = storage.getItem(storageKey);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    const draft = parseCreateApplicationDraft(parsed, nowMs);
    if (!draft) {
      storage.removeItem(storageKey);
      return null;
    }
    return draft;
  } catch {
    try {
      storage.removeItem(storageKey);
    } catch {
      // ignore
    }
    return null;
  }
}

export function saveCreateApplicationDraft(
  storageKey: string,
  draft: CreateApplicationDraftInput,
  storage: Pick<Storage, "setItem" | "removeItem"> | null = getBrowserLocalStorage(),
): void {
  if (!storage) return;
  try {
    if (isCreateApplicationDraftBlank(draft)) {
      storage.removeItem(storageKey);
      return;
    }
    const payload: CreateApplicationDraft = {
      v: CREATE_APPLICATION_DRAFT_VERSION,
      savedAt: draft.savedAt ?? new Date().toISOString(),
      company: draft.company,
      role: draft.role,
      slug: draft.slug,
      video_url: draft.video_url,
      first_name: draft.first_name,
      last_name: draft.last_name,
      location: draft.location,
      portfolio_url: draft.portfolio_url,
      linkedin_url: draft.linkedin_url,
      include: draft.include,
      slugNamePosition: draft.slugNamePosition,
      slugManuallyEdited: draft.slugManuallyEdited,
      showProfilePicture: draft.showProfilePicture,
      cvMode: draft.cvMode,
      cvModeUserChosen: draft.cvModeUserChosen,
      selectedPrimaryId: draft.selectedPrimaryId,
      use_original_cv_filename: draft.use_original_cv_filename,
    };
    storage.setItem(storageKey, JSON.stringify(payload));
  } catch {
    // Quota / private mode — fail soft; form still works without persistence.
  }
}

export function clearCreateApplicationDraft(
  storageKey: string,
  storage: Pick<Storage, "removeItem"> | null = getBrowserLocalStorage(),
): void {
  if (!storage) return;
  try {
    storage.removeItem(storageKey);
  } catch {
    // ignore
  }
}
