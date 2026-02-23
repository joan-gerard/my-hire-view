import Footer from "@/components/public/Footer";
import MarketingHero from "@/components/public/MarketingHero_Old";
import PageHeroContent from "@/components/public/PageHeroContent";

const HERO_IMAGE = "/images/milad-fakurian-2-3840-2160.jpg";
const HERO_IMAGE_CREDIT = {
  label: "Photo by",
  href: "https://unsplash.com/@fakurian",
  name: "Milad Fakurian",
} as const;

export const metadata = {
  title: "Pricing | MyHireView",
  description: "MyHireView pricing plans for job seekers.",
};

export default function PricingPage() {
  return (
    <>
      <MarketingHero
        backgroundImage={HERO_IMAGE}
        backgroundImageLabel="Pricing hero background"
        imageCredit={HERO_IMAGE_CREDIT}
        variant="compact"
      >
        <PageHeroContent
          title="Transparent pricing"
          subtitle="Plans that grow with you. No hidden fees."
        />
      </MarketingHero>
      <main className="flex-1 px-4 py-16 sm:px-6 lg:px-8">
        <div id="pricing" className="mx-auto max-w-3xl">
          <h2 className="font-heading text-3xl font-bold text-foreground sm:text-4xl">
            Pricing
          </h2>
          <p className="mt-4 text-foreground/80">Content coming soon.</p>
        </div>
      </main>
      <div className="mt-auto bg-background">
        <Footer />
      </div>
    </>
  );
}
