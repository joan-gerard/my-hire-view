/**
 * Pure slug generation – safe to use in client components.
 * For server-only helpers (`reserveBaseSlug`, validate), use lib/utils/slug.ts.
 */

/** Matches slugs produced by {@link generateSlug} / {@link buildSlug} (lowercase, hyphen-separated segments). */
export const SLUG_MAX_LENGTH = 128;

const SLUG_SEGMENT_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/**
 * Normalize free text into a lowercase hyphenated slug segment (no length clamp).
 */
function normalizeSlugInput(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "") // Remove special characters
    .replace(/\s+/g, "-") // Replace spaces with hyphens
    .replace(/-+/g, "-") // Replace multiple hyphens with single hyphen
    .replace(/^-|-$/g, ""); // Remove leading/trailing hyphens
}

/**
 * Truncate to `maxLength` without leaving a trailing hyphen.
 * Keeps auto-generated slugs within the same limit as {@link validateSlugFormat}.
 */
function clampSlugLength(
  slug: string,
  maxLength: number = SLUG_MAX_LENGTH,
): string {
  if (maxLength <= 0) return "";
  if (slug.length <= maxLength) return slug;
  return slug.slice(0, maxLength).replace(/-+$/, "");
}

/**
 * Join name + company/role, clamping to {@link SLUG_MAX_LENGTH} while preferring
 * to keep the full name segment when possible (truncate company/role first).
 */
function joinPreferringName(
  nameSlug: string,
  baseSlug: string,
  nameAt: "start" | "end",
): string {
  const combined =
    nameAt === "start" ? `${nameSlug}-${baseSlug}` : `${baseSlug}-${nameSlug}`;
  if (combined.length <= SLUG_MAX_LENGTH) return combined;

  // Name alone at/over the limit — keep as much of the name as fits.
  if (nameSlug.length >= SLUG_MAX_LENGTH) {
    return clampSlugLength(nameSlug);
  }

  const roomForBase = SLUG_MAX_LENGTH - nameSlug.length - 1; // hyphen separator
  if (roomForBase < 1) {
    return clampSlugLength(nameSlug);
  }

  const truncatedBase = clampSlugLength(baseSlug, roomForBase);
  if (!truncatedBase) {
    return clampSlugLength(nameSlug);
  }

  return nameAt === "start"
    ? `${nameSlug}-${truncatedBase}`
    : `${truncatedBase}-${nameSlug}`;
}

/**
 * Validates a user-facing slug string (format only). Shared by client preview and server.
 */
export function validateSlugFormat(
  slug: string,
): { ok: true } | { ok: false; error: string } {
  const s = slug.trim();
  if (!s) return { ok: false, error: "Slug is required" };
  if (s.length > SLUG_MAX_LENGTH) {
    return {
      ok: false,
      error: `Slug must be at most ${SLUG_MAX_LENGTH} characters`,
    };
  }
  if (!SLUG_SEGMENT_PATTERN.test(s)) {
    return {
      ok: false,
      error:
        "Use lowercase letters, numbers, and single hyphens between words (e.g. volvo-frontend-engineer).",
    };
  }
  return { ok: true };
}

export function generateSlug(company: string, role: string): string {
  return clampSlugLength(normalizeSlugInput(`${company} ${role}`));
}

export type SlugNamePosition = "start" | "end" | null;

/**
 * Build slug with optional name at start or end.
 * - position 'start': name-company-role (e.g. john-doe-acme-software-engineer)
 * - position 'end': company-role-name (e.g. acme-software-engineer-john-doe)
 * - position null: company-role only
 *
 * When the combined slug exceeds {@link SLUG_MAX_LENGTH}, the company/role
 * segment is truncated first so the requested name is preserved when possible.
 */
export function buildSlug(
  company: string,
  role: string,
  first_name?: string | null,
  last_name?: string | null,
  position?: SlugNamePosition,
): string {
  const baseSlug = normalizeSlugInput(`${company} ${role}`);
  if (!position) return clampSlugLength(baseSlug);
  const first = first_name?.trim() ?? "";
  const last = last_name?.trim() ?? "";
  if (!first && !last) return clampSlugLength(baseSlug);
  const nameSlug = normalizeSlugInput(`${first} ${last}`);
  if (!nameSlug) return clampSlugLength(baseSlug);
  return joinPreferringName(nameSlug, baseSlug, position);
}

/**
 * True when `slug` is not what {@link buildSlug} would produce for these inputs.
 * Used on edit load so a saved custom slug is not overwritten by auto-rebuild.
 */
export function isCustomSlug(
  slug: string,
  company: string,
  role: string,
  first_name?: string | null,
  last_name?: string | null,
  position?: SlugNamePosition,
): boolean {
  const trimmed = slug.trim();
  if (!trimmed) return false;
  return (
    trimmed !== buildSlug(company, role, first_name, last_name, position)
  );
}
