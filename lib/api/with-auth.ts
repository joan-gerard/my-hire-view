import type { User } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { getUser } from "@/lib/auth";

export type AuthOk = { ok: true; user: User };
export type AuthFail = { ok: false; response: NextResponse };
export type AuthResult = AuthOk | AuthFail;

/**
 * API-route auth gate. Returns `{ ok: true, user }` when a session exists,
 * or `{ ok: false, response }` with **401** JSON when it does not.
 *
 * Unlike `requireAuth()` (pages/layouts — redirects to `/login`), this never
 * redirects and never throws for a missing session, so route `catch` blocks
 * can treat remaining errors as real failures (**500**), not unauthorized.
 */
export async function withAuth(): Promise<AuthResult> {
  const user = await getUser();
  if (!user) {
    return {
      ok: false,
      response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }
  return { ok: true, user };
}
