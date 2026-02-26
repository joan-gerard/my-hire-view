"use client";

import { motion } from "framer-motion";
import type { RefObject } from "react";
import { useRef } from "react";
import { HOW_IT_WORKS_STEPS } from "./constants";
import { StepCard } from "./StepCard";
import { StepLabel } from "./StepLabel";
import { useHowItWorksObservers } from "./useHowItWorksObservers";

export interface HowItWorksSectionProps {
  /**
   * When provided, dark mode is triggered when this element enters the viewport
   * instead of when this section enters (e.g. pass a ref to ProblemSection wrapper).
   */
  darkModeTriggerRef?: RefObject<HTMLElement | null>;
  /** Set true once the dark mode trigger element has mounted (so the observer can attach). */
  darkModeTriggerReady?: boolean;
  /**
   * When using darkModeTriggerRef, use this threshold (0–1) so dark mode stays in sync
   * with the component that owns the trigger (e.g. same as LandingPageSections).
   */
  darkModeTriggerThreshold?: number;
}

/**
 * "How It Works" section: two columns.
 * Left (1/3): sticky list "Step 1", "Step 2", "Step 3" — each animates when its card is fully in view.
 * Right (2/3): title + 3 cards (video + text). Background turns black when section (or darkModeTriggerRef) enters viewport.
 */
export function HowItWorksSection({
  darkModeTriggerRef,
  darkModeTriggerReady = true,
  darkModeTriggerThreshold,
}: HowItWorksSectionProps = {}) {
  const sectionRef = useRef<HTMLElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);

  const { isMostlyInView, activeSteps, cardInView } = useHowItWorksObservers({
    sectionRef,
    cardRefs,
    videoRefs,
    stepCount: HOW_IT_WORKS_STEPS.length,
    darkModeTriggerRef,
    darkModeTriggerReady,
    darkModeTriggerThreshold,
  });

  return (
    <motion.section
      ref={sectionRef}
      className="bg-white transition-colors duration-500"
      style={
        isMostlyInView
          ? {
              backgroundColor: "#000",
              color: "#fff",
              ["--foreground" as string]: "#fff",
              ["--background" as string]: "#171717",
              ["--secondary-background" as string]: "#000",
            }
          : undefined
      }
    >
      <div className="px-4 md:px-6 lg:px-10 2xl:px-12 pt-16 pb-10 lg:pb-16 h-full max-w-[1700px] mx-auto">
        <div className="grid lg:grid-cols-3 lg:gap-16 mb-12 lg:mb-24">
          <div className="lg:col-span-1"></div>
          <div className="lg:col-span-2 flex flex-col gap-6 max-w-4xl">
            <h2 className="text-4xl sm:text-7xl text-balance tracking-tight">
              Stand Out in <br />
              <span className="">Three Simple Steps</span>
            </h2>
            <p className="text-lg lg:text-xl font-light text-balance leading-normal lg:leading-relaxed">
              Our platform helps you stand out in your job search by providing
              you with the tools and resources you need to succeed.
            </p>
          </div>
        </div>
        <div className="grid gap-12 lg:grid-cols-3 lg:gap-16">
          {/* Left: sticky step labels (1/3) */}
          <div className="hidden lg:block lg:sticky lg:top-24 lg:self-start pt-24">
            <div className="flex flex-col gap-2 sm:flex-row sm:gap-3 lg:flex-col lg:gap-4">
              {HOW_IT_WORKS_STEPS.map((step, index) => (
                <StepLabel
                  key={step.id}
                  step={step}
                  isActive={activeSteps[index] ?? false}
                  isDarkMode={isMostlyInView}
                />
              ))}
            </div>
          </div>

          {/* Right: title + cards (2/3) */}
          <div className="lg:col-span-2">
            <div className="flex flex-col gap-12 sm:gap-16 lg:pr-8 2xl:pr-20">
              {HOW_IT_WORKS_STEPS.map((step, index) => (
                <StepCard
                  key={step.id}
                  step={step}
                  index={index}
                  cardRef={(el) => {
                    cardRefs.current[index] = el;
                  }}
                  videoRef={(el) => {
                    videoRefs.current[index] = el;
                  }}
                  inView={cardInView[index] ?? false}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </motion.section>
  );
}
