import type { SupabaseClient } from "@supabase/supabase-js";
import type { Application } from "@/lib/types/application";
import { createAdminClient } from "@/lib/supabase/admin";
import { cacheBustProfilePictureUrl } from "@/lib/utils/profile-picture-storage";
import { isValidPublicId } from "@/lib/utils/public-id";
import { validateSlugFormat } from "@/lib/utils/slug-generate";

export type ResolvedPublicApplication = {
  application: Application;
  ownerUserId: string;
};

/**
 * Resolves a public application by opaque public_id and per-user slug.
 * When show_profile_picture is true, attaches profiles.profile_picture_url
 * onto the application as a display-only profile_picture_url (not a DB column),
 * cache-busted with profiles.updated_at so avatar replaces are visible.
 *
 * Invalid public_id or slug format returns null without querying the database.
 */
export async function resolvePublicApplication(
  supabase: SupabaseClient,
  publicId: string,
  slug: string,
): Promise<ResolvedPublicApplication | null> {
  if (!isValidPublicId(publicId) || !validateSlugFormat(slug).ok) {
    return null;
  }

  const admin = createAdminClient();
  const { data: profile, error: profileError } = await admin
    .from("profiles")
    .select("user_id, profile_picture_url, updated_at")
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

  const showPicture = application.show_profile_picture === true;
  const liveUrl = profile.profile_picture_url?.trim() || null;

  return {
    application: {
      ...(application as Application),
      profile_picture_url: showPicture
        ? cacheBustProfilePictureUrl(liveUrl, profile.updated_at)
        : null,
    },
    ownerUserId: profile.user_id,
  };
}
