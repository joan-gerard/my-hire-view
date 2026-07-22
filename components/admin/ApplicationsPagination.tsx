'use client';

interface ApplicationsPaginationProps {
  page: number;
  totalPages: number;
  total: number;
  offset: number;
  limit: number;
  hasPrevPage: boolean;
  hasNextPage: boolean;
  isFetching: boolean;
  onPrev: () => void;
  onNext: () => void;
}

/**
 * Prev/Next pager for the admin applications list.
 */
export default function ApplicationsPagination({
  page,
  totalPages,
  total,
  offset,
  limit,
  hasPrevPage,
  hasNextPage,
  isFetching,
  onPrev,
  onNext,
}: ApplicationsPaginationProps) {
  if (total === 0) return null;

  const from = offset + 1;
  const to = Math.min(offset + limit, total);

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm text-[var(--foreground)]/60">
        Showing {from}–{to} of {total}
      </p>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onPrev}
          disabled={!hasPrevPage || isFetching}
          className="rounded-md border border-[var(--foreground)]/15 bg-[var(--secondary-background)] px-3 py-1.5 text-sm font-medium text-[var(--foreground)] hover:bg-[var(--brand-secondary)] disabled:cursor-not-allowed disabled:opacity-40"
        >
          Previous
        </button>
        <span className="min-w-20 text-center text-sm text-[var(--foreground)]/70">
          Page {page} of {totalPages}
        </span>
        <button
          type="button"
          onClick={onNext}
          disabled={!hasNextPage || isFetching}
          className="rounded-md border border-[var(--foreground)]/15 bg-[var(--secondary-background)] px-3 py-1.5 text-sm font-medium text-[var(--foreground)] hover:bg-[var(--brand-secondary)] disabled:cursor-not-allowed disabled:opacity-40"
        >
          Next
        </button>
      </div>
    </div>
  );
}
