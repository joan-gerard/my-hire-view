"use client";

import { AvatarIcon } from "@/components/admin/icons";
import { headerEntrance } from "@/lib/landing-animations";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";
import { motion } from "framer-motion";
import Link from "next/link";
import type { RefObject } from "react";
import { useEffect, useRef, useState } from "react";
import { LogoGradient } from "../ui/Logo";

interface MarketingHeaderProps {
  user: User | null;
}

const MARKETING_NAV_LINKS = [
  { href: "/how-it-works", label: "How it Works" },
  { href: "/pricing", label: "Pricing" },
  { href: "/blog", label: "Blog" },
] as const;

const handleSignOut = async () => {
  const supabase = createClient();
  await supabase.auth.signOut();
  await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
  window.location.href = "/login";
};

/**
 * Header for the marketing/landing page (/). Left: nav (How it Works, Pricing,
 * Blog). Center: logo. Right: avatar dropdown with Dashboard + Sign out (when
 * authenticated) or Sign in (when not).
 */
export default function MarketingHeader({ user }: MarketingHeaderProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setDropdownOpen(false);
      }
    }
    if (dropdownOpen) {
      document.addEventListener("click", handleClickOutside);
    }
    return () => document.removeEventListener("click", handleClickOutside);
  }, [dropdownOpen]);

  return (
    <motion.header
      className="fixed top-0 left-0 right-0 z-50"
      initial={headerEntrance.initial}
      animate={headerEntrance.animate}
      transition={headerEntrance.transition}
    >
      <div className="mx-auto py-4 px-24">
        <div className="relative flex justify-between items-center rounded-2xl bg-white px-4 py-2 shadow-sm shadow-black/15">
          <div className="">
            <LogoGradient />
          </div>

          <nav
            className="flex flex-1 justify-end items-center gap-6"
            aria-label="Main"
          >
            {MARKETING_NAV_LINKS.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                id="marketing-nav-link"
                className="text-base font-medium text-foreground/80 hover:text-foreground"
              >
                {label}
              </Link>
            ))}
            <UserDropdown
              user={user}
              dropdownOpen={dropdownOpen}
              setDropdownOpen={setDropdownOpen}
              dropdownRef={dropdownRef}
            />
          </nav>
        </div>
      </div>
    </motion.header>
  );
}

interface UserDropdownProps {
  user: User | null;
  dropdownOpen: boolean;
  setDropdownOpen: (open: boolean) => void;
  dropdownRef: RefObject<HTMLDivElement | null>;
}

function UserDropdown({
  user,
  dropdownOpen,
  setDropdownOpen,
  dropdownRef,
}: UserDropdownProps) {
  return (
    <div className="relative shrink-0" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setDropdownOpen(!dropdownOpen)}
        className="flex h-10 w-10 items-center justify-center rounded-full bg-(--foreground)/10 text-foreground hover:bg-(--foreground)/20 focus:outline-none focus:ring-(--brand-primary) focus:ring-offset-2"
        aria-label={user ? "Open account menu" : "Open menu"}
        aria-expanded={dropdownOpen}
        aria-haspopup="true"
      >
        <AvatarIcon className="h-5 w-5" />
      </button>
      {dropdownOpen && (
        <div
          className="absolute -right-4 top-full z-50 mt-3 w-48 rounded-2xl border border-(--foreground)/10 bg-white py-1 shadow-sm shadow-black/15"
          role="menu"
        >
          {user ? (
            <>
              <Link
                href="/admin"
                className="block w-full px-4 py-2.5 text-left text-sm font-medium text-foreground hover:bg-(--secondary-background)"
                role="menuitem"
                onClick={() => setDropdownOpen(false)}
              >
                Dashboard
              </Link>
              <button
                type="button"
                className="block w-full px-4 py-2.5 text-left text-sm font-medium text-foreground hover:bg-(--secondary-background)"
                role="menuitem"
                onClick={() => {
                  setDropdownOpen(false);
                  void handleSignOut();
                }}
              >
                Sign Out
              </button>
            </>
          ) : (
            <Link
              href="/login"
              className="block w-full px-4 py-2.5 text-left text-sm font-medium text-foreground hover:bg-(--secondary-background)"
              role="menuitem"
              onClick={() => setDropdownOpen(false)}
            >
              Sign In
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
