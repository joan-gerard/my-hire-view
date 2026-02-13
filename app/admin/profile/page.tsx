import Link from 'next/link';
import { requireAuth } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import ProfileForm from '@/components/forms/ProfileForm';
import type { Profile } from '@/lib/types/profile';

/**
 * Profile page for the account owner. Shows identity from Supabase Auth,
 * editable profile details (name, location, portfolio, LinkedIn), and a
 * summary of their applications. All data is retrieved server-side with
 * requireAuth() and RLS-scoped queries (user_id = auth.uid()).
 */
export default async function AdminProfilePage() {
  const user = await requireAuth();
  const supabase = await createClient();

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', user.id)
    .single();

  const { count } = await supabase
    .from('applications')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id);

  const activeCountResult = await supabase
    .from('applications')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .eq('is_active', true);

  const applicationCount = count ?? 0;
  const activeCount = activeCountResult.count ?? 0;

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-gray-900">Profile</h1>

      <section className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900">Account</h2>
        <dl className="mt-4 space-y-3">
          <div>
            <dt className="text-sm font-medium text-gray-500">Email</dt>
            <dd className="mt-1 text-sm text-gray-900">{user.email ?? '—'}</dd>
          </div>
          {user.created_at && (
            <div>
              <dt className="text-sm font-medium text-gray-500">Member since</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {new Date(user.created_at).toLocaleDateString(undefined, {
                  dateStyle: 'long',
                })}
              </dd>
            </div>
          )}
        </dl>
      </section>

      <section className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900">Profile details</h2>
        <p className="mt-1 text-sm text-gray-500">
          This info is used when you create or update applications so recruiters see your name and links.
        </p>
        <div className="mt-4">
          <ProfileForm initialData={profile as Profile | null} />
        </div>
      </section>

      <section className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900">Applications</h2>
        <p className="mt-2 text-sm text-gray-600">
          You have <strong>{applicationCount}</strong> application
          {applicationCount !== 1 ? 's' : ''} in total
          {applicationCount > 0 && (
            <> ({activeCount} active, {applicationCount - activeCount} archived)</>
          )}.
        </p>
        <Link
          href="/admin"
          className="mt-4 inline-block text-sm font-medium text-blue-600 hover:text-blue-500"
        >
          View dashboard →
        </Link>
      </section>
    </div>
  );
}
