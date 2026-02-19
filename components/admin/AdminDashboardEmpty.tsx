interface AdminDashboardEmptyProps {
  hasSearchQuery: boolean;
}

/**
 * Empty state for the admin dashboard when there are no (matching) applications.
 */
export default function AdminDashboardEmpty({
  hasSearchQuery,
}: AdminDashboardEmptyProps) {
  return (
    <div className="rounded-lg bg-[var(--secondary-background)] p-12 text-center shadow border border-[var(--foreground)]/10">
      <p className="text-[var(--foreground)]/60">
        {hasSearchQuery
          ? 'No applications match your search.'
          : "You don't have any applications yet. Create your first one!"}
      </p>
    </div>
  );
}
