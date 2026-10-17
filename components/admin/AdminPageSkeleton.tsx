import {
  ADMIN_MAIN_MIN_CLASS,
  ADMIN_PANEL_CLASS,
} from '@/components/admin/admin-chrome';

export type AdminPageSkeletonVariant = 'dashboard' | 'form' | 'profile';

type AdminPageSkeletonProps = {
  variant: AdminPageSkeletonVariant;
  /** Optional tip bar skeleton (edit form). */
  showTip?: boolean;
};

/**
 * Route / client loading shells for admin pages.
 * Tall enough to keep the document scrollbar stable during transitions.
 */
export default function AdminPageSkeleton({
  variant,
  showTip = false,
}: AdminPageSkeletonProps) {
  if (variant === 'dashboard') {
    return (
      <div
        className={`${ADMIN_MAIN_MIN_CLASS} space-y-6`}
        role="status"
        aria-busy="true"
        aria-live="polite"
      >
        <span className="sr-only">Loading applications</span>
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div className="h-10 w-48 animate-pulse rounded-xl bg-[var(--ink)]/[0.08]" />
          <div className="h-10 w-52 animate-pulse rounded-full bg-[var(--ink)]/[0.08]" />
        </div>
        <div
          className={`${ADMIN_PANEL_CLASS} flex min-h-[calc(100svh-72px-4rem-5.5rem)] flex-col p-5 sm:p-6`}
        >
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="h-6 w-40 animate-pulse rounded-lg bg-[var(--ink)]/[0.06]" />
            <div className="h-10 w-full max-w-xs animate-pulse rounded-xl bg-[var(--ink)]/[0.06]" />
          </div>
          <div className="mt-4 flex-1 divide-y divide-[var(--ink)]/8">
            {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
              <div
                key={i}
                className="h-16 animate-pulse bg-[var(--ink)]/[0.03] sm:h-20"
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (variant === 'profile') {
    return (
      <div
        className={`${ADMIN_MAIN_MIN_CLASS} space-y-6`}
        role="status"
        aria-busy="true"
        aria-live="polite"
      >
        <span className="sr-only">Loading account settings</span>
        <div className="space-y-2">
          <div className="h-10 w-56 animate-pulse rounded-xl bg-[var(--ink)]/[0.08]" />
          <div className="h-4 w-72 max-w-full animate-pulse rounded bg-[var(--ink)]/[0.05]" />
        </div>
        <div className="flex gap-2 border-b border-[var(--ink)]/10 pb-px">
          {[0, 1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-9 w-20 animate-pulse rounded-lg bg-[var(--ink)]/[0.05] sm:w-24"
            />
          ))}
        </div>
        <section className={`${ADMIN_PANEL_CLASS} overflow-hidden`}>
          <div className="flex flex-col gap-4 border-b border-[var(--ink)]/8 bg-[var(--ink)]/[0.02] px-5 py-5 sm:flex-row sm:items-center sm:gap-5 sm:px-6 sm:py-6">
            <div className="h-16 w-16 shrink-0 animate-pulse rounded-full bg-[var(--ink)]/[0.08] sm:h-[4.5rem] sm:w-[4.5rem]" />
            <div className="min-w-0 flex-1 space-y-2">
              <div className="h-7 w-48 animate-pulse rounded-lg bg-[var(--ink)]/[0.06]" />
              <div className="h-4 w-56 animate-pulse rounded bg-[var(--ink)]/[0.05]" />
            </div>
          </div>
          <div className="space-y-3 px-5 py-5 sm:px-6">
            <div className="h-4 w-24 animate-pulse rounded bg-[var(--ink)]/[0.05]" />
            <div className="h-4 w-64 max-w-full animate-pulse rounded bg-[var(--ink)]/[0.05]" />
            <div className="h-4 w-40 animate-pulse rounded bg-[var(--ink)]/[0.05]" />
          </div>
        </section>
        <section className={`${ADMIN_PANEL_CLASS} space-y-4 p-5 sm:p-6`}>
          <div className="h-5 w-36 animate-pulse rounded-lg bg-[var(--ink)]/[0.06]" />
          <div className="h-4 w-72 max-w-full animate-pulse rounded bg-[var(--ink)]/[0.05]" />
          <div className="h-72 animate-pulse rounded-xl bg-[var(--ink)]/[0.04]" />
        </section>
      </div>
    );
  }

  // form (create / edit)
  return (
    <div
      className={`${ADMIN_MAIN_MIN_CLASS} space-y-6`}
      role="status"
      aria-busy="true"
      aria-live="polite"
    >
      <span className="sr-only">Loading</span>
      <div className="h-9 w-64 animate-pulse rounded-xl bg-[var(--ink)]/[0.08]" />
      {showTip ? (
        <div className="h-16 animate-pulse rounded-xl border border-[var(--ink)]/10 bg-[var(--white)]" />
      ) : null}
      <div
        className={`${ADMIN_PANEL_CLASS} min-h-[calc(100svh-72px-4rem-6rem)] p-6`}
      >
        <div className="space-y-5">
          <div className="h-24 animate-pulse rounded-xl bg-[var(--ink)]/[0.04]" />
          <div className="h-40 animate-pulse rounded-xl bg-[var(--ink)]/[0.04]" />
          <div className="h-48 animate-pulse rounded-xl bg-[var(--ink)]/[0.04]" />
          <div className="h-32 animate-pulse rounded-xl bg-[var(--ink)]/[0.04]" />
          <div className="h-24 animate-pulse rounded-xl bg-[var(--ink)]/[0.04]" />
        </div>
      </div>
    </div>
  );
}
