"use client";

import {
  APPLICATION_FORM_STEPS,
  applicationFormStepIndex,
  isWizardStepReachable,
  type ApplicationFormStepId,
} from "@/components/forms/application-form-steps";
import Button from "@/components/ui/Button";
import { useEffect, useRef, type ReactNode } from "react";
import { FiCheck } from "react-icons/fi";

export type ApplicationFormStepContentMap = Record<
  ApplicationFormStepId,
  ReactNode
>;

interface ApplicationFormWizardLayoutProps {
  stepContents: ApplicationFormStepContentMap;
  currentStepId: ApplicationFormStepId;
  onStepChange: (id: ApplicationFormStepId) => void;
  /**
   * Furthest step unlocked via Continue (create). Pills allow this step and
   * earlier ones even after Back. Ignored when `allowAllSteps` is true.
   */
  furthestStepId: ApplicationFormStepId;
  /**
   * Edit: every progress pill is clickable. Create: use the frontier only.
   */
  allowAllSteps?: boolean;
  /** When set, Continue is blocked and this message is shown. */
  continueBlockedReason?: string | null;
  /** Final step actions (Save / Leave without saving). */
  actions: ReactNode;
}

function pillClassName(args: {
  active: boolean;
  reachable: boolean;
  completed: boolean;
}): string {
  const { active, reachable, completed } = args;
  if (active) {
    return "cursor-pointer rounded-full bg-[var(--ink)] px-2.5 py-1 text-xs font-semibold text-[var(--white)] ring-2 ring-[var(--lime)] ring-offset-2 ring-offset-[var(--white)]";
  }
  if (completed) {
    return "inline-flex cursor-pointer items-center gap-1 rounded-full border border-[var(--status-dot-viewed)]/50 bg-[var(--status-wash-viewed)] px-2.5 py-1 text-xs font-semibold text-[var(--ink)] hover:brightness-[0.98]";
  }
  if (reachable) {
    return "cursor-pointer rounded-full border border-[var(--ink)]/15 bg-[var(--paper)] px-2.5 py-1 text-xs font-medium text-[var(--ink)] hover:bg-[var(--status-wash-active)]/60";
  }
  return "cursor-not-allowed rounded-full border border-[var(--ink)]/10 bg-[var(--white)] px-2.5 py-1 text-xs font-medium text-[var(--muted)] opacity-60";
}

export default function ApplicationFormWizardLayout({
  stepContents,
  currentStepId,
  onStepChange,
  furthestStepId,
  allowAllSteps = false,
  continueBlockedReason = null,
  actions,
}: ApplicationFormWizardLayoutProps) {
  const index = APPLICATION_FORM_STEPS.findIndex((s) => s.id === currentStepId);
  const step = APPLICATION_FORM_STEPS[index] ?? APPLICATION_FORM_STEPS[0];
  const furthestIndex = applicationFormStepIndex(furthestStepId);
  const isFirst = index <= 0;
  const isLast = index >= APPLICATION_FORM_STEPS.length - 1;
  const canContinue = !continueBlockedReason;
  const headingRef = useRef<HTMLHeadingElement>(null);
  const skipInitialFocusRef = useRef(true);
  const progressRatio =
    APPLICATION_FORM_STEPS.length <= 1
      ? 1
      : Math.max(0, index) / (APPLICATION_FORM_STEPS.length - 1);

  useEffect(() => {
    if (skipInitialFocusRef.current) {
      skipInitialFocusRef.current = false;
      return;
    }
    headingRef.current?.focus();
  }, [currentStepId]);

  return (
    <div className="space-y-6">
      <div className="space-y-3 rounded-2xl border border-[var(--ink)]/8 bg-[var(--paper)]/70 p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-xs font-medium text-[var(--muted)]">
            Step {index + 1} of {APPLICATION_FORM_STEPS.length}
          </p>
          <div
            className="h-1.5 w-28 overflow-hidden rounded-full bg-[var(--ink)]/10"
            aria-hidden
          >
            <div
              className="h-full rounded-full bg-[var(--lime)] transition-[width] duration-300 ease-out"
              style={{ width: `${Math.round(progressRatio * 100)}%` }}
            />
          </div>
        </div>
        <ol className="flex flex-wrap gap-2" aria-label="Form progress">
          {APPLICATION_FORM_STEPS.map((s, i) => {
            const active = s.id === currentStepId;
            const reachable = isWizardStepReachable(
              i,
              furthestIndex,
              allowAllSteps,
            );
            const completed = reachable && i < index;
            return (
              <li key={s.id}>
                <button
                  type="button"
                  onClick={() => {
                    if (reachable) onStepChange(s.id);
                  }}
                  disabled={!reachable}
                  className={pillClassName({ active, reachable, completed })}
                  aria-current={active ? "step" : undefined}
                >
                  {completed ? (
                    <FiCheck className="size-3" strokeWidth={2.5} aria-hidden />
                  ) : null}
                  {i + 1}. {s.shortLabel}
                </button>
              </li>
            );
          })}
        </ol>
        <div className="relative overflow-hidden rounded-xl border border-[var(--ink)]/8 bg-[var(--white)] px-4 py-3 pl-5">
          <span
            className="absolute inset-y-0 left-0 w-1 bg-[var(--lime)]"
            aria-hidden
          />
          <h2
            ref={headingRef}
            tabIndex={-1}
            className="font-heading text-xl font-semibold tracking-[-0.02em] text-[var(--ink)] outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ink)]"
          >
            {step.title}
          </h2>
          <p className="mt-1 text-sm text-[var(--muted)]">{step.description}</p>
        </div>
      </div>

      <div className="space-y-6">{stepContents[currentStepId]}</div>

      {!isLast ? (
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[var(--ink)]/10 pt-4">
          <Button
            type="button"
            variant="secondary"
            onClick={() => {
              if (!isFirst) {
                onStepChange(APPLICATION_FORM_STEPS[index - 1].id);
              }
            }}
            disabled={isFirst}
          >
            Back
          </Button>
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
                onStepChange(APPLICATION_FORM_STEPS[index + 1].id);
              }}
              aria-describedby={
                !canContinue && continueBlockedReason
                  ? "wizard-continue-blocked-reason"
                  : undefined
              }
            >
              Continue
            </Button>
            {!canContinue && continueBlockedReason ? (
              <span
                id="wizard-continue-blocked-reason"
                role="tooltip"
                className="pointer-events-none absolute bottom-full right-0 z-10 mb-2 hidden max-w-xs rounded-md bg-[var(--ink)] px-2.5 py-1.5 text-xs text-[var(--white)] shadow-lg group-hover:block group-focus-within:block"
              >
                {continueBlockedReason}
              </span>
            ) : null}
          </div>
        </div>
      ) : (
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[var(--ink)]/10 pt-4">
          <Button
            type="button"
            variant="secondary"
            onClick={() =>
              onStepChange(APPLICATION_FORM_STEPS[index - 1].id)
            }
          >
            Back
          </Button>
          {actions}
        </div>
      )}
    </div>
  );
}
