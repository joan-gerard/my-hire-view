"use client";

import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogoGradient } from "../ui/Logo";
import SecondaryButton from "../ui/SecondaryButton";

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
      className="border-b border-[var(--foreground)]/10 bg-[var(--secondary-background)] shadow-sm"
      aria-label="Admin"
    >
      <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8">
        <div className="relative flex h-16 items-center">
          <div className="flex flex-1 items-center gap-6">
            {ADMIN_NAV_LINKS.map(({ href, label }) => {
              const isActive =
                href === "/admin"
                  ? pathname === "/admin"
                  : pathname.startsWith(href);
              return (
                <Link
                  key={href}
                  href={href}
                  className={`inline-flex items-center border-b-2 px-1 pt-1 text-sm font-medium ${
                    isActive
                      ? "border-[var(--brand-primary)] text-[var(--foreground)]"
                      : "border-transparent text-[var(--foreground)]/80 hover:border-[var(--foreground)]/20 hover:text-[var(--foreground)]"
                  }`}
                >
                  {label}
                </Link>
              );
            })}
          </div>
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
            <LogoGradient />
          </div>
          <div className="flex flex-1 items-center justify-end gap-3">
            <span className="text-sm text-[var(--foreground)]/80">
              {user.email}
            </span>
            <SecondaryButton label="Sign Out" onClick={handleSignOut} />
          </div>
        </div>
      </div>
    </nav>
  );
}
