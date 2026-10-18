import { requireAuth } from '@/lib/auth';
import { ADMIN_SHELL_CLASS } from '@/components/admin/admin-chrome';
import AdminHeader from '@/components/admin/AdminHeader';
import OnboardingChecklist from '@/components/admin/OnboardingChecklist';
import { StatusIndicatorStyleProvider } from '@/components/admin/StatusIndicatorStyleProvider';
import { loadOnboardingChecklistBootstrap } from '@/lib/utils/load-onboarding-checklist-snapshot';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireAuth();
  const onboarding = await loadOnboardingChecklistBootstrap(user);

  return (
    <StatusIndicatorStyleProvider>
      <div className="min-h-screen bg-[var(--paper)]" data-product-shell>
        <AdminHeader user={user} />
        <main className={`${ADMIN_SHELL_CLASS} py-8`}>
          {children}
        </main>
        <OnboardingChecklist
          initialAccountKey={onboarding?.accountKey ?? null}
          initialSnapshot={onboarding?.snapshot ?? null}
        />
      </div>
    </StatusIndicatorStyleProvider>
  );
}
