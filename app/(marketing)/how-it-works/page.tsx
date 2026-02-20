import Footer from "@/components/public/Footer";
import MarketingHero from "@/components/public/MarketingHero";
import PageHeroContent from "@/components/public/PageHeroContent";

const HERO_IMAGE = "/images/hassaan-here-4000-2300.jpg";
const HERO_IMAGE_CREDIT = {
  label: "Photo by",
  href: "https://unsplash.com/@hassaanhre",
  name: "Hassaan Here",
} as const;

export const metadata = {
  title: "How it Works | MyHireView",
  description:
    "Learn how MyHireView helps you stand out with personalized job application pages.",
};

export default function HowItWorksPage() {
  return (
    <>
      <MarketingHero
        backgroundImage={HERO_IMAGE}
        backgroundImageLabel="How it works hero background"
        imageCredit={HERO_IMAGE_CREDIT}
        variant="compact"
      >
        <PageHeroContent
          title="Simple steps to stand out"
          subtitle="Create your page, share your link, get noticed by recruiters."
        />
      </MarketingHero>
      <main className="flex-1 px-4 py-16 sm:px-6 lg:px-8">
        <div id="how-it-works" className="mx-auto max-w-3xl">
          <h2 className="font-heading text-3xl font-bold text-foreground sm:text-4xl">
            How it Works
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
