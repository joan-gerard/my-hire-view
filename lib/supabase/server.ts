import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { getSupabaseEnv } from './env';

type CookieOptions = {
  domain?: string;
  path?: string;
  maxAge?: number;
  expires?: Date;
  httpOnly?: boolean;
  secure?: boolean;
  sameSite?: 'lax' | 'strict' | 'none';
};

export async function createClient() {
  const cookieStore = await cookies();
  const { url, anonKey } = getSupabaseEnv();

  return createServerClient(url, anonKey, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value;
      },
      set(name: string, value: string, options: CookieOptions) {
        try {
          cookieStore.set(name, value, options);
        } catch (error) {
          if (process.env.NODE_ENV !== 'production') {
            console.warn('Supabase server cookie write skipped:', error);
          }
          // The `set` method was called from a Server Component.
          // This can be ignored if you have the proxy refreshing
          // user sessions.
        }
      },
      remove(name: string, options: CookieOptions) {
        try {
          cookieStore.set(name, '', { ...options, maxAge: 0 });
        } catch (error) {
          if (process.env.NODE_ENV !== 'production') {
            console.warn('Supabase server cookie removal skipped:', error);
          }
        }
      },
    },
  });
}
