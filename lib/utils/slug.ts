import { createClient } from '@/lib/supabase/server';
import { generateSlug } from './slug-generate';

export { generateSlug };

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
  excludeId?: string
): Promise<string> {
  let baseSlug = generateSlug(company, role);
  let slug = baseSlug;
  let counter = 1;

  while (!(await checkSlugUniqueness(slug, excludeId))) {
    slug = `${baseSlug}-${counter}`;
    counter++;
  }

  return slug;
}
