/**
 * Loading placeholder for the admin applications dashboard.
 * Mirrors header + search + card list layout while data loads.
 */
export default function AdminDashboardSkeleton() {
  return (
    <div className="space-y-6" aria-busy="true" aria-live="polite">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="h-9 w-48 animate-pulse rounded-xl bg-[var(--ink)]/10" />
        <div className="h-10 w-48 animate-pulse rounded-full bg-[var(--ink)]/10" />
      </div>
      <div className="h-10 max-w-md animate-pulse rounded-xl bg-[var(--ink)]/10" />
      <div className="flex flex-col gap-4">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="h-20 animate-pulse rounded-[24px] border border-[var(--ink)]/5 bg-[var(--paper)]"
          />
        ))}
      </div>
    </div>
  );
}
