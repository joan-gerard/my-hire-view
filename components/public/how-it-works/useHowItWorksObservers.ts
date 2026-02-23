"use client";

import {
  useEffect,
  useRef,
  useState,
  type Dispatch,
  type RefObject,
  type SetStateAction,
} from "react";
import {
  AUTOPLAY_DELAY_MS,
  AUTOPLAY_VIEW_THRESHOLD,
  CARD_IN_VIEW_THRESHOLD,
  CARD_WIDTH_VIEW_THRESHOLD,
  IN_VIEW_THRESHOLD,
} from "./constants";

export interface UseHowItWorksObserversArgs {
  sectionRef: RefObject<HTMLElement | null>;
  cardRefs: RefObject<(HTMLDivElement | null)[]>;
  videoRefs: RefObject<(HTMLVideoElement | null)[]>;
  stepCount: number;
}

export interface UseHowItWorksObserversResult {
  isMostlyInView: boolean;
  activeSteps: boolean[];
  /** True when card has any part in viewport (drives width/scale). */
  cardInView: boolean[];
}

/**
 * Sets up intersection observers for the How It Works section:
 * - Section in view → dark theme
 * - Card fully in view → active step label
 * - Card partially in view → width/scale and video autoplay
 */
export function useHowItWorksObservers({
  sectionRef,
  cardRefs,
  videoRefs,
  stepCount,
}: UseHowItWorksObserversArgs): UseHowItWorksObserversResult {
  const [isMostlyInView, setIsMostlyInView] = useState(false);
  const [activeSteps, setActiveSteps] = useState<boolean[]>(() =>
    Array.from({ length: stepCount }, () => false),
  );
  const [cardInView, setCardInView] = useState<boolean[]>(() =>
    Array.from({ length: stepCount }, () => false),
  );

  const autoplayTimeoutsRef = useRef<(ReturnType<typeof setTimeout> | null)[]>(
    [],
  );

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    const sectionObserver = new IntersectionObserver(
      ([entry]) => setIsMostlyInView(entry.isIntersecting),
      { threshold: IN_VIEW_THRESHOLD, rootMargin: "0px" },
    );
    sectionObserver.observe(el);

    const updateSteps = (
      entries: IntersectionObserverEntry[],
      setter: Dispatch<SetStateAction<boolean[]>>,
    ) => {
      const cards = cardRefs.current;
      if (!cards) return;
      setter((prev) => {
        const next = [...prev];
        let changed = false;
        for (const entry of entries) {
          const index = cards.indexOf(entry.target as HTMLDivElement);
          if (index >= 0 && next[index] !== entry.isIntersecting) {
            next[index] = entry.isIntersecting;
            changed = true;
          }
        }
        return changed ? next : prev;
      });
    };

    const cardObserver = new IntersectionObserver(
      (entries) => updateSteps(entries, setActiveSteps),
      { threshold: CARD_IN_VIEW_THRESHOLD, rootMargin: "0px" },
    );

    const widthObserver = new IntersectionObserver(
      (entries) => updateSteps(entries, setCardInView),
      { threshold: CARD_WIDTH_VIEW_THRESHOLD, rootMargin: "0px" },
    );

    const autoplayObserver = new IntersectionObserver(
      (entries) => {
        const cards = cardRefs.current;
        const videos = videoRefs.current;
        if (!cards || !videos) return;
        for (const entry of entries) {
          const index = cards.indexOf(entry.target as HTMLDivElement);
          if (index < 0) continue;
          if (entry.isIntersecting) {
            if (autoplayTimeoutsRef.current[index])
              clearTimeout(autoplayTimeoutsRef.current[index]!);
            autoplayTimeoutsRef.current[index] = setTimeout(() => {
              videos[index]?.play().catch(() => {});
              autoplayTimeoutsRef.current[index] = null;
            }, AUTOPLAY_DELAY_MS);
          } else {
            if (autoplayTimeoutsRef.current[index]) {
              clearTimeout(autoplayTimeoutsRef.current[index]!);
              autoplayTimeoutsRef.current[index] = null;
            }
            videos[index]?.pause();
          }
        }
      },
      { threshold: AUTOPLAY_VIEW_THRESHOLD, rootMargin: "0px" },
    );

    const observed: HTMLDivElement[] = [];
    const scheduleObserve = () => {
      cardRefs.current?.forEach((node) => {
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
  }, [sectionRef, cardRefs, videoRefs, stepCount]);

  return { isMostlyInView, activeSteps, cardInView };
}
