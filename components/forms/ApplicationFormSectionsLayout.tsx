"use client";

import {
  APPLICATION_FORM_STEPS,
  type ApplicationFormStepId,
} from "@/components/forms/application-form-steps";
import Button from "@/components/ui/Button";
import type { ReactNode } from "react";
import { FiCheck, FiChevronDown } from "react-icons/fi";

export type ApplicationFormStepContentMap = Record<
  ApplicationFormStepId,
  ReactNode
>;

interface ApplicationFormSectionsLayoutProps {
  stepContents: ApplicationFormStepContentMap;
  openStepId: ApplicationFormStepId;
  onOpenStepChange: (id: ApplicationFormStepId) => void;
  /** Steps the user has confirmed via Continue (or jumped back from). */
  completedStepIds: ReadonlySet<ApplicationFormStepId>;
  onConfirmStep: (id: ApplicationFormStepId) => void;
  /** When set for the open step, Continue is blocked. */
  continueBlockedReason?: string | null;
  /** Whether a step has the minimum required inputs (shown as a check). */
  stepReady: (id: ApplicationFormStepId) => boolean;
  actions: ReactNode;
}

export default function ApplicationFormSectionsLayout({
  stepContents,
  openStepId,
  onOpenStepChange,
  completedStepIds,
  onConfirmStep,
  continueBlockedReason = null,
  stepReady,
  actions,
}: ApplicationFormSectionsLayoutProps) {
  return (
    <div className="space-y-3">
      {APPLICATION_FORM_STEPS.map((step, index) => {
        const open = step.id === openStepId;
        const completed = completedStepIds.has(step.id);
        const ready = stepReady(step.id);
        const isLast = index === APPLICATION_FORM_STEPS.length - 1;
        const canContinue = !continueBlockedReason;

        return (
          <section
            key={step.id}
            className="overflow-hidden rounded-xl border border-[var(--ink)]/10 bg-[var(--white)]"
          >
            <h2 className="m-0">
              <button
                type="button"
                onClick={() => onOpenStepChange(step.id)}
                aria-expanded={open}
                className="flex w-full cursor-pointer items-center gap-3 px-4 py-3 text-left hover:bg-[var(--ink)]/[0.02] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[var(--ink)]"
              >
                <span
                  className={
                    completed || ready
                      ? "flex size-7 shrink-0 items-center justify-center rounded-full bg-[var(--ink)] text-xs font-semibold text-[var(--white)]"
                      : "flex size-7 shrink-0 items-center justify-center rounded-full border border-[var(--ink)]/15 text-xs font-semibold text-[var(--muted)]"
                  }
                  aria-hidden
                >
                  {completed || ready ? (
                    <FiCheck className="size-3.5" strokeWidth={2.5} />
                  ) : (
                    index + 1
                  )}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-heading text-base font-semibold tracking-[-0.02em] text-[var(--ink)]">
                    Step {index + 1}: {step.title}
                    <span className="ml-2 text-xs font-medium text-[var(--muted)]">
                      ({index + 1}/{APPLICATION_FORM_STEPS.length})
                    </span>
                  </span>
                  {!open ? (
                    <span className="mt-0.5 block text-xs text-[var(--muted)]">
                      {step.description}
                    </span>
                  ) : null}
                </span>
                <FiChevronDown
                  className={
                    open
                      ? "size-4 shrink-0 rotate-180 text-[var(--muted)] transition-transform"
                      : "size-4 shrink-0 text-[var(--muted)] transition-transform"
                  }
                  aria-hidden
                />
              </button>
            </h2>

            {open ? (
              <div className="space-y-6 border-t border-[var(--ink)]/8 px-4 py-4">
                <p className="text-sm text-[var(--muted)]">{step.description}</p>
                <div className="space-y-6">{stepContents[step.id]}</div>

                {!isLast ? (
                  <div className="flex justify-end border-t border-[var(--ink)]/8 pt-4">
                    <div className="group relative inline-flex">
                      <Button
                        type="button"
                        variant="primary"
                        disabled={!canContinue}
                        onClick={() => {
                          if (!canContinue) return;
                          onConfirmStep(step.id);
                        }}
                        aria-describedby={
                          !canContinue && continueBlockedReason
                            ? `sections-continue-${step.id}`
                            : undefined
                        }
                      >
                        Continue to next step
                      </Button>
                      {!canContinue && continueBlockedReason ? (
                        <span
                          id={`sections-continue-${step.id}`}
                          role="tooltip"
                          className="pointer-events-none absolute bottom-full right-0 z-10 mb-2 hidden max-w-xs rounded-md bg-[var(--ink)] px-2.5 py-1.5 text-xs text-[var(--white)] shadow-lg group-hover:block group-focus-within:block"
                        >
                          {continueBlockedReason}
                        </span>
                      ) : null}
                    </div>
                  </div>
                ) : (
                  <div className="border-t border-[var(--ink)]/8 pt-4">
                    {actions}
                  </div>
                )}
              </div>
            ) : null}
          </section>
        );
      })}
    </div>
  );
}
