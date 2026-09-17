import { LogoBlack } from '@/components/ui/Logo';
import Link from 'next/link';
import type { ReactNode } from 'react';

type AuthPageShellProps = {
  title: string;
  alternateHref: string;
  alternateLabel: string;
  children: ReactNode;
};

/**
 * Shared centered layout for login / signup: logo, title, link to the other
 * auth page, and a warm surface panel matching homepage branding (F17-018).
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
        <div className="flex flex-col items-center gap-6">
          <LogoBlack />
          <div className="text-center">
            <h1 className="text-2xl font-semibold tracking-tight text-[var(--foreground)] sm:text-3xl">
              {title}
            </h1>
            <p className="mt-2 text-sm text-[var(--foreground)]/70">
              Or{' '}
              <Link
                href={alternateHref}
                className="font-medium text-[var(--brand-accent-2)] underline-offset-2 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--brand-accent-1)]"
              >
                {alternateLabel}
              </Link>
            </p>
          </div>
        </div>
        <div className="rounded-2xl border border-[var(--foreground)]/10 bg-[var(--secondary-background)] p-6 shadow-sm sm:p-8">
          {children}
        </div>
      </div>
    </div>
  );
}
