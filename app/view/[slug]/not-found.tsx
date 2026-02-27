import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--background)] px-4">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-[var(--foreground)]">404</h1>
        <p className="mt-4 text-lg text-[var(--foreground)]/80">
          Application not found
        </p>
        <p className="mt-2 text-sm text-[var(--foreground)]/60">
          The application you're looking for doesn't exist or has been removed.
        </p>
        <Link
          href="/"
          className="mt-6 inline-block rounded-md bg-[var(--brand-primary)] px-4 py-2 text-sm font-semibold text-[var(--brand-primary-text)] hover:opacity-95"
        >
          Go Home
        </Link>
      </div>
    </div>
  );
}
