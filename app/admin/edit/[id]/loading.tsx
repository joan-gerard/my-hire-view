export default function Loading() {
  return (
    <div className="space-y-6">
      <div className="h-8 w-64 animate-pulse rounded bg-[var(--foreground)]/10"></div>
      <div className="h-96 animate-pulse rounded-lg bg-[var(--foreground)]/10"></div>
    </div>
  );
}
