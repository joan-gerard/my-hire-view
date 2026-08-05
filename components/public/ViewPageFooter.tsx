"use client";

import { fadeUp, viewport } from "@/lib/landing-animations";
import { motion } from "framer-motion";
import Link from "next/link";

const SLOGAN = "Your video pitch, one link.";

/**
 * Full marketing footer (landing and other marketing routes via `Footer`).
 * Public application pages use the compact `ApplicationViewFooter` instead.
 * Explicit black background and white text (no CSS variables) to match the
 * homepage (Problem, FAQ, CTA sections). Same container, typography, and
 * motion as other landing sections.
 */
export default function ViewPageFooter() {
  return (
    <motion.footer
      className="mt-12 border-t border-white/10 bg-black text-white"
      initial={fadeUp.initial}
      whileInView={fadeUp.whileInView}
      viewport={viewport}
      transition={fadeUp.transition}
    >
      <div className="px-4 md:px-6 lg:px-10 2xl:px-12 pt-12 pb-10 lg:pt-16 lg:pb-12 max-w-[1700px] mx-auto">
        {/* Logo and slogan — centered, light typography to match landing headlines */}
        <div className="flex flex-col items-center gap-2 text-center">
          <Link
            href="/"
            className="text-3xl sm:text-4xl font-light tracking-tight text-white transition-colors hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-white/20 focus:ring-offset-2 focus:ring-offset-black rounded-sm"
          >
            MyHireView
          </Link>
          <p className="text-base sm:text-lg text-white/70">{SLOGAN}</p>
        </div>

        <div className="mt-10 lg:mt-12 grid grid-cols-1 gap-6 border-t border-white/10 pt-8 lg:pt-10 text-center lg:grid-cols-3 lg:gap-8">
          {/* 1. Terms & Privacy */}
          <div className="flex flex-col items-center lg:items-start gap-2 order-3 lg:order-1">
            <nav
              className="flex flex-wrap justify-center gap-x-5 gap-y-1"
              aria-label="Legal links"
            >
              <Link
                href="/terms"
                className="text-sm text-white/70 transition-colors hover:text-white focus:outline-none focus:underline rounded-sm"
              >
                Terms of Service
              </Link>
              <Link
                href="/privacy"
                className="text-sm text-white/70 transition-colors hover:text-white focus:outline-none focus:underline rounded-sm"
              >
                Privacy Policy
              </Link>
            </nav>
          </div>

          {/* 2. Copyright */}
          <div className="flex flex-col items-center justify-center order-2 sm:items-center">
            <p className="text-sm text-white/60">
              © 2026 MyHireView. All rights reserved.
            </p>
          </div>

          {/* 3. Socials */}
          <div className="flex flex-col items-center lg:items-end gap-2 order-1 sm:items-center lg:order-3">
            <nav
              className="flex items-center justify-center gap-5"
              aria-label="Social links"
            >
              <a
                href="https://twitter.com/myhireview"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white/60 transition-colors hover:text-white focus:outline-none focus:ring-2 focus:ring-white/20 focus:ring-offset-2 focus:ring-offset-black rounded-full p-1"
                aria-label="Twitter / X"
              >
                <TwitterIcon className="h-5 w-5" />
              </a>
              <a
                href="https://www.linkedin.com/company/myhireview"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white/60 transition-colors hover:text-white focus:outline-none focus:ring-2 focus:ring-white/20 focus:ring-offset-2 focus:ring-offset-black rounded-full p-1"
                aria-label="LinkedIn"
              >
                <LinkedInIcon className="h-5 w-5" />
              </a>
            </nav>
          </div>
        </div>
      </div>
    </motion.footer>
  );
}

function TwitterIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="currentColor"
      viewBox="0 0 24 24"
      aria-hidden
    >
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function LinkedInIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="currentColor"
      viewBox="0 0 24 24"
      aria-hidden
    >
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}
