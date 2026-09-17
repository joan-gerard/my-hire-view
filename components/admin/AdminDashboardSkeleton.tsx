/**
 * Loading skeleton for the admin dashboard (applications list).
 * Matches list chrome: title row + stacked application cards (F17-017).
 */
export default function AdminDashboardSkeleton() {
  return (
    <div
      className="space-y-6"
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <span className="sr-only">Loading applications</span>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="h-9 w-48 animate-pulse rounded-xl bg-[var(--foreground)]/10" />
        <div className="h-10 w-48 animate-pulse rounded-xl bg-[var(--foreground)]/10" />
      </div>
      <div className="h-10 max-w-md animate-pulse rounded-xl bg-[var(--foreground)]/10" />
      <div className="flex flex-col gap-4">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-20 animate-pulse rounded-2xl border border-[var(--foreground)]/5 bg-[var(--secondary-background)]"
          />
        ))}
      </div>
    </div>
  );
}
