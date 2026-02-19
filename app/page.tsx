import EmailCaptureForm from "@/components/public/EmailCaptureForm";
import FAQSection from "@/components/public/FAQSection";
import FinalCTASection from "@/components/public/FinalCTASection";
import Footer from "@/components/public/Footer";
import HowItWorksSection from "@/components/public/HowItWorksSection";
import LandingHero from "@/components/public/LandingHero";
import MarketingHeader from "@/components/public/MarketingHeader";
import ProblemSection from "@/components/public/ProblemSection";
import SocialProofSection from "@/components/public/SocialProofSection";
import SolutionSection from "@/components/public/SolutionSection";
import { getUser } from "@/lib/auth";

/**
 * Pre-launch "Coming Soon" landing page. Structure and copy follow docs/LANDING_PAGE_BRIEF.md.
 */
export default async function Home() {
  const user = await getUser();

  return (
    <div className="flex min-h-screen flex-col bg-[var(--background)] pt-16">
      <MarketingHeader user={user} />
      <LandingHero />
      <EmailCaptureForm />
      <ProblemSection />
      <SolutionSection />
      <HowItWorksSection />
      <SocialProofSection />
      <FAQSection />
      <FinalCTASection />
      <div className="mt-auto bg-[var(--background)]">
        <Footer />
      </div>
    </div>
  );
}
