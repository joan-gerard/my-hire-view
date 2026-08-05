/**
 * Data and config for MarketingHeader. Kept in a separate module so nav links
 * can be reused (e.g. tests, docs) and styling tokens stay in one place.
 */

/** Background when mobile menu is open. Light gray; matches --header-mobile-menu-bg in globals.css. */
export const MOBILE_MENU_BG = "#ebebeb";

/** Same color as MOBILE_MENU_BG with alpha 0. Use for animating header bg (Framer Motion does not tween the "transparent" keyword well). */
export const MOBILE_MENU_BG_TRANSPARENT = "rgba(219, 218, 217, 0)";

/** Public marketing nav. `/how-it-works` and `/blog` removed pre-launch (A4-011); rebuild later via J3. */
export const MARKETING_NAV_LINKS = [
  { href: "/pricing", label: "Pricing" },
] as const;
