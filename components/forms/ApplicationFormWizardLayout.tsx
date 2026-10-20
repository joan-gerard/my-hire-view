"use client";

import {
  APPLICATION_FORM_STEPS,
  applicationFormStepIndex,
  isWizardStepCompleted,
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
  /** Whether a step still has the minimum required inputs (drives check marks). */
  stepReady: (id: ApplicationFormStepId) => boolean;
  /** Final step actions (Save / Leave without saving). */
  actions: ReactNode;
}

function pillClassName(args: {
  active: boolean;
  reachable: boolean;
  completed: boolean;
}): string {
  const { active, reachable, completed } = args;
  // Match form shell radius (`ADMIN_PANEL_CLASS` / `rounded-2xl`), not full pills.
  const base =
    "inline-flex w-full items-center justify-center gap-1 rounded-2xl px-2 py-3.5 text-xs font-medium sm:px-2.5 sm:py-4";
  if (active) {
    return `${base} cursor-pointer bg-[var(--ink)] font-semibold text-[var(--white)] ring-2 ring-[var(--lime)] ring-offset-2 ring-offset-[var(--white)]`;
  }
  if (completed) {
    return `${base} cursor-pointer border border-[var(--status-dot-viewed)]/50 bg-[var(--status-wash-viewed)] font-semibold text-[var(--ink)] hover:brightness-[0.98]`;
  }
  if (reachable) {
    return `${base} cursor-pointer border border-[var(--ink)]/15 bg-[var(--paper)] text-[var(--ink)] hover:bg-[var(--status-wash-active)]/60`;
  }
  return `${base} cursor-not-allowed border border-[var(--ink)]/10 bg-[var(--paper)] text-[var(--muted)] opacity-60`;
}

export default function ApplicationFormWizardLayout({
  stepContents,
  currentStepId,
  onStepChange,
  furthestStepId,
  allowAllSteps = false,
  continueBlockedReason = null,
  stepReady,
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

  useEffect(() => {
    if (skipInitialFocusRef.current) {
      skipInitialFocusRef.current = false;
      return;
    }
    headingRef.current?.focus();
  }, [currentStepId]);

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Flat progress — equal-width step pills; no nested cards */}
      <div className="space-y-3">
        <ol
          className="grid w-full gap-1.5 sm:gap-2"
          style={{
            gridTemplateColumns: `repeat(${APPLICATION_FORM_STEPS.length}, minmax(0, 1fr))`,
          }}
          aria-label="Form progress"
        >
          {APPLICATION_FORM_STEPS.map((s, i) => {
            const active = s.id === currentStepId;
            const reachable = isWizardStepReachable(
              i,
              furthestIndex,
              allowAllSteps,
            );
            const completed = isWizardStepCompleted(
              i,
              index,
              stepReady(s.id),
            );
            return (
              <li key={s.id} className="min-w-0">
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
                    <FiCheck className="size-3 shrink-0" strokeWidth={2.5} aria-hidden />
                  ) : null}
                  <span className="truncate">
                    {i + 1}. {s.shortLabel}
                  </span>
                </button>
              </li>
            );
          })}
        </ol>
        <div className="border-l-2 border-[var(--lime)] pl-3">
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

      <div className="space-y-4 sm:space-y-6">
        {stepContents[currentStepId]}
      </div>

      {!isLast ? (
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[var(--ink)]/10 pt-3 sm:pt-4">
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
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[var(--ink)]/10 pt-3 sm:pt-4">
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
