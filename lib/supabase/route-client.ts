import { createServerClient } from '@supabase/ssr';
import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseEnv } from './env';

/** Cookie options type used when setting cookies on a NextResponse. */
export type CookieOptions = Parameters<NextResponse['cookies']['set']>[2];

export interface RouteClientOptions {
  request: NextRequest;
  response: NextResponse;
}

/**
 * Creates a Supabase server client that reads cookies from the request
 * and writes session cookies to the given response. Use this in API route
 * handlers (login, signup, logout) so the response carries Set-Cookie headers.
 */
export function createSupabaseRouteClient({
  request,
  response,
}: RouteClientOptions) {
  const { url, anonKey } = getSupabaseEnv();

  return createServerClient(url, anonKey, {
    cookies: {
      get(name: string) {
        return request.cookies.get(name)?.value;
      },
      set(name: string, value: string, options: CookieOptions) {
        response.cookies.set(name, value, options);
      },
      remove(name: string, options: CookieOptions) {
        response.cookies.set(name, '', { ...options, maxAge: 0 });
      },
    },
  });
}
