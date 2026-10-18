import { namesFromUserMetadata } from "@/lib/auth/ensure-profile";
import { resolvePublicIdFromLoadedProfile } from "@/lib/auth/ensure-public-id";
import { createClient } from "@/lib/supabase/server";
import { ADMIN_PANEL_CLASS } from "@/components/admin/admin-chrome";
import AccountPasswordPanel from "@/components/admin/account-settings/AccountPasswordPanel";
import AccountSettings from "@/components/admin/account-settings/AccountSettings";
import {
  AccountBillingPanelConnected,
  AccountCvsPanel,
  AccountSettingsUsageProvider,
} from "@/components/admin/account-settings/AccountSettingsUsage";
import StatusIndicatorPreference from "@/components/admin/StatusIndicatorPreference";
import ProfileForm from "@/components/forms/ProfileForm";
import type { Profile } from "@/lib/types/profile";
import { requireAuth } from "@/lib/auth";

/**
 * Account settings body for `/admin/profile` (tabs are client state).
 */
export default async function AccountSettingsView() {
  const user = await requireAuth();
  const supabase = await createClient();

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  const publicId = resolvePublicIdFromLoadedProfile(
    profile as Profile | null,
    user,
  );

  const metaNames = namesFromUserMetadata(user);
  const initialData: Profile | null = profile
    ? (profile as Profile)
    : {
        user_id: user.id,
        first_name: metaNames?.first_name ?? null,
        last_name: metaNames?.last_name ?? null,
        location: null,
        portfolio_url: null,
        linkedin_url: null,
        updated_at: new Date().toISOString(),
        profile_picture_url: null,
      };

  const { count } = await supabase
    .from("applications")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id);

  const primaryCvCountResult = await supabase
    .from("primary_cvs")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id);

  const applicationCount = count ?? 0;
  const primaryCvCount = primaryCvCountResult.count ?? 0;

  const memberSince = user.created_at
    ? new Date(user.created_at).toLocaleDateString(undefined, {
        dateStyle: "long",
      })
    : null;

  const profilePanel = (
    <ProfileForm
      initialData={initialData}
      hasExistingProfile={Boolean(profile)}
      accountChrome={{
        email: user.email ?? null,
        memberSince,
        publicId,
      }}
    />
  );

  const preferencesPanel = (
    <section className={`${ADMIN_PANEL_CLASS} p-5 sm:p-6`}>
      <StatusIndicatorPreference publicId={publicId} />
    </section>
  );

  return (
    <AccountSettingsUsageProvider
      applicationCount={applicationCount}
      initialPrimaryCvCount={primaryCvCount}
    >
      <AccountSettings
        panels={{
          profile: profilePanel,
          cvs: <AccountCvsPanel />,
          preferences: preferencesPanel,
          billing: <AccountBillingPanelConnected />,
          password: <AccountPasswordPanel />,
        }}
      />
    </AccountSettingsUsageProvider>
  );
}
