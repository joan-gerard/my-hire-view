import { ADMIN_SHELL_CLASS } from "@/components/admin/admin-chrome";
import AdminHeader from "@/components/admin/AdminHeader";
import { StatusIndicatorStyleProvider } from "@/components/admin/StatusIndicatorStyleProvider";
import { requireAuth } from "@/lib/auth";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireAuth();

  return (
    <StatusIndicatorStyleProvider>
      <div className="min-h-screen bg-[var(--white)]" data-product-shell>
        <AdminHeader user={user} />
        <main className={`${ADMIN_SHELL_CLASS} py-8`}>{children}</main>
      </div>
    </StatusIndicatorStyleProvider>
  );
}
