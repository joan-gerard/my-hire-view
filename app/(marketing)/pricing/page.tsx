import PricingPageSections from "@/components/public/pricing/PricingPageSections";

export const metadata = {
  title: "Pricing | MyHireView",
  description:
    "MyHireView plans: Free, Pro, and Premium. Tailored CVs on Pro; vanity links and richer analytics on Premium.",
};

/**
 * Pricing page (E3-014). Draft tiers from docs/PRICING_AND_MEMBERSHIP.md.
 * Compact intro + tier grid (no full-viewport fixed hero — that pattern is home-only).
 * `pt-[72px]` clears the fixed MarketingHeader.
 */
export default function PricingPage() {
  return (
    <main className="flex-1 pt-[72px] bg-(--background)">
      <PricingPageSections />
    </main>
  );
}
