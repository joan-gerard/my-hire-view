import { VIEW_PAGE_CLASS, VIEW_SHELL_CLASS } from "@/components/view/view-chrome";

/**
 * Loading skeleton for the public application view.
 * Mirrors ApplicationPageHeader + CV panel layout (F38 paper wash + shell).
 * Panel radius matches `ADMIN_PANEL_CLASS` (`rounded-2xl`).
 */
export default function Loading() {
  return (
    <div
      className={VIEW_PAGE_CLASS}
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <span className="sr-only">Loading application</span>
      <div className={`${VIEW_SHELL_CLASS} pt-5 sm:pt-6`}>
        <div className="mb-4 h-8 w-40 rounded-xl bg-[var(--ink)]/10 motion-safe:animate-pulse" />
        <div className="space-y-3">
          <div className="h-40 rounded-2xl border border-[var(--ink)]/5 bg-[var(--white)] motion-safe:animate-pulse sm:h-48" />
          <div className="h-16 rounded-2xl border border-[var(--ink)]/5 bg-[var(--white)] motion-safe:animate-pulse" />
        </div>
      </div>
      <div className={`${VIEW_SHELL_CLASS} mt-6 flex-1 pb-12`}>
        <div className="h-96 rounded-2xl border border-[var(--ink)]/5 bg-[var(--white)] motion-safe:animate-pulse" />
      </div>
    </div>
  );
}
