"use client";

import CTASection from "@/components/public/CTASection";
import Footer from "@/components/public/Footer";
import PricingFaq from "@/components/public/pricing/PricingFaq";
import PricingIntro from "@/components/public/pricing/PricingIntro";
import PricingTiersSection from "@/components/public/pricing/PricingTiersSection";
import { PRICING_WAITLIST_HREF } from "@/components/public/pricing/constants";

/**
 * /pricing body: compact intro → tiers → caps FAQ → waitlist CTA → footer.
 * No FixedBackgroundHero / ScrollCoverSection — those are home-only.
 */
export default function PricingPageSections() {
  return (
    <>
      <PricingIntro />
      <PricingTiersSection />
      <PricingFaq />
      <CTASection
        ctaHref={PRICING_WAITLIST_HREF}
        headline={
          <>
            Ready to stand out <br /> when we launch?
          </>
        }
        description="Plans and prices are set. Join the waitlist for early access — paid checkout ships with membership."
        ctaLabel="Get Early Access"
      />
      <Footer />
    </>
  );
}
