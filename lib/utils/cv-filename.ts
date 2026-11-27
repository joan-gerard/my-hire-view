/**
 * CV download filename helpers for the public view and form preview.
 *
 * Generated default: `{First}-{Last}-{Slug}.pdf` (e.g. Joan-Gerard-Spotify-Software-Engineer.pdf).
 * Falls back to `CV-{Slug}.pdf` when names are missing, or `{Name}.pdf` when the slug is empty.
 * Form preview uses {@link getCvDownloadFilenamePreview} so missing parts show as
 * `First-Last` / `Company-Role` instead of an unfinished short name.
 */

/** Soft cap so download attributes stay practical across browsers. */
const CV_DOWNLOAD_FILENAME_MAX = 180;

/** Shown in the form preview when candidate names are not available yet. */
export const CV_FILENAME_NAME_PLACEHOLDER = "First-Last";

/** Shown in the form preview when company/role slug is not available yet. */
export const CV_FILENAME_SLUG_PLACEHOLDER = "Company-Role";

export type CvDownloadFilenameInput = {
  slug?: string | null;
  firstName?: string | null;
  lastName?: string | null;
};

export type CvDownloadFilenamePreview = {
  /** Full preview string including `.pdf`. */
  filename: string;
  /** True when both real name and real slug parts are present. */
  isComplete: boolean;
};

/**
 * Normalize free text into Title-Case hyphenated segments safe for filenames.
 */
function toFilenameSegment(text: string): string {
  return text
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join("-");
}

function titleCaseSlug(slug: string): string {
  return slug
    .trim()
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join("-");
}

function clampFilename(nameWithoutExt: string): string {
  if (nameWithoutExt.length <= CV_DOWNLOAD_FILENAME_MAX) return nameWithoutExt;
  return nameWithoutExt
    .slice(0, CV_DOWNLOAD_FILENAME_MAX)
    .replace(/-+$/g, "");
}

function resolveNamePart(
  firstName?: string | null,
  lastName?: string | null,
): string {
  return [firstName, lastName]
    .filter((value): value is string => typeof value === "string")
    .map(toFilenameSegment)
    .filter(Boolean)
    .join("-");
}

function resolveSlugPart(slug?: string | null): string {
  return slug?.trim() ? titleCaseSlug(slug) : "";
}

function normalizeInput(
  input: CvDownloadFilenameInput | string | null | undefined,
): CvDownloadFilenameInput {
  return typeof input === "string" || input == null ? { slug: input } : input;
}

/**
 * Returns the generated downloadable CV filename, or "" when there is nothing
 * meaningful yet. Does not insert preview placeholders — use
 * {@link getCvDownloadFilenamePreview} in the form.
 * Actual downloads that still need a fallback can use {@link getCvDownloadFilenameOrFallback}.
 */
export function getCvDownloadFilename(
  input: CvDownloadFilenameInput | string | null | undefined,
): string {
  const parts = normalizeInput(input);
  const name = resolveNamePart(parts.firstName, parts.lastName);
  const slugPart = resolveSlugPart(parts.slug);

  let base = "";
  if (name && slugPart) base = `${name}-${slugPart}`;
  else if (name) base = name;
  else if (slugPart) base = `CV-${slugPart}`;

  if (!base) return "";
  return `${clampFilename(base)}.pdf`;
}

/**
 * Form preview of the generated download name. Always shows the full
 * `{Name}-{Slug}.pdf` pattern, filling missing segments with
 * {@link CV_FILENAME_NAME_PLACEHOLDER} / {@link CV_FILENAME_SLUG_PLACEHOLDER}.
 */
export function getCvDownloadFilenamePreview(
  input: CvDownloadFilenameInput,
): CvDownloadFilenamePreview {
  const name = resolveNamePart(input.firstName, input.lastName);
  const slugPart = resolveSlugPart(input.slug);
  const hasName = Boolean(name);
  const hasSlug = Boolean(slugPart);
  const base = `${name || CV_FILENAME_NAME_PLACEHOLDER}-${slugPart || CV_FILENAME_SLUG_PLACEHOLDER}`;
  return {
    filename: `${clampFilename(base)}.pdf`,
    isComplete: hasName && hasSlug,
  };
}

/**
 * Same as {@link getCvDownloadFilename}, but always returns a usable download
 * attribute (falls back to `CV.pdf` when parts are empty).
 */
export function getCvDownloadFilenameOrFallback(
  input: CvDownloadFilenameInput,
): string {
  return getCvDownloadFilename(input) || "CV.pdf";
}
