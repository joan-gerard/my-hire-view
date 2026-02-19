"use client";

import { headerEntrance } from "@/lib/landing-animations";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";
import { motion } from "framer-motion";
import Link from "next/link";
import Logo from "../ui/Logo";
import PrimaryLinkButton from "../ui/PrimaryLinkButton";
import SecondaryButton from "../ui/SecondaryButton";

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
 * Blog). Center: logo. Right: Dashboard + Sign out (when authenticated) or Sign in.
 */
export default function MarketingHeader({ user }: MarketingHeaderProps) {
  return (
    <motion.header
      className="fixed top-0 left-0 right-0 z-50 bg-background"
      initial={headerEntrance.initial}
      animate={headerEntrance.animate}
      transition={headerEntrance.transition}
    >
      <div className="mx-auto py-6 px-16">
        <div className="relative flex items-center">
          <nav className="flex flex-1 items-center gap-6" aria-label="Main">
            {MARKETING_NAV_LINKS.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className="text-base font-medium text-(--foreground)/80 hover:text-foreground"
              >
                {label}
              </Link>
            ))}
          </nav>
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
            <Logo />
          </div>
          <div className="flex flex-1 items-center justify-end gap-3">
            {user ? (
              <>
                <PrimaryLinkButton href="/admin" label="Dashboard" />
                <SecondaryButton label="Sign Out" onClick={handleSignOut} />
              </>
            ) : (
              <PrimaryLinkButton href="/login" label="Sign In" />
            )}
          </div>
        </div>
      </div>
    </motion.header>
  );
}
