interface AdminDashboardErrorProps {
  message: string;
}

/**
 * Error state for the admin dashboard when applications fail to load.
 */
export default function AdminDashboardError({ message }: AdminDashboardErrorProps) {
  return (
    <div
      className="rounded-xl border border-[var(--status-danger-fg)]/20 bg-[var(--status-danger-bg)] p-4"
      role="alert"
    >
      <div className="text-sm text-[var(--status-danger-fg)]">{message}</div>
    </div>
  );
}
