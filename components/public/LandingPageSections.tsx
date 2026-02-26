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
 * Client-only wrapper for the main landing sections. Owns the single
 * IntersectionObserver for the ProblemSection wrapper. When ProblemSection is
 * in view, HowItWorksSection, ProblemSection, and FAQSection all use dark styling;
 * when it leaves view, they revert to light.
 */
export default function LandingPageSections() {
  const problemSectionRef = useRef<HTMLDivElement>(null);
  const [problemSectionMounted, setProblemSectionMounted] = useState(false);
  const [problemSectionInView, setProblemSectionInView] = useState(false);

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
      { threshold: PROBLEM_SECTION_IN_VIEW_THRESHOLD, rootMargin: "0px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [problemSectionMounted]);

  return (
    <>
      <EmailCaptureForm />
      <SolutionSection />
      <HowItWorksSection problemSectionInView={problemSectionInView} />
      <div ref={setProblemSectionRef}>
        <ProblemSection isInView={problemSectionInView} />
      </div>
      <FAQSection isDarkMode={problemSectionInView} />
      <FinalCTASection />
      <Footer />
    </>
  );
}
