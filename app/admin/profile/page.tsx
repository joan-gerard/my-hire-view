import Link from "next/link";
import { requireAuth } from "@/lib/auth";
import { namesFromUserMetadata } from "@/lib/auth/ensure-profile";
import { createClient } from "@/lib/supabase/server";
import PrimaryCvLibrarySection from "@/components/forms/PrimaryCvLibrarySection";
import ProfileForm from "@/components/forms/ProfileForm";
import type { Profile } from "@/lib/types/profile";

/**
 * Profile page for the account owner. Shows identity from Supabase Auth,
 * editable profile details (name, location, portfolio, LinkedIn), and a
 * summary of their applications.
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

  const archivedCountResult = await supabase
    .from("applications")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id)
    .eq("status", "archived");

  const applicationCount = count ?? 0;
  const activeCount = activeCountResult.count ?? 0;
  const archivedCount = archivedCountResult.count ?? 0;

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-[var(--foreground)]">Profile</h1>

      <section className="rounded-lg border border-[var(--foreground)]/10 bg-[var(--secondary-background)] p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-[var(--foreground)]">
          Account
        </h2>
        <dl className="mt-4 space-y-3">
          <div>
            <dt className="text-sm font-medium text-[var(--foreground)]/60">
              Email
            </dt>
            <dd className="mt-1 text-sm text-[var(--foreground)]">
              {user.email ?? "—"}
            </dd>
          </div>
          {user.created_at && (
            <div>
              <dt className="text-sm font-medium text-[var(--foreground)]/60">
                Member since
              </dt>
              <dd className="mt-1 text-sm text-[var(--foreground)]">
                {new Date(user.created_at).toLocaleDateString(undefined, {
                  dateStyle: "long",
                })}
              </dd>
            </div>
          )}
        </dl>
      </section>

      <section className="rounded-lg border border-[var(--foreground)]/10 bg-[var(--secondary-background)] p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-[var(--foreground)]">
          Profile details
        </h2>
        <p className="mt-1 text-sm text-[var(--foreground)]/60">
          This info is used when you create or update applications so recruiters
          see your name and links.
        </p>
        {!profile && (
          <p className="mt-2 rounded-md bg-[var(--brand-secondary)]/40 px-3 py-2 text-sm text-[var(--foreground)]">
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

      <section className="rounded-lg border border-[var(--foreground)]/10 bg-[var(--secondary-background)] p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-[var(--foreground)]">
          Applications
        </h2>
        <p className="mt-2 text-sm text-[var(--foreground)]/80">
          You have <strong>{applicationCount}</strong> application
          {applicationCount !== 1 ? "s" : ""} in total
          {applicationCount > 0 && (
            <>
              {" "}
              ({activeCount} active, {archivedCount} archived)
            </>
          )}
          .
        </p>
        <Link
          href="/admin"
          className="mt-4 inline-block text-sm font-medium text-[var(--brand-primary)] hover:opacity-80"
        >
          View dashboard →
        </Link>
      </section>
    </div>
  );
}
