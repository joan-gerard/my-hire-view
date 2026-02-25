"use client";

import EmailCaptureForm from "@/components/public/EmailCaptureForm";
import FAQSection from "@/components/public/FAQSection";
import FinalCTASection from "@/components/public/FinalCTASection";
import Footer from "@/components/public/Footer";
import { HowItWorksSection } from "@/components/public/how-it-works/HowItWorksSection";
import ProblemSection from "@/components/public/ProblemSection";
import SolutionSection from "@/components/public/SolutionSection";
import { useCallback, useEffect, useRef, useState } from "react";

/** Intersection threshold for "Problem section in view" (0–1). Must match ProblemSection. */
const PROBLEM_SECTION_IN_VIEW_THRESHOLD = 0.4;

/**
 * Client-only wrapper for the main landing sections. Holds a ref to the
 * ProblemSection container so HowItWorksSection can trigger dark mode when
 * ProblemSection enters the viewport (instead of when HowItWorksSection does).
 * When ProblemSection is in view, ProblemSection and FAQSection both use dark mode;
 * when it leaves view, both revert to light.
 */
export default function LandingPageSections() {
  const problemSectionRef = useRef<HTMLDivElement>(null);
  const [darkModeTriggerReady, setDarkModeTriggerReady] = useState(false);
  const [problemSectionInView, setProblemSectionInView] = useState(false);

  const setProblemSectionRef = useCallback((el: HTMLDivElement | null) => {
    (
      problemSectionRef as React.MutableRefObject<HTMLDivElement | null>
    ).current = el;
    setDarkModeTriggerReady((prev) => prev || !!el);
  }, []);

  useEffect(() => {
    if (!darkModeTriggerReady || !problemSectionRef.current) return;
    const el = problemSectionRef.current;
    const observer = new IntersectionObserver(
      ([entry]) => setProblemSectionInView(entry.isIntersecting),
      { threshold: PROBLEM_SECTION_IN_VIEW_THRESHOLD, rootMargin: "0px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [darkModeTriggerReady]);

  return (
    <>
      <EmailCaptureForm />
      <SolutionSection />
      <HowItWorksSection
        darkModeTriggerRef={problemSectionRef}
        darkModeTriggerReady={darkModeTriggerReady}
        darkModeTriggerThreshold={PROBLEM_SECTION_IN_VIEW_THRESHOLD}
      />
      <div ref={setProblemSectionRef}>
        <ProblemSection isInView={problemSectionInView} />
      </div>
      <FAQSection isDarkMode={problemSectionInView} />
      <FinalCTASection />
      <Footer />
    </>
  );
}
