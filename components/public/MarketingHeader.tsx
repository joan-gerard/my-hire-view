"use client";

import SignOutButton from "@/components/auth/SignOutButton";
import { headerEntrance } from "@/lib/landing-animations";
import type { User } from "@supabase/supabase-js";
import { motion } from "framer-motion";
import Link from "next/link";

interface MarketingHeaderProps {
  user: User | null;
}

/**
 * Header for the marketing/landing page (/). Shows logo and either
 * Dashboard + Sign out (when authenticated) or Sign in.
 */
export default function MarketingHeader({ user }: MarketingHeaderProps) {
  return (
    <motion.header
      className="fixed top-0 left-0 right-0 z-50 bg-[var(--background)]"
      initial={headerEntrance.initial}
      animate={headerEntrance.animate}
      transition={headerEntrance.transition}
    >
      <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <Link href="/">
              <h1 className="text-xl font-bold text-[var(--foreground)]">
                MyHireView
              </h1>
            </Link>
          </div>
          <div className="flex items-center gap-3">
            {user ? (
              <>
                <Link
                  href="/admin"
                  className="rounded-md bg-[var(--brand-primary)] px-4 py-2 text-sm font-semibold text-[var(--brand-primary-text)] hover:opacity-95"
                >
                  Dashboard
                </Link>
                <SignOutButton />
              </>
            ) : (
              <Link
                href="/login"
                className="rounded-md bg-[var(--brand-primary)] px-4 py-2 text-sm font-semibold text-[var(--brand-primary-text)] hover:opacity-95"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      </div>
    </motion.header>
  );
}
