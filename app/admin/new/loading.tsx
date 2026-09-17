export default function Loading() {
  return (
    <div className="space-y-6" role="status" aria-live="polite" aria-busy="true">
      <span className="sr-only">Loading</span>
      <div className="h-9 w-64 animate-pulse rounded-xl bg-[var(--foreground)]/10" />
      <div className="h-96 animate-pulse rounded-2xl border border-[var(--foreground)]/5 bg-[var(--secondary-background)]" />
    </div>
  );
}
