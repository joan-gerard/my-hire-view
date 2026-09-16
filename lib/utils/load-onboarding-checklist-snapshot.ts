import type { User } from "@supabase/supabase-js";
import { publicIdFromUserMetadata } from "@/lib/auth/ensure-public-id";
import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@/lib/types/profile";
import type { OnboardingChecklistInput } from "@/lib/utils/onboarding-checklist";
import { resolveOnboardingAccountKey } from "@/lib/utils/onboarding-checklist-storage";

export type OnboardingChecklistBootstrap = {
  accountKey: string;
  snapshot: OnboardingChecklistInput;
};

/**
 * Build the floating checklist snapshot from already-fetched account signals
 * (shared by the server layout loader and tests).
 */
export function buildOnboardingChecklistSnapshot(input: {
  profile: Profile | null;
  primaryCvCount: number;
  applicationTotal: number;
  activeApplicationCount: number;
}): OnboardingChecklistInput {
  const profile = input.profile;
  return {
    firstName: profile?.first_name ?? null,
    lastName: profile?.last_name ?? null,
    location: profile?.location ?? null,
    portfolioUrl: profile?.portfolio_url ?? null,
    linkedinUrl: profile?.linkedin_url ?? null,
    profilePictureUrl: profile?.profile_picture_url ?? null,
    primaryCvCount: Math.max(0, input.primaryCvCount),
    applicationTotal: Math.max(0, input.applicationTotal),
    activeApplicationCount: Math.max(0, input.activeApplicationCount),
  };
}

/**
 * Server-side bootstrap for the admin-layout checklist.
 * Uses Supabase directly (no /api/* rate-limit budget) so client routes that
 * already fetch overlapping data are not charged four GETs on first paint.
 */
export async function loadOnboardingChecklistBootstrap(
  user: User,
): Promise<OnboardingChecklistBootstrap | null> {
  try {
    const supabase = await createClient();

    const [
      profileResult,
      primaryCvCountResult,
      applicationTotalResult,
      activeCountResult,
    ] = await Promise.all([
      supabase.from("profiles").select("*").eq("user_id", user.id).maybeSingle(),
      supabase
        .from("primary_cvs")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id),
      supabase
        .from("applications")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id),
      supabase
        .from("applications")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id)
        .eq("status", "active"),
    ]);

    if (profileResult.error) {
      console.error(
        "loadOnboardingChecklistBootstrap profile:",
        profileResult.error,
      );
      return null;
    }
    if (primaryCvCountResult.error) {
      console.error(
        "loadOnboardingChecklistBootstrap primary_cvs:",
        primaryCvCountResult.error,
      );
      return null;
    }
    if (applicationTotalResult.error) {
      console.error(
        "loadOnboardingChecklistBootstrap applications:",
        applicationTotalResult.error,
      );
      return null;
    }
    if (activeCountResult.error) {
      console.error(
        "loadOnboardingChecklistBootstrap active applications:",
        activeCountResult.error,
      );
      return null;
    }

    const profile = (profileResult.data as Profile | null) ?? null;
    const accountKey = resolveOnboardingAccountKey({
      profilePublicId: profile?.public_id ?? null,
      metadataPublicId: publicIdFromUserMetadata(user),
      authUserId: user.id,
    });
    if (!accountKey) return null;

    return {
      accountKey,
      snapshot: buildOnboardingChecklistSnapshot({
        profile,
        primaryCvCount: primaryCvCountResult.count ?? 0,
        applicationTotal: applicationTotalResult.count ?? 0,
        activeApplicationCount: activeCountResult.count ?? 0,
      }),
    };
  } catch (error) {
    console.error("loadOnboardingChecklistBootstrap:", error);
    return null;
  }
}
