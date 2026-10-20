"use client";

import {
  APPLICATION_FORM_STEPS,
  type ApplicationFormStepId,
} from "@/components/forms/application-form-steps";
import Button from "@/components/ui/Button";
import { useEffect, useRef, type ReactNode } from "react";
import { FiCheck, FiChevronDown } from "react-icons/fi";

export type ApplicationFormStepContentMap = Record<
  ApplicationFormStepId,
  ReactNode
>;

interface ApplicationFormSectionsLayoutProps {
  stepContents: ApplicationFormStepContentMap;
  /** Open section, or `null` when all sections are collapsed. */
  openStepId: ApplicationFormStepId | null;
  onOpenStepChange: (id: ApplicationFormStepId | null) => void;
  /** Steps the user has confirmed via Continue. */
  completedStepIds: ReadonlySet<ApplicationFormStepId>;
  onConfirmStep: (id: ApplicationFormStepId) => void;
  /** When set for the open step, Continue is blocked. */
  continueBlockedReason?: string | null;
  /** Whether a step has the minimum required inputs. */
  stepReady: (id: ApplicationFormStepId) => boolean;
  actions: ReactNode;
}

function markerClassName(args: {
  open: boolean;
  showComplete: boolean;
}): string {
  const { open, showComplete } = args;
  if (showComplete) {
    return "flex size-7 shrink-0 items-center justify-center rounded-full border border-[var(--status-dot-viewed)]/50 bg-[var(--status-wash-viewed)] text-xs font-semibold text-[var(--ink)]";
  }
  if (open) {
    return "flex size-7 shrink-0 items-center justify-center rounded-full bg-[var(--ink)] text-xs font-semibold text-[var(--white)] ring-2 ring-[var(--lime)] ring-offset-2 ring-offset-[var(--white)]";
  }
  return "flex size-7 shrink-0 items-center justify-center rounded-full border border-[var(--ink)]/15 bg-[var(--paper)] text-xs font-semibold text-[var(--muted)]";
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
  const headerRefs = useRef(
    new Map<ApplicationFormStepId, HTMLButtonElement>(),
  );
  const skipInitialFocusRef = useRef(true);

  useEffect(() => {
    if (skipInitialFocusRef.current) {
      skipInitialFocusRef.current = false;
      return;
    }
    if (openStepId == null) return;
    headerRefs.current.get(openStepId)?.focus();
  }, [openStepId]);

  return (
    <div className="divide-y divide-[var(--ink)]/10">
      {APPLICATION_FORM_STEPS.map((step, index) => {
        const open = step.id === openStepId;
        const ready = stepReady(step.id);
        /** Confirmed and still valid — drop the check if the user invalidates fields. */
        const showComplete = completedStepIds.has(step.id) && ready;
        const isLast = index === APPLICATION_FORM_STEPS.length - 1;
        const canContinue = !continueBlockedReason;
        const panelId = `application-form-section-panel-${step.id}`;

        return (
          <section key={step.id} className="relative">
            <h2 className="m-0">
              <button
                type="button"
                ref={(el) => {
                  if (el) headerRefs.current.set(step.id, el);
                  else headerRefs.current.delete(step.id);
                }}
                onClick={() => onOpenStepChange(open ? null : step.id)}
                aria-expanded={open}
                aria-controls={panelId}
                className={
                  open
                    ? "flex w-full cursor-pointer items-center gap-3 border-l-2 border-[var(--lime)] py-3 pl-3 text-left hover:bg-[var(--ink)]/[0.02] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[var(--ink)]"
                    : showComplete
                      ? "flex w-full cursor-pointer items-center gap-3 bg-[var(--status-wash-viewed)]/40 py-3 text-left hover:bg-[var(--status-wash-viewed)]/70 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[var(--ink)]"
                      : "flex w-full cursor-pointer items-center gap-3 py-3 text-left hover:bg-[var(--ink)]/[0.02] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[var(--ink)]"
                }
              >
                <span
                  className={markerClassName({ open, showComplete })}
                  aria-hidden
                >
                  {showComplete ? (
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
                      ? "size-4 shrink-0 rotate-180 text-[var(--ink)] transition-transform"
                      : "size-4 shrink-0 text-[var(--muted)] transition-transform"
                  }
                  aria-hidden
                />
              </button>
            </h2>

            <div
              id={panelId}
              hidden={!open}
              className={
                open
                  ? "space-y-4 border-l-2 border-[var(--lime)] py-3 pl-3 sm:space-y-6"
                  : undefined
              }
            >
              {open ? (
                <>
                  <p className="text-sm text-[var(--muted)]">
                    {step.description}
                  </p>
                  <div className="space-y-4 sm:space-y-6">
                    {stepContents[step.id]}
                  </div>

                  {!isLast ? (
                    <div className="flex justify-end border-t border-[var(--ink)]/8 pt-3 sm:pt-4">
                      <div className="group relative inline-flex">
                        <Button
                          type="button"
                          variant="primary"
                          aria-disabled={!canContinue ? true : undefined}
                          className={
                            !canContinue
                              ? "cursor-not-allowed opacity-50 hover:opacity-50"
                              : undefined
                          }
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
                    <div className="border-t border-[var(--ink)]/8 pt-3 sm:pt-4">
                      {actions}
                    </div>
                  )}
                </>
              ) : null}
            </div>
          </section>
        );
      })}
    </div>
  );
}
