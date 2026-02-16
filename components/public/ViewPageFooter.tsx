"use client";

import Link from "next/link";

const SLOGAN = "Your video pitch, one link.";

/**
 * Footer for the public application view page (/view/[slug]).
 * Shown only to non-owners (recruiters/visitors). Displays app branding,
 * legal links, copyright, and social links.
 */
export default function ViewPageFooter() {
  return (
    <footer className="mt-12 border-t border-slate-700/50 px-4 py-10 sm:px-6 lg:px-12">
      <div className="mx-auto">
        {/* Logo and slogan — centered */}
        <div className="flex flex-col items-center gap-2 text-center">
          <Link
            href="/"
            className="text-4xl font-bold text-white transition-colors hover:text-slate-200"
          >
            HireView
          </Link>
          <p className="text-lg text-slate-400">{SLOGAN}</p>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-4 border-t border-slate-700/50 pt-8 text-center lg:grid-cols-3 lg:gap-6">
          {/* 1. Terms & Privacy */}
          <div className="flex flex-col items-center lg:items-start gap-2 order-3 lg:order-1">
            <nav
              className="flex flex-wrap justify-center gap-x-4 gap-y-1"
              aria-label="Legal links"
            >
              <Link
                href="/terms"
                className="text-sm text-slate-300 hover:text-white"
              >
                Terms of Service
              </Link>
              <Link
                href="/privacy"
                className="text-sm text-slate-300 hover:text-white"
              >
                Privacy Policy
              </Link>
            </nav>
          </div>

          {/* 2. Copyright */}
          <div className="flex flex-col items-center justify-center order-2 sm:items-center">
            <p className="text-sm text-slate-400">
              © 2026 MyHireView. All rights reserved.
            </p>
          </div>

          {/* 3. Socials */}
          <div className="flex flex-col items-center lg:items-end gap-2 order-1 sm:items-center lg:order-3">
            <nav
              className="flex items-center justify-center gap-4"
              aria-label="Social links"
            >
              <a
                href="https://twitter.com/myhireview"
                target="_blank"
                rel="noopener noreferrer"
                className="text-slate-400 hover:text-white"
                aria-label="Twitter / X"
              >
                <TwitterIcon className="h-5 w-5" />
              </a>
              <a
                href="https://www.linkedin.com/company/myhireview"
                target="_blank"
                rel="noopener noreferrer"
                className="text-slate-400 hover:text-white"
                aria-label="LinkedIn"
              >
                <LinkedInIcon className="h-5 w-5" />
              </a>
            </nav>
          </div>
        </div>
      </div>
    </footer>
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
