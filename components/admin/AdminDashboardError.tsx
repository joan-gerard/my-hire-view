interface AdminDashboardErrorProps {
  message: string;
}

/**
 * Error state for the admin dashboard when applications fail to load.
 */
export default function AdminDashboardError({ message }: AdminDashboardErrorProps) {
  return (
    <div className="rounded-md bg-red-50 p-4">
      <div className="text-sm text-red-800">{message}</div>
    </div>
  );
}
