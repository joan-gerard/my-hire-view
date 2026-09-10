import type { User } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { getUser } from "@/lib/auth";
import { handleApiError } from "@/lib/api/handle-api-error";

export type AuthOk = { ok: true; user: User };
export type AuthFail = { ok: false; response: NextResponse };
export type AuthResult = AuthOk | AuthFail;

/**
 * API-route auth gate. Returns `{ ok: true, user }` when a session exists,
 * or `{ ok: false, response }` with:
 * - **401** JSON when there is no session
 * - **500** JSON when Auth lookup fails (outage / unexpected error)
 *
 * Unlike `requireAuth()` (pages/layouts — redirects to `/login`), this never
 * redirects and never throws: missing sessions and Auth infrastructure
 * failures both become `{ ok: false, response }` so route handlers can
 * `return auth.response` without a surrounding try/catch for auth.
 */
export async function withAuth(): Promise<AuthResult> {
  try {
    const user = await getUser();
    if (!user) {
      return {
        ok: false,
        response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
      };
    }
    return { ok: true, user };
  } catch (error) {
    return {
      ok: false,
      response: handleApiError("withAuth", error),
    };
  }
}
