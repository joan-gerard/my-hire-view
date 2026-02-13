import { createClient } from '@/lib/supabase/server';
import { generateSlug, buildSlug } from './slug-generate';

export { generateSlug, buildSlug };

export async function checkSlugUniqueness(
  slug: string,
  excludeId?: string
): Promise<boolean> {
  const supabase = await createClient();
  let query = supabase.from('applications').select('id').eq('slug', slug);

  if (excludeId) {
    query = query.neq('id', excludeId);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error('Failed to check slug uniqueness');
  }

  return (data?.length || 0) === 0;
}

export async function generateUniqueSlug(
  company: string,
  role: string,
  excludeId?: string,
  first_name?: string | null,
  last_name?: string | null,
  position?: 'start' | 'end' | null
): Promise<string> {
  const baseSlug =
    position && (first_name?.trim() || last_name?.trim())
      ? buildSlug(company, role, first_name, last_name, position)
      : generateSlug(company, role);
  let slug = baseSlug;
  let counter = 1;

  while (!(await checkSlugUniqueness(slug, excludeId))) {
    slug = `${baseSlug}-${counter}`;
    counter++;
  }

  return slug;
}
