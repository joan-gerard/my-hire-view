"use client";

import {
  AUTOPLAY_DELAY_MS,
  AUTOPLAY_VIEW_THRESHOLD,
  HOW_IT_WORKS_STEPS,
} from "@/components/public/how-it-works";
import { useEffect, useRef, type MutableRefObject } from "react";
import { ArrowButton, ArrowIcon, RollLabel } from "./ArrowButton";

function useStepVideoAutoplay(
  videoRef: MutableRefObject<HTMLVideoElement | null>,
  rootRef: MutableRefObject<HTMLElement | null>,
  src: string,
) {
  useEffect(() => {
    const videoNode = videoRef.current;
    const rootNode = rootRef.current;
    if (!videoNode || !rootNode) return;
    // Explicit non-null locals so nested closures keep the narrowed type.
    const video: HTMLVideoElement = videoNode;
    const root: HTMLElement = rootNode;

    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    let playTimeout: ReturnType<typeof setTimeout> | null = null;
    let inView = false;

    function clearPending() {
      if (playTimeout !== null) {
        clearTimeout(playTimeout);
        playTimeout = null;
      }
    }

    function stopAndUnload() {
      clearPending();
      video.pause();
      if (video.getAttribute("src")) {
        video.removeAttribute("src");
        video.load();
      }
    }

    function pausePlayback() {
      clearPending();
      video.pause();
    }

    function schedulePlay() {
      if (motionQuery.matches || !inView) return;
      clearPending();
      if (!video.getAttribute("src")) {
        video.src = src;
      }
      playTimeout = setTimeout(() => {
        playTimeout = null;
        if (motionQuery.matches || !inView) return;
        void video.play().catch(() => {
          /* Decorative autoplay may be blocked; ignore. */
        });
      }, AUTOPLAY_DELAY_MS);
    }

    function sync() {
      if (motionQuery.matches) {
        stopAndUnload();
        return;
      }
      if (inView) {
        schedulePlay();
      } else {
        pausePlayback();
      }
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        inView = Boolean(entry?.isIntersecting);
        sync();
      },
      { threshold: AUTOPLAY_VIEW_THRESHOLD },
    );
    observer.observe(root);
    motionQuery.addEventListener("change", sync);

    return () => {
      clearPending();
      observer.disconnect();
      motionQuery.removeEventListener("change", sync);
      video.pause();
    };
  }, [src]);
}

function StepVideo({ src, title }: { src: string; title: string }) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const rootRef = useRef<HTMLDivElement | null>(null);
  useStepVideoAutoplay(videoRef, rootRef, src);

  return (
    <div ref={rootRef} className="ot-case-media" aria-hidden="true">
      <video
        ref={videoRef}
        muted
        loop
        playsInline
        preload="none"
        aria-label={title}
      />
    </div>
  );
}

function useCaseRecess(
  caseRefs: MutableRefObject<Array<HTMLElement | null>>,
) {
  useEffect(() => {
    const desktopQuery = window.matchMedia("(min-width: 721px)");
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const workTop = document.querySelector<HTMLElement>(".ot-work-top");
    const workList = document.querySelector<HTMLElement>(".ot-work-list");

    function coverage(current: DOMRect, next: DOMRect): number {
      if (current.height <= 0) return 0;
      return Math.min(
        1,
        Math.max(0, (current.bottom - next.top) / current.height),
      );
    }

    /** Ease recess from ~half covered through nearly full cover. */
    function recessProgress(amount: number): number {
      const start = 0.45;
      const end = 0.95;
      const t = Math.min(1, Math.max(0, (amount - start) / (end - start)));
      return t * t * (3 - 2 * t);
    }

    function setRecess(el: HTMLElement | null, value: number) {
      if (!el) return;
      el.style.setProperty("--ot-recess", value.toFixed(4));
    }

    /** Keep cards below the sticky How-to header (taller when Get started wraps). */
    function syncCaseStickyTop(enabled: boolean) {
      if (!workList) return;
      if (!enabled || !workTop) {
        workList.style.removeProperty("--ot-case-sticky-top");
        return;
      }
      const stickyOffset = Number.parseFloat(getComputedStyle(workTop).top) || 0;
      const gap = 16;
      const top = Math.ceil(stickyOffset + workTop.offsetHeight + gap);
      workList.style.setProperty("--ot-case-sticky-top", `${top}px`);
    }

    function update() {
      const stacking = desktopQuery.matches && !motionQuery.matches;
      syncCaseStickyTop(stacking);

      const [first, second, third] = caseRefs.current;

      if (!stacking) {
        setRecess(first, 0);
        setRecess(second, 0);
        setRecess(third, 0);
        return;
      }

      if (!first || !second || !third) return;

      const firstRect = first.getBoundingClientRect();
      const secondRect = second.getBoundingClientRect();
      const thirdRect = third.getBoundingClientRect();

      setRecess(first, recessProgress(coverage(firstRect, secondRect)));
      setRecess(second, recessProgress(coverage(secondRect, thirdRect)));
      setRecess(third, 0);
    }

    let frame = 0;
    function onScrollOrResize() {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(update);
    }

    update();
    window.addEventListener("scroll", onScrollOrResize, { passive: true });
    window.addEventListener("resize", onScrollOrResize);
    desktopQuery.addEventListener("change", onScrollOrResize);
    motionQuery.addEventListener("change", onScrollOrResize);

    // Font swap / wrap can change .ot-work-top height without scroll or resize.
    let workTopObserver: ResizeObserver | null = null;
    if (workTop && typeof ResizeObserver !== "undefined") {
      workTopObserver = new ResizeObserver(onScrollOrResize);
      workTopObserver.observe(workTop);
    }

    let cancelled = false;
    if (document.fonts?.ready) {
      void document.fonts.ready.then(() => {
        if (!cancelled) onScrollOrResize();
      });
    }

    return () => {
      cancelled = true;
      cancelAnimationFrame(frame);
      workTopObserver?.disconnect();
      window.removeEventListener("scroll", onScrollOrResize);
      window.removeEventListener("resize", onScrollOrResize);
      desktopQuery.removeEventListener("change", onScrollOrResize);
      motionQuery.removeEventListener("change", onScrollOrResize);
      workList?.style.removeProperty("--ot-case-sticky-top");
    };
  }, []);
}

export function HowItWorks() {
  const caseRefs = useRef<Array<HTMLElement | null>>([]);
  useCaseRecess(caseRefs);

  return (
    <section className="ot-work" id="how" aria-labelledby="how-title">
      <div className="ot-wrap">
        <div className="ot-work-top">
          <div className="ot-work-intro">
            <h2 id="how-title">How to</h2>
            <p>
              Our platform helps you stand out in your job search by providing
              you with the tools and resources you need to succeed.
            </p>
          </div>
          <ArrowButton href="/login" label="Get started" tone="dark" />
        </div>
        <div className="ot-work-list">
          {HOW_IT_WORKS_STEPS.map((step, index) => (
            <article
              key={step.id}
              ref={(node) => {
                caseRefs.current[index] = node;
              }}
              className="ot-case"
            >
              <StepVideo src={step.video} title={step.title} />
              <div className="ot-case-info">
                <div className="ot-case-top">
                  <div className="ot-case-badges">
                    <span className="ot-case-badge">Step {step.id}</span>
                  </div>
                  <div className="ot-case-copy">
                    <h3>{step.title}</h3>
                    <p>{step.description}</p>
                  </div>
                </div>
                <div className="ot-case-bottom">
                  <div className="ot-case-metric">
                    <p className="ot-case-metric-value">
                      {String(step.id).padStart(2, "0")}
                    </p>
                    <p className="ot-case-metric-label">of three steps</p>
                  </div>
                  <a className="ot-case-cta" href="/login">
                    <RollLabel text="Get started" />
                    <span className="ot-case-cta-icon" aria-hidden="true">
                      <ArrowIcon />
                    </span>
                  </a>
                </div>
              </div>
            </article>
          ))}
          <div className="ot-work-spacer" aria-hidden="true" />
        </div>
      </div>
    </section>
  );
}
