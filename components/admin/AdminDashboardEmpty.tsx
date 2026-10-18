import Link from 'next/link';
import { DocumentIcon } from '@/components/admin/icons';
import {
  ADMIN_ACCENT_PRIMARY_CLASS,
  ADMIN_PANEL_CLASS,
  ADMIN_SECONDARY_CLASS,
} from '@/components/admin/admin-chrome';

interface AdminDashboardEmptyProps {
  hasSearchQuery: boolean;
  /** Clears the dashboard search when the empty state is from a filter miss. */
  onClearSearch?: () => void;
  /**
   * When true, omit the outer panel chrome (already inside the list shell).
   */
  embedded?: boolean;
}

/**
 * Empty state for the admin dashboard when there are no (matching) applications.
 */
export default function AdminDashboardEmpty({
  hasSearchQuery,
  onClearSearch,
  embedded = false,
}: AdminDashboardEmptyProps) {
  const shell = embedded
    ? 'px-2 py-10 text-center sm:px-4'
    : `${ADMIN_PANEL_CLASS} px-6 py-14 text-center sm:px-10`;

  if (hasSearchQuery) {
    return (
      <div className={shell} role="status">
        <h2 className="font-heading text-lg font-semibold tracking-[-0.02em] text-[var(--ink)]">
          No applications match that search
        </h2>
        <p className="mx-auto mt-2 max-w-md text-sm text-[var(--muted)]">
          Try another company or role name, or clear the search to see everything
          again.
        </p>
        {onClearSearch ? (
          <button
            type="button"
            onClick={onClearSearch}
            className={`${ADMIN_SECONDARY_CLASS} mt-6`}
          >
            Clear search
          </button>
        ) : null}
      </div>
    );
  }

  return (
    <div className={shell} role="status">
      <div
        className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[var(--lime)] text-[var(--ink)]"
        aria-hidden
      >
        <DocumentIcon className="h-6 w-6" />
      </div>
      <h2 className="mt-5 font-heading text-lg font-semibold tracking-[-0.02em] text-[var(--ink)]">
        Create your first application
      </h2>
      <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-[var(--muted)]">
        Put your CV and video pitch on one page, publish it, and share a single
        link with recruiters. Your applications will show up here.
      </p>
      <Link href="/admin/new" className={`${ADMIN_ACCENT_PRIMARY_CLASS} mt-6`}>
        + New application
      </Link>
    </div>
  );
}
