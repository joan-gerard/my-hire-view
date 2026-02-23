"use client";

import { viewport } from "@/lib/landing-animations";
import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";

const STEPS = [
  {
    id: 1,
    title: "Create Your Application",
    description:
      "Upload your CV, record a video pitch, and add your portfolio link.",
    video: "/step-1.mp4",
  },
  {
    id: 2,
    title: "Share Your Link",
    description:
      "Send your custom URL to recruiters via email, LinkedIn, or job applications.",
    video: "/step-2.mp4",
  },
  {
    id: 3,
    title: "Track & Follow Up",
    description:
      "See when recruiters view your application and follow up strategically.",
    video: "/step-3.mp4",
  },
];

/** Section visibility threshold for dark theme (0–1). */
const IN_VIEW_THRESHOLD = 0.2;
/** Card visibility threshold to mark step as active (0–1). Use 1 for fully visible. */
const CARD_IN_VIEW_THRESHOLD = 1;
/** Card is "in viewport" for width when this fraction is visible. Below this, card shrinks to 95% (starts before fully exiting). */
const CARD_WIDTH_VIEW_THRESHOLD = 0.15;
/** Delay in ms before step videos start autoplaying after card enters viewport. */
const AUTOPLAY_DELAY_MS = 1500;
/** Card visibility threshold to trigger autoplay delay (0–1). When card enters viewport, delay then play. */
const AUTOPLAY_VIEW_THRESHOLD = 0.1;

/**
 * "How It Works" section: two columns.
 * Left (1/3): sticky list "Step 1", "Step 2", "Step 3" — each animates when its card is fully in view.
 * Right (2/3): title + 3 cards (image + text). Background turns black when section enters viewport.
 */
export default function HowItWorksSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);
  const autoplayTimeoutsRef = useRef<(ReturnType<typeof setTimeout> | null)[]>(
    [],
  );

  const [isMostlyInView, setIsMostlyInView] = useState(false);
  const [activeSteps, setActiveSteps] = useState<boolean[]>([
    false,
    false,
    false,
  ]);
  /** True when card has any part in viewport (drives width: narrow when false). */
  const [cardInView, setCardInView] = useState<boolean[]>([
    false,
    false,
    false,
  ]);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    const sectionObserver = new IntersectionObserver(
      ([entry]) => setIsMostlyInView(entry.isIntersecting),
      { threshold: IN_VIEW_THRESHOLD, rootMargin: "0px" },
    );
    sectionObserver.observe(el);

    const cardObserver = new IntersectionObserver(
      (entries) => {
        setActiveSteps((prev) => {
          const next = [...prev];
          let changed = false;
          for (const entry of entries) {
            const index = cardRefs.current.indexOf(
              entry.target as HTMLDivElement,
            );
            if (index >= 0 && next[index] !== entry.isIntersecting) {
              next[index] = entry.isIntersecting;
              changed = true;
            }
          }
          return changed ? next : prev;
        });
      },
      { threshold: CARD_IN_VIEW_THRESHOLD, rootMargin: "0px" },
    );

    const widthObserver = new IntersectionObserver(
      (entries) => {
        setCardInView((prev) => {
          const next = [...prev];
          let changed = false;
          for (const entry of entries) {
            const index = cardRefs.current.indexOf(
              entry.target as HTMLDivElement,
            );
            if (index >= 0 && next[index] !== entry.isIntersecting) {
              next[index] = entry.isIntersecting;
              changed = true;
            }
          }
          return changed ? next : prev;
        });
      },
      { threshold: CARD_WIDTH_VIEW_THRESHOLD, rootMargin: "0px" },
    );

    const autoplayObserver = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const index = cardRefs.current.indexOf(
            entry.target as HTMLDivElement,
          );
          if (index < 0) continue;
          if (entry.isIntersecting) {
            if (autoplayTimeoutsRef.current[index])
              clearTimeout(autoplayTimeoutsRef.current[index]!);
            autoplayTimeoutsRef.current[index] = setTimeout(() => {
              videoRefs.current[index]?.play().catch(() => {});
              autoplayTimeoutsRef.current[index] = null;
            }, AUTOPLAY_DELAY_MS);
          } else {
            if (autoplayTimeoutsRef.current[index]) {
              clearTimeout(autoplayTimeoutsRef.current[index]!);
              autoplayTimeoutsRef.current[index] = null;
            }
            videoRefs.current[index]?.pause();
          }
        }
      },
      { threshold: AUTOPLAY_VIEW_THRESHOLD, rootMargin: "0px" },
    );

    const observed: HTMLDivElement[] = [];
    const scheduleObserve = () => {
      cardRefs.current.forEach((node) => {
        if (node && !observed.includes(node)) {
          cardObserver.observe(node);
          widthObserver.observe(node);
          autoplayObserver.observe(node);
          observed.push(node);
        }
      });
    };
    scheduleObserve();
    const raf = requestAnimationFrame(scheduleObserve);

    return () => {
      cancelAnimationFrame(raf);
      sectionObserver.disconnect();
      autoplayTimeoutsRef.current.forEach((t) => t != null && clearTimeout(t));
      autoplayTimeoutsRef.current = [];
      observed.forEach((node) => {
        cardObserver.unobserve(node);
        widthObserver.unobserve(node);
        autoplayObserver.unobserve(node);
      });
    };
  }, []);

  return (
    <motion.section
      ref={sectionRef}
      className="bg-[var(--secondary-background)] px-4 py-16 sm:px-6 sm:py-20 lg:px-8 transition-colors duration-500"
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
      <div className="mx-auto max-w-6xl">
        <div className="grid gap-12 lg:grid-cols-3 lg:gap-16">
          {/* Left: sticky step labels (1/3) */}
          <div className="lg:sticky lg:top-24 lg:self-start">
            <div className="flex flex-col gap-6 sm:flex-row sm:gap-8 lg:flex-col lg:gap-10">
              {STEPS.map((step, index) => (
                <motion.div
                  key={step.id}
                  className="flex items-center gap-3"
                  animate={{
                    scale: activeSteps[index] ? 1.05 : 1,
                    x: activeSteps[index] ? 4 : 0,
                  }}
                  transition={{ type: "spring", stiffness: 400, damping: 25 }}
                >
                  <span
                    className={`text-2xl font-semibold transition-colors duration-300 sm:text-3xl lg:text-3xl ${
                      activeSteps[index]
                        ? "text-[var(--brand-primary)]"
                        : "text-[var(--foreground)]/70"
                    }`}
                  >
                    Step {step.id}
                  </span>
                  {activeSteps[index] && (
                    <motion.span
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: 24 }}
                      className="inline-block h-0.5 flex-shrink-0 bg-[var(--brand-primary)]"
                      aria-hidden
                    />
                  )}
                </motion.div>
              ))}
            </div>
          </div>

          {/* Right: title + cards (2/3) */}
          <div className="lg:col-span-2">
            <h2 className="text-3xl font-bold tracking-tight text-[var(--foreground)] sm:text-4xl">
              Stand Out in Three Simple Steps
            </h2>

            <div className="mt-10 flex flex-col gap-12 sm:gap-16">
              {STEPS.map((step, index) => (
                <motion.div
                  key={step.id}
                  ref={(el) => {
                    cardRefs.current[index] = el;
                  }}
                  className="mx-auto flex w-full max-w-full flex-col rounded-xl bg-[var(--background)] overflow-hidden shadow-sm border border-[var(--foreground)]/10"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={viewport}
                  animate={{
                    maxWidth: cardInView[index] ? "100%" : "95%",
                    scale: cardInView[index] ? 1 : 0.95,
                  }}
                  transition={{
                    y: { duration: 0.4, delay: index * 0.05 },
                    maxWidth: { duration: 0.9, ease: "easeInOut" },
                    scale: { duration: 0.9, ease: "easeInOut" },
                  }}
                  style={{
                    marginLeft: "auto",
                    marginRight: "auto",
                    transformOrigin: "center center",
                  }}
                >
                  <div className="relative aspect-video w-full bg-[var(--foreground)]/5">
                    <video
                      ref={(el) => {
                        videoRefs.current[index] = el;
                      }}
                      src={step.video}
                      className="h-full w-full object-cover"
                      muted
                      loop
                      playsInline
                      aria-label={step.title}
                    />
                  </div>
                  <div className="p-6">
                    <h3 className="text-lg font-semibold text-[var(--foreground)]">
                      {step.title}
                    </h3>
                    <p className="mt-2 text-[var(--foreground)]/80">
                      {step.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </motion.section>
  );
}
