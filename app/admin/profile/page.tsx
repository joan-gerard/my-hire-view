import { namesFromUserMetadata } from "@/lib/auth/ensure-profile";
import { resolvePublicIdFromLoadedProfile } from "@/lib/auth/ensure-public-id";
import { createClient } from "@/lib/supabase/server";
import {
  ADMIN_PANEL_CLASS,
  ADMIN_TIP_CLASS,
} from "@/components/admin/admin-chrome";
import PublicIdAccountField from "@/components/admin/PublicIdAccountField";
import StatusIndicatorPreference from "@/components/admin/StatusIndicatorPreference";
import PrimaryCvLibrarySection from "@/components/forms/PrimaryCvLibrarySection";
import ProfileForm from "@/components/forms/ProfileForm";
import { formatApplicationStatusBreakdown } from "@/lib/types/application";
import type { Profile } from "@/lib/types/profile";
import Link from "next/link";
import { requireAuth } from "@/lib/auth";

/**
 * Profile page for the account owner. Shows identity from Supabase Auth,
 * editable profile details (name, location, portfolio, LinkedIn), and a
 * summary of their applications (total plus active / draft / archived).
 *
 * A profiles row is normally created at signup. If missing (failed insert),
 * the form is seeded from Auth user_metadata and Save upserts the row.
 */
export default async function AdminProfilePage() {
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

  const activeCountResult = await supabase
    .from("applications")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id)
    .eq("status", "active");

  const draftCountResult = await supabase
    .from("applications")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id)
    .eq("status", "draft");

  const archivedCountResult = await supabase
    .from("applications")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id)
    .eq("status", "archived");

  const applicationCount = count ?? 0;
  const activeCount = activeCountResult.count ?? 0;
  const draftCount = draftCountResult.count ?? 0;
  const archivedCount = archivedCountResult.count ?? 0;
  const statusBreakdown = formatApplicationStatusBreakdown({
    active: activeCount,
    draft: draftCount,
    archived: archivedCount,
  });

  return (
    <div className="space-y-8">
      <h1 className="font-heading text-3xl font-semibold tracking-[-0.03em] text-[var(--ink)]">
        Profile
      </h1>

      <section className={`${ADMIN_PANEL_CLASS} p-6`}>
        <h2 className="font-heading text-lg font-semibold tracking-[-0.02em] text-[var(--ink)]">
          Account
        </h2>
        <dl className="mt-4 space-y-3">
          <div>
            <dt className="text-sm font-medium text-[var(--muted)]">
              Email
            </dt>
            <dd className="mt-1 text-sm text-[var(--ink)]">
              {user.email ?? "—"}
            </dd>
          </div>
          {user.created_at && (
            <div>
              <dt className="text-sm font-medium text-[var(--muted)]">
                Member since
              </dt>
              <dd className="mt-1 text-sm text-[var(--ink)]">
                {new Date(user.created_at).toLocaleDateString(undefined, {
                  dateStyle: "long",
                })}
              </dd>
            </div>
          )}
          <PublicIdAccountField publicId={publicId} />
        </dl>
      </section>

      <section className={`${ADMIN_PANEL_CLASS} p-6`}>
        <h2 className="font-heading text-lg font-semibold tracking-[-0.02em] text-[var(--ink)]">
          Profile details
        </h2>
        <p className="mt-1 text-sm text-[var(--muted)]">
          This info is used when you create or update applications so recruiters
          see your name and links.
        </p>
        {!profile && (
          <p className={`mt-2 ${ADMIN_TIP_CLASS}`}>
            Your name is prefilled from signup. Save your profile to finish
            creating your profile record (location, links, and picture).
          </p>
        )}
        <div className="mt-4">
          <ProfileForm
            initialData={initialData}
            hasExistingProfile={Boolean(profile)}
          />
        </div>
      </section>

      <PrimaryCvLibrarySection />

      <section className={`${ADMIN_PANEL_CLASS} p-6`}>
        <StatusIndicatorPreference publicId={publicId} />
      </section>

      <section className={`${ADMIN_PANEL_CLASS} p-6`}>
        <h2 className="font-heading text-lg font-semibold tracking-[-0.02em] text-[var(--ink)]">
          Applications
        </h2>
        <p className="mt-2 text-sm text-[var(--muted)]">
          You have <strong className="font-medium text-[var(--ink)]">{applicationCount}</strong> application
          {applicationCount !== 1 ? "s" : ""} in total
          {applicationCount > 0 && statusBreakdown && (
            <> ({statusBreakdown})</>
          )}
          .
        </p>
        <Link
          href="/admin"
          className="mt-4 inline-block text-sm font-medium text-[var(--ink)] underline-offset-2 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ink)]"
        >
          View dashboard →
        </Link>
      </section>
    </div>
  );
}
