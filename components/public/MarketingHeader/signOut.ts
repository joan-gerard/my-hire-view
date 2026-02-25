import { createClient } from "@/lib/supabase/client";

/**
 * Signs out the current user (Supabase + app session) and redirects to /login.
 * Used by MarketingHeader desktop dropdown and mobile menu.
 */
export async function handleSignOut(): Promise<void> {
  const supabase = createClient();
  await supabase.auth.signOut();
  await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
  window.location.href = "/login";
}
