import AdminDashboard from "@/components/admin/AdminDashboard";
import { requireAuth } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

async function loadDashboardFirstName(): Promise<string | null> {
  const user = await requireAuth();
  const supabase = await createClient();
  const { data } = await supabase
    .from("profiles")
    .select("first_name")
    .eq("user_id", user.id)
    .maybeSingle();

  const fromProfile = data?.first_name?.trim();
  if (fromProfile) return fromProfile;

  const meta = user.user_metadata?.first_name;
  if (typeof meta === "string" && meta.trim()) return meta.trim();

  return null;
}

export default async function AdminPage() {
  const firstName = await loadDashboardFirstName();
  return <AdminDashboard firstName={firstName} />;
}
