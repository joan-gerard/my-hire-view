/**
 * Data and config for MarketingHeader. Kept in a separate module so nav links
 * can be reused (e.g. tests, docs) and styling tokens stay in one place.
 */

/** Background when mobile menu is open. Light gray; matches --header-mobile-menu-bg in globals.css. */
export const MOBILE_MENU_BG = "#dbdad9";

export const MARKETING_NAV_LINKS = [
  { href: "/how-it-works", label: "How it Works" },
  { href: "/pricing", label: "Pricing" },
  { href: "/blog", label: "Blog" },
] as const;
