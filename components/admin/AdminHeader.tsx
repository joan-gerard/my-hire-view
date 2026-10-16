"use client";

import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ADMIN_SHELL_CLASS } from "@/components/admin/admin-chrome";
import { LogoBlack } from "../ui/Logo";

const ADMIN_NAV_PILL_CLASS =
  "inline-flex items-center rounded-full px-3 py-1.5 text-sm font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ink)]";
const ADMIN_NAV_PILL_INACTIVE_CLASS =
  "bg-[var(--ink)]/[0.06] text-[var(--muted)] hover:bg-[var(--ink)]/[0.1] hover:text-[var(--ink)]";
const ADMIN_NAV_PILL_ACTIVE_CLASS =
  "bg-[var(--ink)] text-[var(--white)]";

interface AdminHeaderProps {
  user: User;
}

const ADMIN_NAV_LINKS = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/new", label: "New Application" },
  { href: "/admin/profile", label: "Profile" },
] as const;

/**
 * Navigation header for the admin area (/admin). Left: Dashboard, New Application,
 * Profile. Center: logo. Right: user email and sign out.
 */
export default function AdminHeader({ user }: AdminHeaderProps) {
  const pathname = usePathname();

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
    window.location.href = "/login";
  };

  return (
    <nav
      className="sticky top-0 z-30 border-b border-[var(--ink)]/10 bg-[var(--white)]/95 backdrop-blur-sm"
      aria-label="Admin"
    >
      <div className={ADMIN_SHELL_CLASS}>
        <div className="relative flex h-[72px] items-center">
          <div className="flex flex-1 items-center gap-2">
            {ADMIN_NAV_LINKS.map(({ href, label }) => {
              const isActive =
                href === "/admin"
                  ? pathname === "/admin"
                  : pathname.startsWith(href);
              return (
                <Link
                  key={href}
                  href={href}
                  className={`${ADMIN_NAV_PILL_CLASS} ${
                    isActive
                      ? ADMIN_NAV_PILL_ACTIVE_CLASS
                      : ADMIN_NAV_PILL_INACTIVE_CLASS
                  }`}
                >
                  {label}
                </Link>
              );
            })}
          </div>
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
            <LogoBlack />
          </div>
          <div className="flex flex-1 items-center justify-end gap-3">
            <span className="hidden text-sm text-[var(--muted)] sm:inline">
              {user.email}
            </span>
            <button
              type="button"
              onClick={handleSignOut}
              className={`cursor-pointer ${ADMIN_NAV_PILL_CLASS} ${ADMIN_NAV_PILL_INACTIVE_CLASS}`}
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
