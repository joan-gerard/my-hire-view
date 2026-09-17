export default function Loading() {
  return (
    <div className="space-y-6" aria-busy="true" aria-label="Loading">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="h-9 w-48 animate-pulse rounded-xl bg-[var(--foreground)]/10" />
        <div className="h-10 w-44 animate-pulse rounded-xl bg-[var(--foreground)]/10" />
      </div>
      <div className="flex flex-col gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="h-20 animate-pulse rounded-2xl border border-[var(--foreground)]/5 bg-[var(--secondary-background)]"
          />
        ))}
      </div>
    </div>
  );
}
