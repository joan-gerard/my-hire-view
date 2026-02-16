import Link from 'next/link';
import SignOutButton from '@/components/auth/SignOutButton';
import type { User } from '@supabase/supabase-js';

interface AdminHeaderProps {
  user: User;
}

/**
 * Navigation header for the admin area (/admin). Shows logo, Dashboard and
 * New Application links, and the current user email with sign out.
 */
export default function AdminHeader({ user }: AdminHeaderProps) {
  return (
    <nav className="bg-white shadow-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 justify-between">
          <div className="flex">
            <div className="flex shrink-0 items-center">
              <Link href="/" className="text-xl font-bold text-gray-900">
                MyHireView
              </Link>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <Link
                href="/admin"
                className="inline-flex items-center border-b-2 border-blue-500 px-1 pt-1 text-sm font-medium text-gray-900"
              >
                Dashboard
              </Link>
              <Link
                href="/admin/new"
                className="inline-flex items-center border-b-2 border-transparent px-1 pt-1 text-sm font-medium text-gray-500 hover:border-gray-300 hover:text-gray-700"
              >
                New Application
              </Link>
              <Link
                href="/admin/profile"
                className="inline-flex items-center border-b-2 border-transparent px-1 pt-1 text-sm font-medium text-gray-500 hover:border-gray-300 hover:text-gray-700"
              >
                Profile
              </Link>
            </div>
          </div>
          <div className="flex items-center">
            <span className="text-sm text-gray-700">{user.email}</span>
            <SignOutButton />
          </div>
        </div>
      </div>
    </nav>
  );
}
