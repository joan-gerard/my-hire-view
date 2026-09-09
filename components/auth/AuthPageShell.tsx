import Link from 'next/link';
import type { ReactNode } from 'react';

type AuthPageShellProps = {
  title: string;
  alternateHref: string;
  alternateLabel: string;
  children: ReactNode;
};

/**
 * Shared centered layout for login / signup: title + link to the other auth page.
 */
export default function AuthPageShell({
  title,
  alternateHref,
  alternateLabel,
  children,
}: AuthPageShellProps) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--background)] px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-[var(--foreground)]">
            {title}
          </h2>
          <p className="mt-2 text-center text-sm text-[var(--foreground)]/80">
            Or{' '}
            <Link
              href={alternateHref}
              className="font-medium text-[var(--brand-primary)] hover:opacity-80"
            >
              {alternateLabel}
            </Link>
          </p>
        </div>
        {children}
      </div>
    </div>
  );
}
