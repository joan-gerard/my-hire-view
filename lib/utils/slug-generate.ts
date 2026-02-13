/**
 * Pure slug generation – safe to use in client components.
 * For server-only helpers (uniqueness check, unique slug), use lib/utils/slug.ts.
 */
export function generateSlug(company: string, role: string): string {
  const combined = `${company} ${role}`.toLowerCase();
  return combined
    .trim()
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
    .replace(/^-|-$/g, ''); // Remove leading/trailing hyphens
}

export type SlugNamePosition = 'start' | 'end' | null;

/**
 * Build slug with optional name at start or end.
 * - position 'start': name-company-role (e.g. john-doe-acme-software-engineer)
 * - position 'end': company-role-name (e.g. acme-software-engineer-john-doe)
 * - position null: company-role only
 */
export function buildSlug(
  company: string,
  role: string,
  first_name?: string | null,
  last_name?: string | null,
  position?: SlugNamePosition
): string {
  const baseSlug = generateSlug(company, role);
  if (!position) return baseSlug;
  const first = first_name?.trim() ?? '';
  const last = last_name?.trim() ?? '';
  if (!first && !last) return baseSlug;
  const nameSlug = generateSlug(first, last);
  if (!nameSlug) return baseSlug;
  return position === 'start' ? `${nameSlug}-${baseSlug}` : `${baseSlug}-${nameSlug}`;
}
