import Link from 'next/link';
import { DocumentIcon } from '@/components/admin/icons';

interface AdminDashboardEmptyProps {
  hasSearchQuery: boolean;
  /** Clears the dashboard search when the empty state is from a filter miss. */
  onClearSearch?: () => void;
}

/**
 * Empty state for the admin dashboard when there are no (matching) applications.
 */
export default function AdminDashboardEmpty({
  hasSearchQuery,
  onClearSearch,
}: AdminDashboardEmptyProps) {
  if (hasSearchQuery) {
    return (
      <div
        className="rounded-lg border border-[var(--foreground)]/10 bg-[var(--secondary-background)] px-6 py-14 text-center sm:px-10"
        role="status"
      >
        <h2 className="text-lg font-semibold text-[var(--foreground)]">
          No applications match that search
        </h2>
        <p className="mx-auto mt-2 max-w-md text-sm text-[var(--foreground)]/65">
          Try another company or role name, or clear the search to see everything
          again.
        </p>
        {onClearSearch ? (
          <button
            type="button"
            onClick={onClearSearch}
            className="mt-6 rounded-md border border-[var(--foreground)]/15 bg-[var(--background)] px-4 py-2 text-sm font-semibold text-[var(--foreground)] hover:bg-[var(--foreground)]/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-primary)] focus-visible:ring-offset-1"
          >
            Clear search
          </button>
        ) : null}
      </div>
    );
  }

  return (
    <div
      className="rounded-lg border border-[var(--foreground)]/10 bg-[var(--secondary-background)] px-6 py-14 text-center sm:px-10"
      role="status"
    >
      <div
        className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[var(--brand-primary)]/10 text-[var(--brand-primary)]"
        aria-hidden
      >
        <DocumentIcon className="h-6 w-6" />
      </div>
      <h2 className="mt-5 text-lg font-semibold text-[var(--foreground)]">
        Create your first application
      </h2>
      <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-[var(--foreground)]/65">
        Put your CV and video pitch on one page, publish it, and share a single
        link with recruiters. Your applications will show up here.
      </p>
      <Link
        href="/admin/new"
        className="mt-6 inline-flex items-center justify-center rounded-md bg-[var(--brand-primary)] px-4 py-2 text-sm font-semibold text-[var(--brand-primary-text)] hover:opacity-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-primary)] focus-visible:ring-offset-2"
      >
        New application
      </Link>
    </div>
  );
}
