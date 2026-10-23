import AdminDashboard from "@/components/admin/AdminDashboard";
import { requireAuth } from "@/lib/auth";
import { loadOnboardingChecklistBootstrap } from "@/lib/utils/load-onboarding-checklist-snapshot";

function firstNameFromMetadata(
  userMetadata: Record<string, unknown> | undefined,
): string | null {
  const meta = userMetadata?.first_name;
  if (typeof meta === "string" && meta.trim()) return meta.trim();
  return null;
}

export default async function AdminPage() {
  const user = await requireAuth();
  const onboarding = await loadOnboardingChecklistBootstrap(user);
  const firstName =
    onboarding?.snapshot.firstName?.trim() ||
    firstNameFromMetadata(user.user_metadata);

  return (
    <AdminDashboard
      firstName={firstName}
      onboardingAccountKey={onboarding?.accountKey ?? null}
      onboardingSnapshot={onboarding?.snapshot ?? null}
    />
  );
}
