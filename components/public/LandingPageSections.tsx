"use client";

import { useCallback, useRef, useState } from "react";
import EmailCaptureForm from "@/components/public/EmailCaptureForm";
import FAQSection from "@/components/public/FAQSection";
import FinalCTASection from "@/components/public/FinalCTASection";
import { HowItWorksSection } from "@/components/public/how-it-works/HowItWorksSection";
import ProblemSection from "@/components/public/ProblemSection";
import SolutionSection from "@/components/public/SolutionSection";
import Footer from "@/components/public/Footer";

/**
 * Client-only wrapper for the main landing sections. Holds a ref to the
 * ProblemSection container so HowItWorksSection can trigger dark mode when
 * ProblemSection enters the viewport (instead of when HowItWorksSection does).
 */
export default function LandingPageSections() {
  const problemSectionRef = useRef<HTMLDivElement>(null);
  const [darkModeTriggerReady, setDarkModeTriggerReady] = useState(false);

  const setProblemSectionRef = useCallback((el: HTMLDivElement | null) => {
    (problemSectionRef as React.MutableRefObject<HTMLDivElement | null>).current =
      el;
    setDarkModeTriggerReady((prev) => prev || !!el);
  }, []);

  return (
    <>
      <EmailCaptureForm />
      <SolutionSection />
      <HowItWorksSection
        darkModeTriggerRef={problemSectionRef}
        darkModeTriggerReady={darkModeTriggerReady}
      />
      <div ref={setProblemSectionRef}>
        <ProblemSection />
      </div>
      <FAQSection />
      <FinalCTASection />
      <Footer />
    </>
  );
}
