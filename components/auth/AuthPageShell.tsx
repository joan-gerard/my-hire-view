import AuthBrandPanel from '@/components/auth/AuthBrandPanel';
import '@/components/auth/auth-shell.css';
import { LogoBlack } from '@/components/ui/Logo';
import Link from 'next/link';
import type { ReactNode } from 'react';

type AuthPageShellProps = {
  title: string;
  description?: string;
  alternateHref: string;
  alternateLabel: string;
  /** Copy for the ink brand column (desktop) and mobile cue. */
  brandHeadline: string;
  brandSupporting: string;
  children: ReactNode;
};

/**
 * Split auth layout: calm form column + ink brand panel (ProIntro structure,
 * MyHireView tokens). Both desktop columns share the same centered max-width stack.
 */
export default function AuthPageShell({
  title,
  description,
  alternateHref,
  alternateLabel,
  brandHeadline,
  brandSupporting,
  children,
}: AuthPageShellProps) {
  return (
    <div className="min-h-dvh bg-[var(--background)] lg:grid lg:h-dvh lg:grid-cols-2 lg:overflow-hidden">
      <div className="auth-form-column relative flex min-h-dvh flex-col px-5 py-8 sm:px-8 lg:h-dvh lg:overflow-y-auto lg:px-12 lg:py-16 xl:px-16">
        {/* Desktop: logo pinned; form stack centers like the brand column */}
        <div className="mb-8 lg:absolute lg:top-8 lg:left-12 lg:mb-0 xl:left-16">
          <LogoBlack />
        </div>

        {/* Mobile brand cue — full panel stays desktop-only so signup stays short */}
        <div className="mb-8 rounded-[24px] bg-[var(--ink)] px-5 py-4 text-white lg:hidden">
          <p className="font-heading text-base font-semibold tracking-[-0.02em]">
            {brandHeadline}
          </p>
          <p className="mt-1 text-sm text-[var(--mist)]">{brandSupporting}</p>
        </div>

        <div className="mx-auto w-full max-w-[420px]">
          <div className="mb-8">
            <h1 className="text-3xl font-semibold tracking-[-0.03em] text-[var(--ink)] sm:text-4xl">
              {title}
            </h1>
            {description ? (
              <p className="mt-2 text-base text-[var(--muted)]">{description}</p>
            ) : null}
            <p className="mt-3 text-sm text-[var(--muted)]">
              Or{' '}
              <Link
                href={alternateHref}
                className="font-medium text-[var(--muted)] underline-offset-2 transition-colors hover:text-[var(--ink)] hover:underline focus-visible:rounded-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ink)]"
              >
                {alternateLabel}
              </Link>
            </p>
          </div>

          <div className="rounded-[28px] border border-[var(--ink)]/10 bg-[var(--paper)] p-6 sm:p-8">
            {children}
          </div>
        </div>
      </div>

      <AuthBrandPanel headline={brandHeadline} supporting={brandSupporting} />
    </div>
  );
}
