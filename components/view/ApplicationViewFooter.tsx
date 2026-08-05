import Link from "next/link";

type ApplicationViewFooterProps = {
  /** `light` for the live application page; `dark` for the unavailable empty state. */
  variant?: "light" | "dark";
};

/**
 * Compact footer for `/view/[publicId]/[slug]`. Kept short so branding
 * and legal links stay present without competing with the application.
 * (Marketing pages use the larger `ViewPageFooter` via `Footer`.)
 */
export default function ApplicationViewFooter({
  variant = "light",
}: ApplicationViewFooterProps) {
  const isDark = variant === "dark";

  return (
    <footer
      className={
        isDark
          ? "mt-auto border-t border-white/10 bg-black text-white"
          : "mt-10 border-t border-black/8 bg-background text-foreground"
      }
    >
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-4 py-4 text-center sm:flex-row sm:gap-4 sm:text-left md:px-6">
        <Link
          href="/"
          className={
            isDark
              ? "text-sm font-medium text-white/80 transition-colors hover:text-white focus:outline-none focus-visible:underline"
              : "text-sm font-medium text-(--foreground)/70 transition-colors hover:text-foreground focus:outline-none focus-visible:underline"
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
        </nav>

        <p
          className={
            isDark
              ? "text-xs text-white/50"
              : "text-xs text-(--foreground)/45"
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
    : "text-xs text-(--foreground)/50 transition-colors hover:text-(--foreground)/80 focus:outline-none focus-visible:underline";
}
