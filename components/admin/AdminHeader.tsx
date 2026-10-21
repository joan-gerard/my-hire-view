"use client";

import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLayoutEffect, useRef } from "react";
import { ADMIN_SHELL_CLASS } from "@/components/admin/admin-chrome";
import { LogoBlack } from "../ui/Logo";

const ADMIN_NAV_PILL_CLASS =
  "inline-flex shrink-0 items-center rounded-full px-3 py-1.5 text-sm font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ink)]";
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
 * Navigation header for the admin area (/admin).
 * Narrow: logo + Sign Out on the first row; nav pills scroll on the next.
 * md+: left nav, centered logo, email + Sign Out (single link set — no duplicate DOM).
 */
export default function AdminHeader({ user }: AdminHeaderProps) {
  const pathname = usePathname();
  const navRef = useRef<HTMLElement>(null);

  // Day labels stick just under this bar. Height changes when the nav wraps.
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
    <nav
      ref={navRef}
      className="sticky top-0 z-30 border-b border-[var(--ink)]/10 bg-[var(--white)]/95 backdrop-blur-sm"
      aria-label="Admin"
    >
      <div className={ADMIN_SHELL_CLASS}>
        <div className="relative flex flex-wrap items-center gap-x-3 gap-y-2 py-3 md:h-[72px] md:flex-nowrap md:py-0">
          <div className="order-1 md:absolute md:left-1/2 md:top-1/2 md:order-none md:-translate-x-1/2 md:-translate-y-1/2">
            <LogoBlack />
          </div>
          <div className="order-3 flex w-full gap-2 overflow-x-auto pb-0.5 [-ms-overflow-style:none] [scrollbar-width:none] md:order-1 md:w-auto md:flex-1 md:overflow-visible md:pb-0 [&::-webkit-scrollbar]:hidden">
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
          <div className="order-2 ml-auto flex items-center gap-3 md:order-3 md:ml-0 md:flex-1 md:justify-end">
            <span className="hidden text-sm text-[var(--muted)] lg:inline">
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
