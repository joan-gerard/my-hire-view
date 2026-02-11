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
