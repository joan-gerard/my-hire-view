import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getSupabaseEnv } from '@/lib/supabase/env';

type CookieOptions = Parameters<NextResponse['cookies']['set']>[2];

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const next = requestUrl.searchParams.get('next') ?? '/admin';
  const response = NextResponse.redirect(new URL(next, requestUrl.origin));

  if (!code) {
    return response;
  }

  const { url, anonKey } = getSupabaseEnv();
  const cookieStore = await cookies();
  const supabase = createServerClient(url, anonKey, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value;
      },
      set(name: string, value: string, options: CookieOptions) {
        response.cookies.set(name, value, options);
      },
      remove(name: string, options: CookieOptions) {
        response.cookies.set(name, '', { ...options, maxAge: 0 });
      },
    },
  });

  await supabase.auth.exchangeCodeForSession(code);
  return response;
}
