import { getUser } from '@/lib/auth';
import MarketingHeader from '@/components/public/MarketingHeader';
import LandingHero from '@/components/public/LandingHero';
import EmailCaptureForm from '@/components/public/EmailCaptureForm';
import ProblemSection from '@/components/public/ProblemSection';
import SolutionSection from '@/components/public/SolutionSection';
import HowItWorksSection from '@/components/public/HowItWorksSection';
import SocialProofSection from '@/components/public/SocialProofSection';
import FAQSection from '@/components/public/FAQSection';
import FinalCTASection from '@/components/public/FinalCTASection';
import Footer from '@/components/public/Footer';

/**
 * Pre-launch "Coming Soon" landing page. Structure and copy follow docs/LANDING_PAGE_BRIEF.md.
 */
export default async function Home() {
  const user = await getUser();

  return (
    <div className="flex min-h-screen flex-col bg-[var(--background)]">
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
