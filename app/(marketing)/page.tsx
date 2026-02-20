import EmailCaptureForm from "@/components/public/EmailCaptureForm";
import FAQSection from "@/components/public/FAQSection";
import FinalCTASection from "@/components/public/FinalCTASection";
import Footer from "@/components/public/Footer";
import HowItWorksSection from "@/components/public/HowItWorksSection";
import HomeHeroContent from "@/components/public/HomeHeroContent";
import LandingHero from "@/components/public/LandingHero";
import ProblemSection from "@/components/public/ProblemSection";
import SocialProofSection from "@/components/public/SocialProofSection";
import SolutionSection from "@/components/public/SolutionSection";

const HOME_HERO_IMAGE = "/images/pawel-czerwinski-2400-1600.jpg";
const HOME_HERO_IMAGE_CREDIT = {
  label: "Photo by",
  href: "https://unsplash.com/@pawel_czerwinski",
  name: "Pawel Czerwinski",
} as const;

/**
 * Pre-launch "Coming Soon" landing page. Structure and copy follow docs/LANDING_PAGE_BRIEF.md.
 * MarketingHeader is rendered by (marketing)/layout.tsx.
 */
export default function Home() {
  return (
    <>
      <LandingHero
        backgroundImage={HOME_HERO_IMAGE}
        backgroundImageLabel="Hero background"
        imageCredit={HOME_HERO_IMAGE_CREDIT}
      >
        <HomeHeroContent />
      </LandingHero>
      <EmailCaptureForm />
      <ProblemSection />
      <SolutionSection />
      <HowItWorksSection />
      <SocialProofSection />
      <FAQSection />
      <FinalCTASection />
      <div className="mt-auto bg-background">
        <Footer />
      </div>
    </>
  );
}
