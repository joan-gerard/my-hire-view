import AdminDashboard from "@/components/admin/AdminDashboard";
import { requireAuth } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { loadOnboardingChecklistBootstrap } from "@/lib/utils/load-onboarding-checklist-snapshot";

async function loadDashboardFirstName(
  userId: string,
  userMetadata: Record<string, unknown> | undefined,
): Promise<string | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("profiles")
    .select("first_name")
    .eq("user_id", userId)
    .maybeSingle();

  const fromProfile = data?.first_name?.trim();
  if (fromProfile) return fromProfile;

  const meta = userMetadata?.first_name;
  if (typeof meta === "string" && meta.trim()) return meta.trim();

  return null;
}

export default async function AdminPage() {
  const user = await requireAuth();
  const [firstName, onboarding] = await Promise.all([
    loadDashboardFirstName(user.id, user.user_metadata),
    loadOnboardingChecklistBootstrap(user),
  ]);

  return (
    <AdminDashboard
      firstName={firstName}
      onboardingAccountKey={onboarding?.accountKey ?? null}
      onboardingSnapshot={onboarding?.snapshot ?? null}
    />
  );
}
