/**
 * Pure slug generation – safe to use in client components.
 * For server-only helpers (`reserveBaseSlug`, validate), use lib/utils/slug.ts.
 */

/** Matches slugs produced by {@link generateSlug} / {@link buildSlug} (lowercase, hyphen-separated segments). */
export const SLUG_MAX_LENGTH = 128;

const SLUG_SEGMENT_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/** Order of company vs role segments in the shareable application slug. */
export const SLUG_SEGMENT_ORDER_VALUES = [
  "company_role",
  "role_company",
] as const;

export type SlugSegmentOrder = (typeof SLUG_SEGMENT_ORDER_VALUES)[number];

export const SLUG_SEGMENT_ORDER_DEFAULT: SlugSegmentOrder = "company_role";

export function isSlugSegmentOrder(
  value: unknown,
): value is SlugSegmentOrder {
  return (
    typeof value === "string" &&
    (SLUG_SEGMENT_ORDER_VALUES as readonly string[]).includes(value)
  );
}

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

/** Company then role (legacy default). */
export function generateSlug(company: string, role: string): string {
  return buildSlug(company, role, "company_role");
}

/**
 * Build slug from company + role in the chosen segment order.
 * - `company_role`: e.g. acme-software-engineer
 * - `role_company`: e.g. software-engineer-acme
 */
export function buildSlug(
  company: string,
  role: string,
  order: SlugSegmentOrder = SLUG_SEGMENT_ORDER_DEFAULT,
): string {
  const companySlug = normalizeSlugInput(company);
  const roleSlug = normalizeSlugInput(role);
  if (!companySlug && !roleSlug) return "";
  if (!companySlug) return clampSlugLength(roleSlug);
  if (!roleSlug) return clampSlugLength(companySlug);
  const joined =
    order === "role_company"
      ? `${roleSlug}-${companySlug}`
      : `${companySlug}-${roleSlug}`;
  return clampSlugLength(joined);
}

/**
 * True when `slug` is not what {@link buildSlug} would produce for these inputs.
 * Used on edit load so a saved custom slug is not overwritten by auto-rebuild.
 */
export function isCustomSlug(
  slug: string,
  company: string,
  role: string,
  order: SlugSegmentOrder = SLUG_SEGMENT_ORDER_DEFAULT,
): boolean {
  const trimmed = slug.trim();
  if (!trimmed) return false;
  return trimmed !== buildSlug(company, role, order);
}
