import { namesFromUserMetadata } from "@/lib/auth/ensure-profile";
import { resolvePublicIdFromLoadedProfile } from "@/lib/auth/ensure-public-id";
import { createClient } from "@/lib/supabase/server";
import {
  ADMIN_PANEL_CLASS,
  ADMIN_TIP_CLASS,
} from "@/components/admin/admin-chrome";
import AccountPasswordPanel from "@/components/admin/account-settings/AccountPasswordPanel";
import AccountSettings from "@/components/admin/account-settings/AccountSettings";
import {
  AccountBillingPanelConnected,
  AccountCvsPanel,
  AccountSettingsUsageProvider,
} from "@/components/admin/account-settings/AccountSettingsUsage";
import { AvatarIcon } from "@/components/admin/icons";
import PublicIdAccountField from "@/components/admin/PublicIdAccountField";
import StatusIndicatorPreference from "@/components/admin/StatusIndicatorPreference";
import ProfileForm from "@/components/forms/ProfileForm";
import type { Profile } from "@/lib/types/profile";
import { cacheBustProfilePictureUrl } from "@/lib/utils/profile-picture-storage";
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

  const firstName = (initialData?.first_name ?? "").trim();
  const lastName = (initialData?.last_name ?? "").trim();
  const displayName =
    [firstName, lastName].filter(Boolean).join(" ") || "Your profile";
  const initials =
    `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase() ||
    (user.email?.charAt(0).toUpperCase() ?? "?");
  const pictureUrl = cacheBustProfilePictureUrl(
    initialData?.profile_picture_url,
    initialData?.updated_at,
  );
  const memberSince = user.created_at
    ? new Date(user.created_at).toLocaleDateString(undefined, {
        dateStyle: "long",
      })
    : null;

  const profilePanel = (
    <>
      <section
        className={`${ADMIN_PANEL_CLASS} overflow-hidden`}
        aria-labelledby="profile-identity-heading"
      >
        <div className="border-b border-[var(--ink)]/8 bg-[var(--ink)]/[0.02] px-5 py-5 sm:px-6 sm:py-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-5">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[var(--lime)] text-[var(--ink)] sm:h-[4.5rem] sm:w-[4.5rem]">
              {pictureUrl ? (
                // eslint-disable-next-line @next/next/no-img-element -- remote avatar URL from Storage; cache-busted query string
                <img
                  src={pictureUrl}
                  alt=""
                  className="h-full w-full object-cover"
                />
              ) : firstName || lastName ? (
                <span
                  className="font-heading text-xl font-semibold tracking-[-0.02em]"
                  aria-hidden
                >
                  {initials}
                </span>
              ) : (
                <AvatarIcon className="h-8 w-8" />
              )}
            </div>
            <div className="min-w-0">
              <h2
                id="profile-identity-heading"
                className="font-heading text-xl font-semibold tracking-[-0.02em] text-[var(--ink)] sm:text-2xl"
              >
                {displayName}
              </h2>
              <p className="mt-1 truncate text-sm text-[var(--muted)]">
                {user.email ?? "—"}
              </p>
              {memberSince ? (
                <p className="mt-2 inline-flex rounded-full bg-[var(--white)] px-2.5 py-1 text-xs font-medium text-[var(--muted)] ring-1 ring-[var(--ink)]/10">
                  Member since {memberSince}
                </p>
              ) : null}
            </div>
          </div>
        </div>

        <div className="px-5 py-5 sm:px-6">
          <h3 className="font-heading text-sm font-semibold tracking-[-0.01em] text-[var(--ink)]">
            Account
          </h3>
          <dl className="mt-3 divide-y divide-[var(--ink)]/8">
            <div className="flex flex-col gap-0.5 py-3 first:pt-0 sm:flex-row sm:gap-6">
              <dt className="shrink-0 text-sm font-medium text-[var(--muted)] sm:w-36">
                Email
              </dt>
              <dd className="min-w-0 text-sm text-[var(--ink)]">
                {user.email ?? "—"}
              </dd>
            </div>
            <div className="py-3 last:pb-0">
              <PublicIdAccountField publicId={publicId} />
            </div>
          </dl>
        </div>
      </section>

      <section className={`${ADMIN_PANEL_CLASS} p-5 sm:p-6`}>
        <h2 className="font-heading text-base font-semibold tracking-[-0.02em] text-[var(--ink)]">
          Profile details
        </h2>
        <p className="mt-1 text-sm text-[var(--muted)]">
          This info is used when you create or update applications so recruiters
          see your name and links.
        </p>
        {!profile && (
          <p className={`mt-3 ${ADMIN_TIP_CLASS}`}>
            Your name is prefilled from signup. Save your profile to finish
            creating your profile record (location, links, and picture).
          </p>
        )}
        <div className="mt-5 border-t border-[var(--ink)]/8 pt-5">
          <ProfileForm
            initialData={initialData}
            hasExistingProfile={Boolean(profile)}
          />
        </div>
      </section>

    </>
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
