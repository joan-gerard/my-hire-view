import { requireAuth } from '@/lib/auth';
import AdminHeader from '@/components/admin/AdminHeader';
import OnboardingChecklist from '@/components/admin/OnboardingChecklist';
import { loadOnboardingChecklistBootstrap } from '@/lib/utils/load-onboarding-checklist-snapshot';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireAuth();
  const onboarding = await loadOnboardingChecklistBootstrap(user);

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <AdminHeader user={user} />
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {children}
      </main>
      <OnboardingChecklist
        initialAccountKey={onboarding?.accountKey ?? null}
        initialSnapshot={onboarding?.snapshot ?? null}
      />
    </div>
  );
}
