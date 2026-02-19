import SignOutButton from "@/components/auth/SignOutButton";
import type { User } from "@supabase/supabase-js";
import Link from "next/link";

interface AdminHeaderProps {
  user: User;
}

/**
 * Navigation header for the admin area (/admin). Shows logo, Dashboard and
 * New Application links, and the current user email with sign out.
 */
export default function AdminHeader({ user }: AdminHeaderProps) {
  return (
    <nav className="bg-[var(--secondary-background)] shadow-sm border-b border-[var(--foreground)]/10">
      <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 justify-between">
          <div className="flex">
            <div className="flex shrink-0 items-center">
              <Link href="/" className="text-xl font-bold text-[var(--foreground)]">
                MyHireView
              </Link>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <Link
                href="/admin"
                className="inline-flex items-center border-b-2 border-[var(--brand-primary)] px-1 pt-1 text-sm font-medium text-[var(--foreground)]"
              >
                Dashboard
              </Link>
              <Link
                href="/admin/new"
                className="inline-flex items-center border-b-2 border-transparent px-1 pt-1 text-sm font-medium text-[var(--foreground)]/60 hover:border-[var(--foreground)]/20 hover:text-[var(--foreground)]"
              >
                New Application
              </Link>
              <Link
                href="/admin/profile"
                className="inline-flex items-center border-b-2 border-transparent px-1 pt-1 text-sm font-medium text-[var(--foreground)]/60 hover:border-[var(--foreground)]/20 hover:text-[var(--foreground)]"
              >
                Profile
              </Link>
            </div>
          </div>
          <div className="flex items-center">
            <span className="text-sm text-[var(--foreground)]/80">{user.email}</span>
            <SignOutButton />
          </div>
        </div>
      </div>
    </nav>
  );
}
