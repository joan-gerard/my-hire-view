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
      className="bg-[var(--background)] shadow-sm border-b border-white/10"
      initial={headerEntrance.initial}
      animate={headerEntrance.animate}
      transition={headerEntrance.transition}
    >
      <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <Link href="/">
              <h1 className="text-xl font-bold text-white">MyHireView</h1>
            </Link>
          </div>
          <div className="flex items-center gap-3">
            {user ? (
              <>
                <Link
                  href="/admin"
                  className="rounded-md bg-[var(--brand-primary)] px-4 py-2 text-sm font-semibold text-white hover:opacity-95"
                >
                  Dashboard
                </Link>
                <SignOutButton />
              </>
            ) : (
              <Link
                href="/login"
                className="rounded-md bg-[var(--brand-primary)] px-4 py-2 text-sm font-semibold text-white hover:opacity-95"
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
