import EmailCaptureForm from "@/components/public/EmailCaptureForm";
import FAQSection from "@/components/public/FAQSection";
import FinalCTASection from "@/components/public/FinalCTASection";
import FixedBackgroundHero from "@/components/public/FixedBackgroundHero";
import Footer from "@/components/public/Footer";
import HowItWorksSection from "@/components/public/HowItWorksSection";
import PreventOverscrollReveal from "@/components/public/PreventOverscrollReveal";
import ProblemSection from "@/components/public/ProblemSection";
import ScrollCoverSection from "@/components/public/ScrollCoverSection";
import SocialProofSection from "@/components/public/SocialProofSection";
import SolutionSection from "@/components/public/SolutionSection";

const HOME_HERO_IMAGE = "/images/pawel-czerwinski-2400-1600.jpg";
const HOME_HERO_IMAGE_CREDIT = {
  label: "Photo by",
  href: "https://unsplash.com/@pawel_czerwinski",
  name: "Pawel Czerwinski",
} as const;

const HERO_VIDEO = "/hero-video.mp4";

/**
 * Pre-launch "Coming Soon" landing page. Structure and copy follow docs/LANDING_PAGE_BRIEF.md.
 * MarketingHeader is rendered by (marketing)/layout.tsx.
 */
export default function Home() {
  return (
    <>
      <PreventOverscrollReveal />
      <FixedBackgroundHero
        title="Stand out. Get Seen."
        subtitle="Create your page, share your link, and get noticed by recruiters. Your personalized job application page in minutes."
        videoSrc={HERO_VIDEO}
        imageAlt="How it works hero"
        primaryCta={{ label: "Get started", href: "/login" }}
        secondaryCta={{ label: "See pricing", href: "/pricing" }}
      />

      <ScrollCoverSection>
        <EmailCaptureForm />
        <ProblemSection />
        <SolutionSection />
        <HowItWorksSection />
        <SocialProofSection />
        <FAQSection />
        <FinalCTASection />
        <Footer />
      </ScrollCoverSection>
    </>
  );
}
