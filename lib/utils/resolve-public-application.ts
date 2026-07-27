import type { SupabaseClient } from "@supabase/supabase-js";
import type { Application } from "@/lib/types/application";
import { createAdminClient } from "@/lib/supabase/admin";
import { isValidPublicId } from "@/lib/utils/public-id";

export type ResolvedPublicApplication = {
  application: Application;
  ownerUserId: string;
};

/**
 * Resolves a public application by opaque public_id and per-user slug.
 */
export async function resolvePublicApplication(
  supabase: SupabaseClient,
  publicId: string,
  slug: string,
): Promise<ResolvedPublicApplication | null> {
  if (!isValidPublicId(publicId) || !slug.trim()) {
    return null;
  }

  const admin = createAdminClient();
  const { data: profile, error: profileError } = await admin
    .from("profiles")
    .select("user_id")
    .eq("public_id", publicId)
    .maybeSingle();

  if (profileError || !profile) {
    return null;
  }

  const { data: application, error: appError } = await supabase
    .from("applications")
    .select("*")
    .eq("user_id", profile.user_id)
    .eq("slug", slug)
    .maybeSingle();

  if (appError || !application) {
    return null;
  }

  return {
    application: application as Application,
    ownerUserId: profile.user_id,
  };
}
