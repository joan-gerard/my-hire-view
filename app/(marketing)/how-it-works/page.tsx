import EmailCaptureForm from "@/components/public/EmailCaptureForm";
import FAQSection from "@/components/public/FAQSection";
import FinalCTASection from "@/components/public/FinalCTASection";
import Footer from "@/components/public/Footer";
import HowItWorksHero from "@/components/public/HowItWorksHero";
import HowItWorksScrollSection from "@/components/public/HowItWorksScrollSection";
import HowItWorksSection from "@/components/public/HowItWorksSection";
import PreventOverscrollReveal from "@/components/public/PreventOverscrollReveal";
import ProblemSection from "@/components/public/ProblemSection";
import SocialProofSection from "@/components/public/SocialProofSection";
import SolutionSection from "@/components/public/SolutionSection";

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
      <PreventOverscrollReveal />
      <HowItWorksHero
        title="Simple steps to stand out"
        subtitle="Create your page, share your link, and get noticed by recruiters. Your personalized job application page in minutes."
        imageSrc={HERO_IMAGE}
        imageAlt="How it works hero"
        imageCredit={HERO_IMAGE_CREDIT}
        primaryCta={{ label: "Get started", href: "/login" }}
        secondaryCta={{ label: "See pricing", href: "/pricing" }}
      />
      <HowItWorksScrollSection>
        <EmailCaptureForm />
        <ProblemSection />
        <SolutionSection />
        <HowItWorksSection />
        <SocialProofSection />
        <FAQSection />
        <FinalCTASection />
        <Footer />
      </HowItWorksScrollSection>
    </>
  );
}
