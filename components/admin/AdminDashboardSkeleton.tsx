/**
 * Loading skeleton for the admin dashboard (applications list).
 */
export default function AdminDashboardSkeleton() {
  return (
    <div className="space-y-4">
      <div className="h-8 w-64 animate-pulse rounded bg-gray-200" />
      <div className="flex flex-col gap-4">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-16 animate-pulse rounded-lg bg-gray-200"
          />
        ))}
      </div>
    </div>
  );
}
