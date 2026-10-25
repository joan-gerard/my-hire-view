/**
 * Shared public `/view` chrome (F38).
 * Soft paper page wash + white panels so CV / video stay primary.
 * Narrower than admin (`max-w-6xl`) — recruiter reading, not dashboard density.
 */

/** Shared content width + gutters for logo, header, CV, footer, skeleton. */
export const VIEW_SHELL_CLASS =
  "mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8";

/** Live application page wash — paper; panels stay white via ADMIN_PANEL_CLASS. */
export const VIEW_PAGE_CLASS =
  "flex min-h-screen flex-col bg-[var(--paper)]";
