import Link from "next/link";

/**
 * Wordmark used on the marketing navbar (and product/auth surfaces).
 * Font comes from `#logo` in `app/globals.css` (Varela Round).
 */
export function LogoWhite() {
  return (
    <Link
      href="/"
      id="logo"
      className="flex items-center gap-2 text-xl font-medium text-white"
      aria-label="MyHireView home"
    >
      MyHireView
    </Link>
  );
}

export function LogoBlack() {
  return (
    <Link
      href="/"
      id="logo"
      className="flex items-center gap-2 text-xl font-medium text-black"
      aria-label="MyHireView home"
    >
      MyHireView
    </Link>
  );
}
