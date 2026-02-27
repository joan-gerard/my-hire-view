import { requireAuth } from '@/lib/auth';
import AdminHeader from '@/components/admin/AdminHeader';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireAuth();

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <AdminHeader user={user} />
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
}
