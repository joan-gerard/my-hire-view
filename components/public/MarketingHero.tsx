import Link from 'next/link';

interface MarketingHeroProps {
  /** When true, primary CTA goes to dashboard; otherwise to login. */
  isAuthenticated: boolean;
}

/**
 * Hero section for the marketing/landing page. Headline, value proposition,
 * and primary/secondary CTAs.
 */
export default function MarketingHero({ isAuthenticated }: MarketingHeroProps) {
  return (
    <main className="flex flex-1 items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-3xl text-center">
        <h2 className="text-4xl font-bold tracking-tight text-[var(--foreground)] sm:text-5xl">
          Create Personalized Landing Pages for Your Job Applications
        </h2>
        <p className="mt-6 text-lg leading-8 text-[var(--foreground)]/80">
          Showcase your tailored CV and video pitch to recruiters with unique,
          shareable landing pages. Make a lasting impression with personalized
          application pages.
        </p>
        <div className="mt-10 flex items-center justify-center gap-x-6">
          <Link
            href={isAuthenticated ? '/admin' : '/login'}
            className="rounded-md bg-[var(--brand-primary)] px-6 py-3 text-base font-semibold text-[var(--brand-primary-text)] shadow-sm hover:opacity-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--brand-primary)]"
          >
            {isAuthenticated ? 'Go to Dashboard' : 'Get Started'}
          </Link>
          <Link
            href="#features"
            className="text-base font-semibold leading-7 text-[var(--foreground)]"
          >
            Learn more <span aria-hidden="true">→</span>
          </Link>
        </div>
      </div>
    </main>
  );
}
