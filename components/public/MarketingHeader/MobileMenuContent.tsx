"use client";

import type { User } from "@supabase/supabase-js";
import { motion } from "framer-motion";
import Link from "next/link";
import { MARKETING_NAV_LINKS } from "./constants";
import { handleSignOut } from "./signOut";

interface MobileMenuContentProps {
  user: User | null;
  onClose: () => void;
}

export function MobileMenuContent({ user, onClose }: MobileMenuContentProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="flex flex-col md:hidden px-4 pb-8 overflow-y-auto"
    >
      <nav className="flex flex-col gap-2 pt-10" aria-label="Main mobile">
        {MARKETING_NAV_LINKS.map(({ href, label }) => (
          <Link
            key={href}
            href={href}
            id="marketing-nav-link-mobile"
            className="bg-white rounded-lg px-4 py-5 text-lg font-light text-black"
            onClick={onClose}
          >
            {label}
          </Link>
        ))}
      </nav>
      <div className="mt-6 border-t border-(--foreground)/10 pt-6 flex flex-col gap-2 justify-center items-center">
        {user ? (
          <>
            <Link
              href="/admin"
              className="flex w-40 items-center justify-center rounded-2xl px-4 py-2 text-lg font-light text-white bg-black hover:bg-black/80"
              onClick={onClose}
            >
              Dashboard
            </Link>
            <button
              type="button"
              className="flex w-40 items-center justify-center rounded-2xl px-4 py-2 text-lg font-light text-black bg-white hover:bg-white/80"
              onClick={() => {
                onClose();
                void handleSignOut();
              }}
            >
              Sign Out
            </button>
          </>
        ) : (
          <Link
            href="/login"
            className="flex w-40 items-center justify-center rounded-2xl px-4 py-2 text-lg font-light text-white bg-black hover:bg-black/80"
            onClick={onClose}
          >
            Sign In
          </Link>
        )}
      </div>
    </motion.div>
  );
}
