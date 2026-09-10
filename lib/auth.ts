import { isAuthSessionMissingError } from "@supabase/supabase-js";
import { redirect } from "next/navigation";
import { createClient } from "./supabase/server";

/**
 * Current Auth user from the request session cookies, or `null` when there is
 * no session (`AuthSessionMissingError` is treated as signed out).
 *
 * Other Auth / network failures are thrown so callers do not mislabel an
 * outage as “not logged in.”
 */
export async function getUser() {
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

export async function requireAuth() {
  const user = await getUser();
  if (!user) {
    redirect("/login");
  }
  return user;
}
