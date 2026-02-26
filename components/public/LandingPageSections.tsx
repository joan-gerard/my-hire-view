"use client";

import EmailCaptureForm from "@/components/public/EmailCaptureForm";
import FAQSection from "@/components/public/FAQSection";
import FinalCTASection from "@/components/public/FinalCTASection";
import Footer from "@/components/public/Footer";
import { HowItWorksSection } from "@/components/public/how-it-works/HowItWorksSection";
import ProblemSection from "@/components/public/ProblemSection";
import SolutionSection from "@/components/public/SolutionSection";
import { useMobileViewport } from "@/hooks/useMobileViewport";
import { useCallback, useEffect, useRef, useState } from "react";

/** Intersection threshold for "Problem section in view" on mobile (viewport ≤767px). */
const PROBLEM_SECTION_IN_VIEW_THRESHOLD_MOBILE = 0.2;
/** Intersection threshold for "Problem section in view" on desktop (viewport ≥768px). */
const PROBLEM_SECTION_IN_VIEW_THRESHOLD_DESKTOP = 0.4;

/**
 * Client-only wrapper for the main landing sections. Owns the single
 * IntersectionObserver for the ProblemSection wrapper. When ProblemSection is
 * in view, HowItWorksSection, ProblemSection, and FAQSection all use dark styling;
 * when it leaves view, they revert to light. Uses a lower threshold on mobile (0.2)
 * and 0.4 on desktop (≥768px).
 */
export default function LandingPageSections() {
  const problemSectionRef = useRef<HTMLDivElement>(null);
  const [problemSectionMounted, setProblemSectionMounted] = useState(false);
  const [problemSectionInView, setProblemSectionInView] = useState(false);
  const isMobile = useMobileViewport();
  const threshold = isMobile
    ? PROBLEM_SECTION_IN_VIEW_THRESHOLD_MOBILE
    : PROBLEM_SECTION_IN_VIEW_THRESHOLD_DESKTOP;

  const setProblemSectionRef = useCallback((el: HTMLDivElement | null) => {
    (
      problemSectionRef as React.MutableRefObject<HTMLDivElement | null>
    ).current = el;
    setProblemSectionMounted((prev) => prev || !!el);
  }, []);

  useEffect(() => {
    if (!problemSectionMounted || !problemSectionRef.current) return;
    const el = problemSectionRef.current;
    const observer = new IntersectionObserver(
      ([entry]) => setProblemSectionInView(entry.isIntersecting),
      { threshold, rootMargin: "0px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [problemSectionMounted, threshold]);

  return (
    <>
      <EmailCaptureForm />
      <SolutionSection />
      <HowItWorksSection isDarkMode={problemSectionInView} />
      <div ref={setProblemSectionRef}>
        <ProblemSection isDarkMode={problemSectionInView} />
      </div>
      <FAQSection isDarkMode={problemSectionInView} />
      <FinalCTASection />
      <Footer />
    </>
  );
}
