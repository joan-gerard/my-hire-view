import AdminHeader from "@/components/admin/AdminHeader";
import AdminMain from "@/components/admin/AdminMain";
import { StatusIndicatorStyleProvider } from "@/components/admin/StatusIndicatorStyleProvider";
import { requireAuth } from "@/lib/auth";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAuth();

  return (
    <StatusIndicatorStyleProvider>
      <div className="min-h-screen bg-[var(--white)]" data-product-shell>
        <AdminHeader />
        <AdminMain>{children}</AdminMain>
      </div>
    </StatusIndicatorStyleProvider>
  );
}
