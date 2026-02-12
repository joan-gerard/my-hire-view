import Link from 'next/link';
import SignOutButton from '@/app/admin/SignOutButton';
import type { User } from '@supabase/supabase-js';

interface PublicSiteHeaderProps {
  user: User | null;
}

/**
 * Header for the public landing page (/). Shows logo and either
 * Dashboard + Sign out (when authenticated) or Sign in.
 */
export default function PublicSiteHeader({ user }: PublicSiteHeaderProps) {
  return (
    <header className="bg-white shadow-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <Link href="/">
              <h1 className="text-xl font-bold text-gray-900">HireView</h1>
            </Link>
          </div>
          <div className="flex items-center gap-3">
            {user ? (
              <>
                <Link
                  href="/admin"
                  className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500"
                >
                  Dashboard
                </Link>
                <SignOutButton />
              </>
            ) : (
              <Link
                href="/login"
                className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
