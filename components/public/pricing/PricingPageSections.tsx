"use client";

import CTASection from "@/components/public/CTASection";
import Footer from "@/components/public/Footer";
import PricingIntro from "@/components/public/pricing/PricingIntro";
import PricingTiersSection from "@/components/public/pricing/PricingTiersSection";
import { PRICING_WAITLIST_HREF } from "@/components/public/pricing/constants";

/**
 * /pricing body: compact intro → tiers early → waitlist CTA → footer.
 * No FixedBackgroundHero / ScrollCoverSection — those are home-only.
 */
export default function PricingPageSections() {
  return (
    <>
      <PricingIntro />
      <PricingTiersSection />
      <CTASection
        ctaHref={PRICING_WAITLIST_HREF}
        headline={
          <>
            Ready to stand out <br /> when we launch?
          </>
        }
        description="Join the waitlist for early access. Launch pricing and final caps will be shared with early members first."
        ctaLabel="Get Early Access"
      />
      <Footer />
    </>
  );
}
