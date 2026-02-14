import { createClient } from '@supabase/supabase-js';
import { getSupabaseEnv, getSupabaseServiceRoleKey } from './env';

/**
 * Supabase client that uses the service_role key. Bypasses RLS.
 * Use only in server-side code (API routes, server actions). Never expose to the client.
 * Used for operations that must run regardless of the current user (e.g. increment_application_view_count RPC).
 */
export function createAdminClient() {
  const { url } = getSupabaseEnv();
  const serviceRoleKey = getSupabaseServiceRoleKey();
  return createClient(url, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
