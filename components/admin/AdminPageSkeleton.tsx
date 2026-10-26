import {
  ADMIN_MAIN_MIN_CLASS,
  ADMIN_FORM_SHELL_CLASS,
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
        className={ADMIN_MAIN_MIN_CLASS}
        role="status"
        aria-busy="true"
        aria-live="polite"
      >
        <span className="sr-only">Loading applications</span>
        {/* Match AdminDashboard sticky toolbar (AdminMain uses pt-0 on /admin). */}
        <div className="-mx-4 px-4 pt-8 pb-6 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-end gap-2 sm:gap-3">
              <div className="space-y-3">
                <div className="h-4 w-40 motion-safe:animate-pulse rounded bg-[var(--ink)]/[0.05]" />
                <div className="h-10 w-56 motion-safe:animate-pulse rounded-xl bg-[var(--ink)]/[0.08]" />
              </div>
              <div className="h-9 w-9 motion-safe:animate-pulse rounded-xl bg-[var(--ink)]/[0.06]" />
            </div>
            <div className="size-11 motion-safe:animate-pulse rounded-full bg-[var(--ink)]/[0.08]" />
          </div>
        </div>
        <div className="grid min-h-[calc(100svh-102px-4rem-5.5rem)] gap-8 lg:grid-cols-[minmax(0,1fr)_17.5rem] xl:grid-cols-[minmax(0,1fr)_19rem]">
          <div className="min-w-0 space-y-6">
            {[0, 1].map((group) => (
              <div key={group} className="space-y-4">
                <div className="h-3 w-36 motion-safe:animate-pulse rounded bg-[var(--ink)]/[0.06]" />
                <div
                  className={`${ADMIN_PANEL_CLASS} divide-y divide-[var(--ink)]/8`}
                >
                  {[0, 1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="flex items-center gap-4 px-4 py-3.5"
                    >
                      <div className="h-3 w-12 motion-safe:animate-pulse rounded bg-[var(--ink)]/[0.05]" />
                      <div className="size-5 motion-safe:animate-pulse rounded-full bg-[var(--ink)]/[0.06]" />
                      <div className="h-4 w-48 max-w-[50%] motion-safe:animate-pulse rounded bg-[var(--ink)]/[0.06]" />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <aside className="flex w-full flex-col gap-4">
            <div className="h-10 w-full motion-safe:animate-pulse rounded-xl bg-[var(--ink)]/[0.06]" />
            <div className={`${ADMIN_PANEL_CLASS} overflow-hidden`}>
              <div className="border-b border-[var(--ink)]/8 px-5 py-3.5">
                <div className="h-4 w-20 motion-safe:animate-pulse rounded bg-[var(--ink)]/[0.06]" />
              </div>
              {[0, 1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="flex items-center justify-between gap-3 border-b border-[var(--ink)]/8 px-5 py-3 last:border-b-0"
                >
                  <div className="h-4 w-16 motion-safe:animate-pulse rounded bg-[var(--ink)]/[0.05]" />
                  <div className="h-5 w-8 motion-safe:animate-pulse rounded bg-[var(--ink)]/[0.06]" />
                </div>
              ))}
            </div>
            <div className={`${ADMIN_PANEL_CLASS} h-56 motion-safe:animate-pulse bg-[var(--ink)]/[0.03]`} />
          </aside>
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
          <div className="h-10 w-56 motion-safe:animate-pulse rounded-xl bg-[var(--ink)]/[0.08]" />
          <div className="h-4 w-72 max-w-full motion-safe:animate-pulse rounded bg-[var(--ink)]/[0.05]" />
        </div>
        <div className="flex gap-2 border-b border-[var(--ink)]/10 pb-px">
          {[0, 1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-9 w-20 motion-safe:animate-pulse rounded-lg bg-[var(--ink)]/[0.05] sm:w-24"
            />
          ))}
        </div>
        <section className={`${ADMIN_PANEL_CLASS} overflow-hidden`}>
          <div className="flex flex-col gap-5 border-b border-[var(--ink)]/8 bg-[var(--ink)]/[0.02] px-5 py-5 sm:flex-row sm:items-start sm:gap-6 sm:px-6 sm:py-6">
            <div className="flex shrink-0 flex-col gap-3">
              <div className="h-20 w-20 motion-safe:animate-pulse rounded-full bg-[var(--ink)]/[0.08] sm:h-[5.5rem] sm:w-[5.5rem]" />
              <div className="h-9 w-28 motion-safe:animate-pulse rounded-xl bg-[var(--ink)]/[0.06]" />
            </div>
            <div className="min-w-0 flex-1 space-y-2">
              <div className="h-7 w-48 motion-safe:animate-pulse rounded-lg bg-[var(--ink)]/[0.06]" />
              <div className="h-4 w-56 motion-safe:animate-pulse rounded bg-[var(--ink)]/[0.05]" />
              <div className="h-4 w-40 motion-safe:animate-pulse rounded bg-[var(--ink)]/[0.05]" />
            </div>
          </div>
          <div className="space-y-4 px-5 py-5 sm:px-6 sm:py-6">
            <div className="h-4 w-24 motion-safe:animate-pulse rounded bg-[var(--ink)]/[0.05]" />
            <div className="h-4 w-64 max-w-full motion-safe:animate-pulse rounded bg-[var(--ink)]/[0.05]" />
            <div className="h-5 w-36 motion-safe:animate-pulse rounded-lg bg-[var(--ink)]/[0.06]" />
            <div className="h-56 motion-safe:animate-pulse rounded-xl bg-[var(--ink)]/[0.04]" />
          </div>
        </section>
      </div>
    );
  }

  // form (create / edit)
  return (
    <div
      className={`${ADMIN_MAIN_MIN_CLASS} space-y-4 sm:space-y-6`}
      role="status"
      aria-busy="true"
      aria-live="polite"
    >
      <span className="sr-only">Loading</span>
      <div className="h-9 w-64 motion-safe:animate-pulse rounded-xl bg-[var(--ink)]/[0.08]" />
      {showTip ? (
        <div className="h-16 motion-safe:animate-pulse rounded-xl border border-[var(--ink)]/10 bg-[var(--white)]" />
      ) : null}
      <div
        className={`${ADMIN_FORM_SHELL_CLASS} min-h-[calc(100svh-102px-4rem-6rem)]`}
      >
        <div className="space-y-4 sm:space-y-5">
          <div className="h-24 motion-safe:animate-pulse rounded-xl bg-[var(--ink)]/[0.04]" />
          <div className="h-40 motion-safe:animate-pulse rounded-xl bg-[var(--ink)]/[0.04]" />
          <div className="h-48 motion-safe:animate-pulse rounded-xl bg-[var(--ink)]/[0.04]" />
          <div className="h-32 motion-safe:animate-pulse rounded-xl bg-[var(--ink)]/[0.04]" />
          <div className="h-24 motion-safe:animate-pulse rounded-xl bg-[var(--ink)]/[0.04]" />
        </div>
      </div>
    </div>
  );
}
