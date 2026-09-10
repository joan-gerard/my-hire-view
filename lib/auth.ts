import type { User } from "@supabase/supabase-js";
import { isAuthSessionMissingError } from "@supabase/supabase-js";
import { redirect } from "next/navigation";
import { createClient } from "./supabase/server";

/**
 * Resolve the Auth user from request cookies.
 *
 * - No session (`AuthSessionMissingError` or null user) → `null`
 * - Other Auth / network failures → **throws** (do not treat as signed out)
 *
 * Prefer {@link getUser} for optional UI (never throws). Prefer this (or
 * `withAuth` / `requireAuth`) when a missing user must not mask an outage.
 */
export async function getSessionUser(): Promise<User | null> {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error && !isAuthSessionMissingError(error)) {
    throw error;
  }

  return user;
}

/**
 * Best-effort current user for optional UI (e.g. marketing header).
 * Missing session **or** Auth lookup failure → `null` (failures are logged).
 * Does not throw, so public pages stay up during an Auth outage.
 */
export async function getUser(): Promise<User | null> {
  try {
    return await getSessionUser();
  } catch (error) {
    console.error("getUser:", error);
    return null;
  }
}

/**
 * Pages/layouts that require a signed-in user. Redirects to `/login` when
 * there is no session. Auth infrastructure failures propagate (do not fake a
 * redirect-as-signed-out).
 */
export async function requireAuth() {
  const user = await getSessionUser();
  if (!user) {
    redirect("/login");
  }
  return user;
}
