export default function Loading() {
  return (
    <div className="min-h-screen bg-[var(--background)]">
      <div className="bg-[var(--secondary-background)] py-12 shadow-sm">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="h-12 w-64 animate-pulse rounded bg-[var(--foreground)]/10"></div>
          <div className="mt-2 h-8 w-48 animate-pulse rounded bg-[var(--foreground)]/10"></div>
        </div>
      </div>
      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="space-y-12">
          <div className="h-96 animate-pulse rounded-lg bg-[var(--foreground)]/10"></div>
          <div className="aspect-video animate-pulse rounded-lg bg-[var(--foreground)]/10"></div>
        </div>
      </div>
    </div>
  );
}
