export default function Loading() {
  return (
    <div className="space-y-6" aria-busy="true" aria-label="Loading">
      <div className="h-9 w-56 animate-pulse rounded-xl bg-[var(--foreground)]/10" />
      <div className="h-16 animate-pulse rounded-xl bg-[var(--brand-secondary)]/60" />
      <div className="h-96 animate-pulse rounded-2xl border border-[var(--foreground)]/5 bg-[var(--secondary-background)]" />
    </div>
  );
}
