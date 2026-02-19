export default function Loading() {
  return (
    <div className="space-y-4">
      <div className="h-8 w-64 animate-pulse rounded bg-[var(--foreground)]/10"></div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="h-48 animate-pulse rounded-lg bg-[var(--foreground)]/10"></div>
        ))}
      </div>
    </div>
  );
}
