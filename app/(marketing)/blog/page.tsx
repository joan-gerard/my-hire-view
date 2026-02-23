import Footer from "@/components/public/Footer";
import MarketingHero from "@/components/public/MarketingHero_Old";
import PageHeroContent from "@/components/public/PageHeroContent";

const HERO_IMAGE = "/images/pawel-czerwinski-2-2400-1600.jpg";
const HERO_IMAGE_CREDIT = {
  label: "Photo by",
  href: "https://unsplash.com/@pawel_czerwinski",
  name: "Pawel Czerwinski",
} as const;

export const metadata = {
  title: "Blog | MyHireView",
  description: "MyHireView blog and job search tips.",
};

export default function BlogPage() {
  return (
    <>
      <MarketingHero
        backgroundImage={HERO_IMAGE}
        backgroundImageLabel="Blog hero background"
        imageCredit={HERO_IMAGE_CREDIT}
        variant="compact"
      >
        <PageHeroContent
          title="Tips & insights"
          subtitle="Job search advice, resume tips, and product updates."
        />
      </MarketingHero>
      <main className="flex-1 px-4 py-16 sm:px-6 lg:px-8">
        <div id="posts" className="mx-auto max-w-3xl">
          <h2 className="font-heading text-3xl font-bold text-foreground sm:text-4xl">
            Blog
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
