/**
 * Shared admin / product chrome (F34).
 * White page + bordered panels (Reslink-style dashboard density).
 * Reserve `--paper` for quiet chips / nested wells — not the admin page wash.
 */

/** Dashboard and profile content width. */
export const ADMIN_SHELL_CLASS = "mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8";

/**
 * Horizontal inset of the admin header. Create and edit pages use the same
 * inset so their content lines up with the logo and Sign Out.
 */
export const ADMIN_HEADER_INSET_CLASS = "px-4 min-[720px]:px-[30px]";

/**
 * Min height for admin main skeletons / loading shells.
 * Header is at least 102px from 720px up (marketing header height); main has
 * py-8 (4rem). Keeps content tall enough that the document scrollbar does not
 * vanish during route transitions.
 */
export const ADMIN_MAIN_MIN_CLASS = "min-h-[calc(100svh-102px-4rem)]";

/** Primary CTA — ink pill (Publish, View, dialog confirm). */
export const ADMIN_PRIMARY_CLASS =
  "inline-flex shrink-0 cursor-pointer items-center justify-center gap-1.5 rounded-full bg-[var(--ink)] px-3.5 py-1.5 text-sm font-semibold text-[var(--white)] hover:opacity-95 focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ink)] disabled:cursor-not-allowed disabled:opacity-40";

/** Loud accent CTA — lime + ink (Create / New application). */
export const ADMIN_ACCENT_PRIMARY_CLASS =
  "inline-flex shrink-0 cursor-pointer items-center justify-center gap-1.5 rounded-full bg-[var(--lime)] px-4 py-2 text-sm font-semibold text-[var(--ink)] hover:opacity-90 focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ink)] disabled:cursor-not-allowed disabled:opacity-40";

/** Icon-only accent CTA — lime circle (Create application). */
export const ADMIN_ICON_ACCENT_PRIMARY_CLASS =
  "inline-flex size-11 shrink-0 cursor-pointer items-center justify-center rounded-full bg-[var(--lime)] text-[var(--ink)] hover:opacity-90 focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ink)] disabled:cursor-not-allowed disabled:opacity-40";

/** Secondary control — white chip with border. */
export const ADMIN_SECONDARY_CLASS =
  "inline-flex shrink-0 cursor-pointer items-center justify-center gap-1.5 rounded-xl border border-[var(--ink)]/12 bg-[var(--white)] px-3 py-1.5 text-sm font-medium text-[var(--ink)] hover:bg-[var(--ink)]/[0.04] focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ink)] disabled:cursor-not-allowed disabled:opacity-40";

/** Icon-only secondary control — equal padding on all sides. */
export const ADMIN_ICON_SECONDARY_CLASS =
  "inline-flex shrink-0 cursor-pointer items-center justify-center rounded-xl border border-[var(--ink)]/12 bg-[var(--white)] p-2 text-[var(--ink)] hover:bg-[var(--ink)]/[0.04] focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ink)] disabled:cursor-not-allowed disabled:opacity-40";

/** Disabled / unavailable action chrome on cards. */
export const ADMIN_DISABLED_CLASS =
  "inline-flex shrink-0 items-center gap-1.5 rounded-xl border border-[var(--ink)]/10 bg-[var(--white)] px-3 py-1.5 text-sm font-medium text-[var(--muted)]";

/** Icon-only disabled / unavailable chrome on cards. */
export const ADMIN_ICON_DISABLED_CLASS =
  "inline-flex shrink-0 items-center justify-center rounded-xl border border-[var(--ink)]/10 bg-[var(--white)] p-2 text-[var(--muted)]";

/** Soft panel — white fill + light border on paper page. */
export const ADMIN_PANEL_CLASS =
  "rounded-2xl border border-[var(--ink)]/10 bg-[var(--white)]";

/**
 * Create/edit form outer shell — the single bordered white box on the paper page.
 * Wizard chrome and field groups stay flat inside (no nested cards).
 */
export const ADMIN_FORM_SHELL_CLASS =
  `${ADMIN_PANEL_CLASS} p-4 sm:p-6`;

/** Inline tip / nudge banner on form pages. */
export const ADMIN_TIP_CLASS =
  "rounded-xl border border-[var(--ink)]/10 bg-[var(--white)] px-4 py-3 text-sm text-[var(--ink)]";

/**
 * Field group inside the form shell. No border/fill — nesting a second white
 * card inside `ADMIN_FORM_SHELL_CLASS` squeezes width and reads as box-in-box.
 */
export const ADMIN_FIELDSET_CLASS = "";

/** List row inside a dashboard panel (hairline divider, no nested card). */
export const ADMIN_LIST_ROW_CLASS =
  "border-b border-[var(--ink)]/8 last:border-b-0";
