type SupabaseEnv = {
  url: string;
  anonKey: string;
};

/**
 * Returns Supabase URL and anon key. Safe for client and server.
 * Do not use for privileged operations; use getSupabaseServiceRoleKey() + URL only on the server.
 */
export function getSupabaseEnv(): SupabaseEnv {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error(
      'Missing Supabase env vars. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.'
    );
  }

  return { url, anonKey };
}

/**
 * Returns the Supabase service role key. Server-side only (env must not be NEXT_PUBLIC_).
 * Use only for operations that must bypass RLS (e.g. increment_application_view_count RPC).
 */
export function getSupabaseServiceRoleKey(): string {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) {
    throw new Error(
      'Missing SUPABASE_SERVICE_ROLE_KEY. Required only for server-side admin operations (e.g. view count RPC).'
    );
  }
  return key;
}
