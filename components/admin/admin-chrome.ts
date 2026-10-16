/**
 * Shared admin / product chrome (F34).
 * Soft paper page + white bordered panels (Reslink-style dashboard density).
 * Reserve `--paper` for page wash and quiet chips — not nested grey boxes.
 */

/** Shared content width for admin header + main (keep in sync). */
export const ADMIN_SHELL_CLASS = 'mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8';

/**
 * Min height for admin main skeletons / loading shells.
 * Header is 72px; main has py-8 (4rem). Keeps content tall enough that the
 * document scrollbar does not vanish during route transitions.
 */
export const ADMIN_MAIN_MIN_CLASS =
  'min-h-[calc(100svh-72px-4rem)]';


/** Primary CTA — ink pill (Publish, View, dialog confirm). */
export const ADMIN_PRIMARY_CLASS =
  'inline-flex shrink-0 cursor-pointer items-center justify-center gap-1.5 rounded-full bg-[var(--ink)] px-3.5 py-1.5 text-sm font-semibold text-[var(--white)] hover:opacity-95 focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ink)] disabled:cursor-not-allowed disabled:opacity-40';

/** Loud accent CTA — lime + ink (Create / New application). */
export const ADMIN_ACCENT_PRIMARY_CLASS =
  'inline-flex shrink-0 cursor-pointer items-center justify-center gap-1.5 rounded-full bg-[var(--lime)] px-4 py-2 text-sm font-semibold text-[var(--ink)] hover:opacity-90 focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ink)] disabled:cursor-not-allowed disabled:opacity-40';

/** Secondary control — white chip with border. */
export const ADMIN_SECONDARY_CLASS =
  'inline-flex shrink-0 cursor-pointer items-center justify-center gap-1.5 rounded-xl border border-[var(--ink)]/12 bg-[var(--white)] px-3 py-1.5 text-sm font-medium text-[var(--ink)] hover:bg-[var(--ink)]/[0.04] focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ink)] disabled:cursor-not-allowed disabled:opacity-40';

/** Disabled / unavailable action chrome on cards. */
export const ADMIN_DISABLED_CLASS =
  'inline-flex shrink-0 items-center gap-1.5 rounded-xl border border-[var(--ink)]/10 bg-[var(--white)] px-3 py-1.5 text-sm font-medium text-[var(--muted)]';

/** Soft panel — white fill + light border on paper page. */
export const ADMIN_PANEL_CLASS =
  'rounded-2xl border border-[var(--ink)]/10 bg-[var(--white)]';

/** Inline tip / nudge banner on form pages. */
export const ADMIN_TIP_CLASS =
  'rounded-xl border border-[var(--ink)]/10 bg-[var(--white)] px-4 py-3 text-sm text-[var(--ink)]';

/** Nested fieldset / section inside a panel. */
export const ADMIN_FIELDSET_CLASS =
  'rounded-xl border border-[var(--ink)]/10 bg-[var(--white)] p-4';

/** List row inside a dashboard panel (hairline divider, no nested card). */
export const ADMIN_LIST_ROW_CLASS =
  'border-b border-[var(--ink)]/8 last:border-b-0';
