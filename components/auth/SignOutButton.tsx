"use client";

import { createClient } from "@/lib/supabase/client";

export default function SignOutButton() {
  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
    window.location.href = "/login";
  };

  return (
    <button
      onClick={handleSignOut}
      className="ml-4 rounded-md bg-[var(--brand-secondary)] px-3 py-2 text-sm font-semibold text-[var(--brand-secondary-text)] shadow-sm ring-1 ring-inset ring-[var(--foreground)]/20 hover:opacity-90"
    >
      Sign out
    </button>
  );
}
