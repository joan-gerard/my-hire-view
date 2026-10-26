"use client";

import { ADMIN_HEADER_INSET_CLASS } from "@/components/admin/admin-chrome";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLayoutEffect, useRef } from "react";
import { LogoBlack } from "../ui/Logo";

const ADMIN_NAV_PILL_CLASS =
  "inline-flex shrink-0 items-center rounded-full px-3 py-1.5 text-sm font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ink)]";
const ADMIN_NAV_PILL_INACTIVE_CLASS =
  "bg-[var(--ink)]/[0.06] text-[var(--muted)] hover:bg-[var(--ink)]/[0.1] hover:text-[var(--ink)]";
const ADMIN_NAV_PILL_ACTIVE_CLASS = "bg-[var(--ink)] text-[var(--white)]";

const ADMIN_NAV_LINKS = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/new", label: "New Application" },
  { href: "/admin/profile", label: "Profile" },
] as const;

/**
 * Admin header, aligned with the marketing header: full width, logo on the
 * left, nav in the center, account actions on the right.
 * Below 720px the nav drops to its own row so the logo and Sign Out stay put.
 */
export default function AdminHeader() {
  const pathname = usePathname();
  const navRef = useRef<HTMLElement>(null);

  // Dashboard toolbar / day labels stick under this bar. Height changes when the nav wraps.
  useLayoutEffect(() => {
    const nav = navRef.current;
    if (!nav) return;

    const sync = () => {
      document.documentElement.style.setProperty(
        "--admin-header-height",
        `${Math.ceil(nav.getBoundingClientRect().height)}px`,
      );
    };

    sync();
    const observer = new ResizeObserver(sync);
    observer.observe(nav);
    return () => {
      observer.disconnect();
      document.documentElement.style.removeProperty("--admin-header-height");
    };
  }, []);

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
    window.location.href = "/login";
  };

  return (
    <header
      ref={navRef}
      className="sticky top-0 z-50 border-b border-[var(--ink)]/10 bg-[var(--white)]/95 backdrop-blur-sm"
    >
      <div
        className={`relative py-4 min-[720px]:min-h-[102px] min-[720px]:py-[30px] ${ADMIN_HEADER_INSET_CLASS}`}
      >
        <div className="flex items-center justify-between gap-4">
          <LogoBlack />
          <button
            type="button"
            onClick={handleSignOut}
            className={`cursor-pointer ${ADMIN_NAV_PILL_CLASS} ${ADMIN_NAV_PILL_INACTIVE_CLASS}`}
          >
            Sign Out
          </button>
        </div>
        <nav
          aria-label="Admin"
          className="mt-3 flex gap-1 overflow-x-auto pb-0.5 [-ms-overflow-style:none] [scrollbar-width:none] min-[720px]:absolute min-[720px]:left-1/2 min-[720px]:top-1/2 min-[720px]:mt-0 min-[720px]:-translate-x-1/2 min-[720px]:-translate-y-1/2 min-[720px]:overflow-visible min-[720px]:pb-0 [&::-webkit-scrollbar]:hidden"
        >
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
        </nav>
      </div>
    </header>
  );
}
