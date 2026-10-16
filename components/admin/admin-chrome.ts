/**
 * Shared admin dashboard chrome classes (F34 ink / paper / pill primary).
 * Prefer these over one-off hex; keep product dense — not marketing theater.
 */

/** Primary CTA — ink pill (Create, Publish, View, New application). */
export const ADMIN_PRIMARY_CLASS =
  'inline-flex shrink-0 cursor-pointer items-center justify-center gap-1.5 rounded-full bg-[var(--ink)] px-3.5 py-1.5 text-sm font-semibold text-[var(--white)] hover:opacity-95 focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ink)] disabled:cursor-not-allowed disabled:opacity-40';

/** Secondary control — paper chip (Clear search, Copy link, Insights, legend). */
export const ADMIN_SECONDARY_CLASS =
  'inline-flex shrink-0 cursor-pointer items-center justify-center gap-1.5 rounded-xl border border-[var(--ink)]/12 bg-[var(--paper)] px-3 py-1.5 text-sm font-medium text-[var(--ink)] hover:bg-[var(--white)] focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ink)] disabled:cursor-not-allowed disabled:opacity-40';

/** Disabled / unavailable action chrome on cards. */
export const ADMIN_DISABLED_CLASS =
  'inline-flex shrink-0 items-center gap-1.5 rounded-xl border border-[var(--ink)]/10 bg-[var(--paper)] px-3 py-1.5 text-sm font-medium text-[var(--muted)]';

/** Soft panel used for cards, empty states, checklist, form shells. */
export const ADMIN_PANEL_CLASS =
  'rounded-[24px] border border-[var(--ink)]/10 bg-[var(--paper)]';

/** Inline tip / nudge banner on form pages. */
export const ADMIN_TIP_CLASS =
  'rounded-xl border border-[var(--ink)]/10 bg-[var(--paper)] px-4 py-3 text-sm text-[var(--ink)]';

/** Nested fieldset / section inside a paper panel (white on paper). */
export const ADMIN_FIELDSET_CLASS =
  'rounded-xl border border-[var(--ink)]/10 bg-[var(--white)] p-4';