/**
 * Decorative brand column for auth (ProIntro-style). Product-only — not used by marketing.
 * aria-hidden: visual punctuation; form column carries the page purpose.
 * Layout mirrors the form column: shared max-width, title block then card.
 */
export default function AuthBrandPanel({
  headline,
  supporting,
}: {
  headline: string;
  supporting: string;
}) {
  return (
    <aside
      className="auth-brand-panel relative hidden h-dvh overflow-hidden bg-[var(--ink)] lg:flex lg:items-center lg:justify-center lg:px-12 lg:py-16 xl:px-16"
      aria-hidden
    >
      {/* Soft overlapping circles — ProIntro atmosphere in MHV ink/pink/lime */}
      <div className="auth-brand-orb auth-brand-orb--a pointer-events-none absolute -left-24 top-16 h-[420px] w-[420px] rounded-full bg-[var(--pink)]/[0.12]" />
      <div className="auth-brand-orb auth-brand-orb--b pointer-events-none absolute -right-20 bottom-10 h-[380px] w-[380px] rounded-full bg-[var(--lime)]/[0.14]" />
      <div className="auth-brand-orb auth-brand-orb--c pointer-events-none absolute left-1/3 top-1/2 h-[280px] w-[280px] -translate-y-1/2 rounded-full bg-white/[0.04]" />

      <div className="auth-brand-content relative z-10 w-full max-w-[420px]">
        <div className="mb-8">
          <p className="font-heading text-3xl font-semibold tracking-[-0.03em] text-white sm:text-4xl">
            {headline}
          </p>
          <p className="mt-2 text-base leading-relaxed text-[var(--mist)]">
            {supporting}
          </p>
        </div>

        <HireViewPreviewCard />
      </div>
    </aside>
  );
}

function HireViewPreviewCard() {
  return (
    <div className="auth-hire-preview relative w-full">
      <div className="absolute -inset-3 rounded-[32px] bg-[var(--lime)]/10 blur-2xl" />
      <div className="relative rounded-[28px] border border-white/10 bg-[#171718] p-6 shadow-[0_24px_60px_rgba(0,0,0,0.45)] sm:p-8">
        <div className="mb-5 flex items-center justify-between gap-3">
          <span className="inline-flex items-center rounded-full bg-[var(--lime)] px-2.5 py-1 text-xs font-semibold text-[var(--ink)]">
            Published
          </span>
          <span className="truncate text-xs text-[var(--mist)]">
            myhireview.com/view/…
          </span>
        </div>

        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[var(--paper)] font-heading text-lg font-semibold tracking-tight text-[var(--ink)]">
          JL
        </div>

        <p className="font-heading text-xl font-semibold tracking-[-0.02em] text-white">
          Jordan Lee
        </p>
        <p className="mt-1 text-sm text-[var(--mist)]">Product designer</p>

        <p className="mt-4 text-sm leading-relaxed text-white/80">
          One page for this role — story, proof, and how to reach me.
        </p>

        <div className="mt-5 flex flex-wrap gap-2">
          <span className="rounded-full bg-white/10 px-3 py-1.5 text-xs text-white">
            Portfolio
          </span>
          <span className="rounded-full bg-[var(--pink)] px-3 py-1.5 text-xs font-medium text-[var(--ink)]">
            CV
          </span>
          <span className="rounded-full bg-white/10 px-3 py-1.5 text-xs text-white">
            Contact
          </span>
        </div>
      </div>
    </div>
  );
}
