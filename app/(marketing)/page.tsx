import EmailCaptureForm from "@/components/public/EmailCaptureForm";
import FAQSection from "@/components/public/FAQSection";
import FinalCTASection from "@/components/public/FinalCTASection";
import Footer from "@/components/public/Footer";
import HowItWorksSection from "@/components/public/HowItWorksSection";
import LandingHero from "@/components/public/LandingHero";
import ProblemSection from "@/components/public/ProblemSection";
import SocialProofSection from "@/components/public/SocialProofSection";
import SolutionSection from "@/components/public/SolutionSection";

/**
 * Pre-launch "Coming Soon" landing page. Structure and copy follow docs/LANDING_PAGE_BRIEF.md.
 * MarketingHeader is rendered by (marketing)/layout.tsx.
 */
export default function Home() {
  return (
    <>
      <LandingHero />
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
