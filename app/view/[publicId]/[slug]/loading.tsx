/**
 * Loading skeleton for the public application view.
 * Mirrors ApplicationPageHeader + CV panel layout (F17-017).
 */
export default function Loading() {
  return (
    <div
      className="min-h-screen bg-[var(--background)]"
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <span className="sr-only">Loading application</span>
      <div className="px-2 pt-5 sm:px-6 sm:pt-6 lg:px-8">
        <div className="mb-4 h-8 w-40 animate-pulse rounded-xl bg-[var(--foreground)]/10" />
        <div className="mx-auto max-w-6xl space-y-3">
          <div className="h-44 animate-pulse rounded-2xl border border-[var(--foreground)]/5 bg-[var(--secondary-background)] sm:h-52" />
          <div className="h-24 animate-pulse rounded-2xl border border-[var(--foreground)]/5 bg-[var(--secondary-background)]" />
        </div>
      </div>
      <div className="mx-auto mt-6 w-full max-w-6xl px-2 pb-12 sm:px-6 lg:px-8">
        <div className="h-96 animate-pulse rounded-2xl border border-[var(--foreground)]/5 bg-[var(--secondary-background)]" />
      </div>
    </div>
  );
}
