import EmailCaptureForm from "@/components/public/EmailCaptureForm";
import FAQSection from "@/components/public/FAQSection";
import FinalCTASection from "@/components/public/FinalCTASection";
import FixedBackgroundHero from "@/components/public/FixedBackgroundHero";
import Footer from "@/components/public/Footer";
import HowItWorksSection from "@/components/public/HowItWorksSection";
import PreventOverscrollReveal from "@/components/public/PreventOverscrollReveal";
import ScrollCoverSection from "@/components/public/ScrollCoverSection";
import SolutionSection from "@/components/public/SolutionSection";

const HERO_VIDEO = "/hero-video.mp4";

export const metadata = {
  title: "How it Works | MyHireView",
  description:
    "Learn how MyHireView helps you stand out with personalized job application pages.",
};

export default function HowItWorksPage() {
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
        <SolutionSection />
        <HowItWorksSection />
        <FAQSection />
        <FinalCTASection />
        <Footer />
      </ScrollCoverSection>
    </>
  );
}
