import FixedBackgroundHero from "@/components/public/FixedBackgroundHero";
import Footer from "@/components/public/Footer";
import PreventOverscrollReveal from "@/components/public/PreventOverscrollReveal";
import ScrollCoverSection from "@/components/public/ScrollCoverSection";

const HERO_IMAGE = "/images/milad-fakurian-2-3840-2160.jpg";

export const metadata = {
  title: "Pricing | MyHireView",
  description: "MyHireView pricing plans for job seekers.",
};

/**
 * Pricing stub until E3 ships real tiers. Uses FixedBackgroundHero (same pattern
 * as home) so MarketingHero_Old / PageHeroContent can be removed (A4-023).
 */
export default function PricingPage() {
  return (
    <>
      <PreventOverscrollReveal />
      <FixedBackgroundHero
        title="Transparent pricing"
        subtitle="Plans that grow with you. No hidden fees."
        imageSrc={HERO_IMAGE}
        imageAlt="Pricing hero background"
        primaryCta={{ label: "Get Early Access", href: "/#early-access" }}
      />
      <ScrollCoverSection>
        <main className="flex-1 px-4 py-16 sm:px-6 lg:px-8">
          <div id="pricing" className="mx-auto max-w-3xl">
            <h2 className="font-heading text-3xl font-bold text-foreground sm:text-4xl">
              Pricing
            </h2>
            <p className="mt-4 text-foreground/80">Content coming soon.</p>
          </div>
        </main>
        <Footer />
      </ScrollCoverSection>
    </>
  );
}
