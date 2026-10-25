import Link from "next/link";
import { VIEW_SHELL_CLASS } from "@/components/view/view-chrome";

type ApplicationViewFooterProps = {
  /** `light` for the live application page; `dark` for the unavailable empty state. */
  variant?: "light" | "dark";
};

/**
 * Compact footer for `/view/[publicId]/[slug]`. Kept short so branding
 * and legal links stay present without competing with the application.
 */
export default function ApplicationViewFooter({
  variant = "light",
}: ApplicationViewFooterProps) {
  const isDark = variant === "dark";

  return (
    <footer
      className={
        isDark
          ? "mt-auto border-t border-white/10 bg-[var(--ink)] text-[var(--white)]"
          : "mt-auto border-t border-[var(--ink)]/10 bg-[var(--white)] text-[var(--ink)]"
      }
    >
      <div
        className={`${VIEW_SHELL_CLASS} flex flex-col items-center justify-between gap-3 py-4 text-center sm:flex-row sm:gap-4 sm:text-left`}
      >
        <Link
          href="/"
          className={
            isDark
              ? "text-sm font-medium text-white/80 transition-colors hover:text-white focus:outline-none focus-visible:underline"
              : "text-sm font-medium text-[var(--muted)] transition-colors hover:text-[var(--ink)] focus:outline-none focus-visible:underline"
          }
        >
          MyHireView
        </Link>

        <nav
          className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1"
          aria-label="Legal links"
        >
          <Link href="/terms" className={linkClass(isDark)}>
            Terms
          </Link>
          <Link href="/privacy" className={linkClass(isDark)}>
            Privacy
          </Link>
          <Link href="/cookies" className={linkClass(isDark)}>
            Cookies
          </Link>
        </nav>

        <p
          className={
            isDark ? "text-xs text-white/50" : "text-xs text-[var(--muted)]"
          }
        >
          © 2026 MyHireView
        </p>
      </div>
    </footer>
  );
}

function linkClass(isDark: boolean): string {
  return isDark
    ? "text-xs text-white/55 transition-colors hover:text-white focus:outline-none focus-visible:underline"
    : "text-xs text-[var(--muted)] transition-colors hover:text-[var(--ink)] focus:outline-none focus-visible:underline";
}
