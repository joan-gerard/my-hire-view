"use client";

import {
  APPLICATION_FORM_STEPS,
  type ApplicationFormStepId,
} from "@/components/forms/application-form-steps";
import {
  applicationFormSplitRecommendations,
  type ApplicationFormSplitMode,
} from "@/components/forms/application-form-split-copy";
import { FiCheck } from "react-icons/fi";
import { useEffect, useRef, type ReactNode } from "react";

export type ApplicationFormStepContentMap = Record<
  ApplicationFormStepId,
  ReactNode
>;

const STEP_SCROLL_MARGIN =
  "scroll-mt-[calc(var(--admin-header-height,72px)+var(--application-page-title-height,0px)+4rem)]";

/** Stacked through 1199px. Half-and-half bands from 1200px. */
const STICKY_TOP =
  "min-[1200px]:top-[calc(var(--admin-header-height,72px)+var(--application-page-title-height,0px)+4rem)]";

export function applicationFormStepDomId(id: ApplicationFormStepId): string {
  return `application-step-${id}`;
}

interface ApplicationFormSplitLayoutProps {
  mode: ApplicationFormSplitMode;
  stepContents: ApplicationFormStepContentMap;
  /** Set when save fails, so the page moves to the band that owns the error. */
  errorScroll: { stepId: ApplicationFormStepId; nonce: number } | null;
  actions: ReactNode;
}

export default function ApplicationFormSplitLayout({
  mode,
  stepContents,
  errorScroll,
  actions,
}: ApplicationFormSplitLayoutProps) {
  const headingRefs = useRef(new Map<ApplicationFormStepId, HTMLHeadingElement>());

  useEffect(() => {
    if (!errorScroll) return;
    const reduce = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const section = document.getElementById(
      applicationFormStepDomId(errorScroll.stepId),
    );
    section?.scrollIntoView({
      behavior: reduce ? "auto" : "smooth",
      block: "start",
    });
    headingRefs.current.get(errorScroll.stepId)?.focus();
  }, [errorScroll]);

  return (
    <div>
      <div className="space-y-16 pt-10 sm:space-y-20 sm:pt-14 min-[1200px]:space-y-24 min-[1200px]:pt-20 min-[1920px]:pt-28">
        {APPLICATION_FORM_STEPS.map((step, index) => {
          const headingId = `${applicationFormStepDomId(step.id)}-title`;
          const recommendations = applicationFormSplitRecommendations(
            mode,
            step.id,
          );
          return (
            <section
              key={step.id}
              id={applicationFormStepDomId(step.id)}
              aria-labelledby={headingId}
              className={`grid grid-cols-1 items-start gap-8 min-[1200px]:grid-cols-2 min-[1200px]:gap-12 ${STEP_SCROLL_MARGIN}`}
            >
              <div
                className={`min-[1200px]:sticky min-[1200px]:self-start ${STICKY_TOP}`}
              >
                <p className="inline-flex items-center gap-2 rounded-full bg-[var(--lime)] px-3.5 py-1.5 text-sm font-medium leading-tight text-[var(--ink)]">
                  <span
                    className="size-[5px] shrink-0 rounded-full bg-[var(--ink)]"
                    aria-hidden
                  />
                  Step {index + 1}
                  <span
                    className="size-[5px] shrink-0 rounded-full bg-[var(--ink)]"
                    aria-hidden
                  />
                </p>
                <h2
                  id={headingId}
                  ref={(node) => {
                    if (node) headingRefs.current.set(step.id, node);
                    else headingRefs.current.delete(step.id);
                  }}
                  tabIndex={-1}
                  className="mt-4 font-heading text-[2.25rem] font-semibold leading-tight tracking-[-0.03em] text-[var(--ink)] outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--ink)] min-[720px]:text-[2.75rem] min-[1200px]:text-[3.5rem] min-[1200px]:leading-[1.08] min-[1920px]:text-[80px] min-[1920px]:leading-[1.05]"
                >
                  {step.title}
                </h2>
                <p className="mt-3 max-w-lg text-base font-normal leading-relaxed text-[var(--muted)] min-[1200px]:text-[17px] min-[1920px]:max-w-xl min-[1920px]:text-[18px]">
                  {step.description}
                </p>
                <ul className="mt-6 max-w-lg space-y-3 text-base font-normal leading-7 min-[1200px]:text-[17px] min-[1920px]:max-w-xl min-[1920px]:text-[18px]">
                  {recommendations.map((item) => (
                    <li
                      key={item}
                      className="flex items-start gap-2.5 text-[var(--ink)]"
                    >
                      <span
                        className="mt-1 flex size-5 shrink-0 items-center justify-center rounded-full bg-[var(--lime)] text-[var(--ink)]"
                        aria-hidden
                      >
                        <FiCheck className="size-3.5" strokeWidth={2.75} />
                      </span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="w-full rounded-[1.75rem] bg-[var(--paper)] p-5 sm:p-8 min-[1200px]:max-w-[800px] min-[1200px]:justify-self-end">
                <div className="application-split-fields space-y-4 sm:space-y-6">
                  {stepContents[step.id]}
                </div>
                {step.id === "review" ? (
                  <div className="mt-8 border-t border-[var(--ink)]/10 pt-6">
                    {actions}
                  </div>
                ) : null}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
