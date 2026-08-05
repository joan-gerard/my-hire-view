import { createClient } from '@/lib/supabase/server';
import { generateSlug, buildSlug, validateSlugFormat } from './slug-generate';

export { generateSlug, buildSlug, validateSlugFormat };

export async function checkSlugUniqueness(
  slug: string,
  userId: string,
  excludeId?: string,
): Promise<boolean> {
  const supabase = await createClient();
  let query = supabase
    .from('applications')
    .select('id')
    .eq('slug', slug)
    .eq('user_id', userId);

  if (excludeId) {
    query = query.neq('id', excludeId);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error('Failed to check slug uniqueness');
  }

  return (data?.length || 0) === 0;
}

/**
 * Format + DB uniqueness for a proposed application slug.
 * @param excludeId — application row id to ignore (edit flow).
 */
/** Shown when the slug is already used by another application for this user. */
export const SLUG_COLLISION_USER_MESSAGE =
  "You already have an application with this slug. Change the text slightly or pick another slug.";

export class SlugCollisionError extends Error {
  readonly code = "SLUG_COLLISION" as const;

  constructor(message: string = SLUG_COLLISION_USER_MESSAGE) {
    super(message);
    this.name = "SlugCollisionError";
  }
}

export async function validateSlugForApplication(
  slug: string,
  userId: string,
  excludeId?: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const format = validateSlugFormat(slug);
  if (!format.ok) return format;

  const trimmed = slug.trim();
  const unique = await checkSlugUniqueness(trimmed, userId, excludeId);
  if (!unique) {
    return {
      ok: false,
      error: SLUG_COLLISION_USER_MESSAGE,
    };
  }
  return { ok: true };
}

/**
 * Returns the slug derived from company/role (and name-in-URL rules when `position` and names are set)
 * if it is not already used in the database. Otherwise throws {@link SlugCollisionError}.
 * Output is capped at {@link SLUG_MAX_LENGTH} via `generateSlug` / `buildSlug`.
 * `excludeId` ignores that application row when checking (edit flow).
 */
export async function reserveBaseSlug(
  company: string,
  role: string,
  userId: string,
  excludeId?: string,
  first_name?: string | null,
  last_name?: string | null,
  position?: "start" | "end" | null,
): Promise<string> {
  const baseSlug =
    position && (first_name?.trim() || last_name?.trim())
      ? buildSlug(company, role, first_name, last_name, position)
      : generateSlug(company, role);

  const unique = await checkSlugUniqueness(baseSlug, userId, excludeId);
  if (!unique) {
    throw new SlugCollisionError();
  }

  return baseSlug;
}
