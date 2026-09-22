"use client";

import { useCallback, useEffect, useRef, useState, type KeyboardEvent } from "react";

const ASSETS = "https://parley-home.vercel.app/assets/";
const ARROWS = `${ASSETS}arrows.svg`;
const STEP_COUNT = 4;

const FEATURES = [
  {
    label: "Natural language commands",
    desc: 'Just speak naturally — "prep my Monday morning" or "follow up with leads who haven\'t replied in 5 days."',
    src: `${ASSETS}mock-0.png`,
    srcSet: `${ASSETS}mock-0.png 1x, ${ASSETS}mock-0@2x.png 2x`,
  },
  {
    label: "Multi-step task execution",
    desc: "From a single intent, Parley plans the full sequence, runs every step, and recovers when something breaks.",
    src: `${ASSETS}mock-2.png`,
    srcSet: `${ASSETS}mock-2.png 1x, ${ASSETS}mock-2@2x.png 2x`,
  },
  {
    label: "Human-in-the-loop control",
    desc: "Stay in charge of high-stakes actions. Parley pauses for approval whenever the call should be yours.",
    src: `${ASSETS}mock-1.png`,
    srcSet: `${ASSETS}mock-1.png 1x, ${ASSETS}mock-1@2x.png 2x`,
  },
  {
    label: "Persistent user profile",
    desc: "Knows your team, your tools, your customers, across every session, never starting from zero.",
    src: `${ASSETS}mock-3.png`,
    srcSet: `${ASSETS}mock-3.png 1x, ${ASSETS}mock-3@2x.png 2x`,
  },
] as const;

export function DelegationSection() {
  const [step, setStep] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const lockUntil = useRef(0);
  const stepRef = useRef(step);
  stepRef.current = step;

  const goToStep = useCallback((nextRaw: number) => {
    const next = Math.max(0, Math.min(STEP_COUNT - 1, nextRaw));
    if (next === stepRef.current) return;
    setStep(next);
  }, []);

  useEffect(() => {
    const scroll = scrollRef.current;
    if (!scroll) return;

    const triggers = Array.from(
      scroll.querySelectorAll<HTMLElement>(".trigger"),
    );

    const computeStepFromTriggers = () => {
      const middle = window.innerHeight / 2;
      let next = 0;
      for (let i = 0; i < triggers.length; i++) {
        const rect = triggers[i].getBoundingClientRect();
        if (rect.top <= middle) next = i;
      }
      return next;
    };

    const onUpdate = () => {
      if (performance.now() < lockUntil.current) return;
      goToStep(computeStepFromTriggers());
    };

    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        onUpdate();
        ticking = false;
      });
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    onUpdate();

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [goToStep]);

  const onTabClick = (index: number) => {
    const scroll = scrollRef.current;
    if (!scroll) return;
    const sectionTop = scroll.getBoundingClientRect().top + window.scrollY;
    const target =
      sectionTop +
      (index / STEP_COUNT) * (scroll.offsetHeight - window.innerHeight) +
      20;
    const preferReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    lockUntil.current = Number.POSITIVE_INFINITY;
    setStep(index);
    window.scrollTo({
      top: target,
      behavior: preferReduced ? "auto" : "smooth",
    });
    const release = () => {
      lockUntil.current = 0;
      window.removeEventListener("scrollend", release);
    };
    window.addEventListener("scrollend", release, { once: true });
    window.setTimeout(release, preferReduced ? 50 : 1200);
  };

  const onTabKeyDown = (
    event: KeyboardEvent<HTMLButtonElement>,
    index: number,
  ) => {
    if (event.key === "ArrowDown" || event.key === "ArrowRight") {
      event.preventDefault();
      const next = (index + 1) % STEP_COUNT;
      onTabClick(next);
      document.getElementById(`feature-tab-${next}`)?.focus();
    }
    if (event.key === "ArrowUp" || event.key === "ArrowLeft") {
      event.preventDefault();
      const next = (index - 1 + STEP_COUNT) % STEP_COUNT;
      onTabClick(next);
      document.getElementById(`feature-tab-${next}`)?.focus();
    }
  };

  return (
    <section className="delegation" id="delegation">
      <div className="delegation__scroll" id="delegation-scroll" ref={scrollRef}>
        <div className="trigger" data-step="0"></div>
        <div className="trigger" data-step="1"></div>
        <div className="trigger" data-step="2"></div>
        <div className="trigger" data-step="3"></div>
        <div className="delegation__pin">
          <header className="delegation__header">
            <div className="delegation__heading">
              <p className="badge">Intelligent Delegation</p>
              <h2 className="h2">
                Tell Parley once.
                <br />
                <em>It handles the rest.</em>
              </h2>
            </div>
            <p className="delegation__lede">
              Describe a goal in plain language and Parley breaks it into steps,
              selects the right tools, and executes, keeping you updated along
              the way.
            </p>
          </header>
          <div className="delegation__inner">
            <ol className="features" role="tablist">
              {FEATURES.map((feature, index) => (
                <li className="feature" key={feature.label}>
                  <button
                    className="feature__btn"
                    type="button"
                    role="tab"
                    id={`feature-tab-${index}`}
                    data-step={index}
                    aria-selected={step === index}
                    aria-controls={`mock-${index}`}
                    onClick={() => onTabClick(index)}
                    onKeyDown={(event) => onTabKeyDown(event, index)}
                  >
                    <img
                      className="feature__chevron"
                      src={ARROWS}
                      alt=""
                      aria-hidden="true"
                    />
                    <span className="feature__head">
                      <span className="feature__label">{feature.label}</span>
                      <span className="feature__desc">{feature.desc}</span>
                    </span>
                  </button>
                </li>
              ))}
            </ol>

            <div className="stage" aria-live="polite">
              {FEATURES.map((feature, index) => (
                <div
                  className={step === index ? "mock is-active" : "mock"}
                  id={`mock-${index}`}
                  role="tabpanel"
                  data-step={index}
                  hidden={step !== index}
                  key={feature.src}
                >
                  <img
                    className="mock__img"
                    src={feature.src}
                    srcSet={feature.srcSet}
                    alt=""
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
