export default function Loading() {
  return (
    <div className="space-y-6" role="status" aria-live="polite" aria-busy="true">
      <span className="sr-only">Loading</span>
      <div className="h-9 w-56 animate-pulse rounded-xl bg-[var(--ink)]/10" />
      <div className="h-16 animate-pulse rounded-xl bg-[var(--paper)]" />
      <div className="h-96 animate-pulse rounded-[24px] border border-[var(--ink)]/5 bg-[var(--paper)]" />
    </div>
  );
}
