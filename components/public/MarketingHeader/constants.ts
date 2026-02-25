/**
 * Data and config for MarketingHeader. Kept in a separate module so nav links
 * can be reused (e.g. tests, docs) and styling tokens stay in one place.
 */

/** Light orange when mobile menu is open. Matches --header-mobile-menu-bg in globals.css. */
export const MOBILE_MENU_BG = "#ffedd5";

export const MARKETING_NAV_LINKS = [
  { href: "/how-it-works", label: "How it Works" },
  { href: "/pricing", label: "Pricing" },
  { href: "/blog", label: "Blog" },
] as const;
