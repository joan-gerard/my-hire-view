"use client";

import {
  APPLICATION_FORM_STEPS,
  type ApplicationFormStepId,
} from "@/components/forms/application-form-steps";
import Button from "@/components/ui/Button";
import type { ReactNode } from "react";

export type ApplicationFormStepContentMap = Record<
  ApplicationFormStepId,
  ReactNode
>;

interface ApplicationFormWizardLayoutProps {
  stepContents: ApplicationFormStepContentMap;
  currentStepId: ApplicationFormStepId;
  onStepChange: (id: ApplicationFormStepId) => void;
  /** When set, Continue is blocked and this message is shown. */
  continueBlockedReason?: string | null;
  /** Final step actions (Save / Cancel). */
  actions: ReactNode;
}

export default function ApplicationFormWizardLayout({
  stepContents,
  currentStepId,
  onStepChange,
  continueBlockedReason = null,
  actions,
}: ApplicationFormWizardLayoutProps) {
  const index = APPLICATION_FORM_STEPS.findIndex((s) => s.id === currentStepId);
  const step = APPLICATION_FORM_STEPS[index] ?? APPLICATION_FORM_STEPS[0];
  const isFirst = index <= 0;
  const isLast = index >= APPLICATION_FORM_STEPS.length - 1;
  const canContinue = !continueBlockedReason;

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <p className="text-xs font-medium text-[var(--muted)]">
          Step {index + 1} of {APPLICATION_FORM_STEPS.length}
        </p>
        <ol className="flex flex-wrap gap-2" aria-label="Form progress">
          {APPLICATION_FORM_STEPS.map((s, i) => {
            const active = s.id === currentStepId;
            const done = i < index;
            return (
              <li key={s.id}>
                <button
                  type="button"
                  onClick={() => {
                    if (i <= index) onStepChange(s.id);
                  }}
                  disabled={i > index}
                  className={
                    active
                      ? "cursor-pointer rounded-full bg-[var(--ink)] px-2.5 py-1 text-xs font-semibold text-[var(--white)]"
                      : done
                        ? "cursor-pointer rounded-full border border-[var(--ink)]/20 bg-[var(--white)] px-2.5 py-1 text-xs font-medium text-[var(--ink)] hover:bg-[var(--ink)]/[0.04]"
                        : "cursor-not-allowed rounded-full border border-[var(--ink)]/10 px-2.5 py-1 text-xs font-medium text-[var(--muted)] opacity-60"
                  }
                  aria-current={active ? "step" : undefined}
                >
                  {i + 1}. {s.shortLabel}
                </button>
              </li>
            );
          })}
        </ol>
        <div>
          <h2 className="font-heading text-xl font-semibold tracking-[-0.02em] text-[var(--ink)]">
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
              disabled={!canContinue}
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
        <div className="space-y-4 border-t border-[var(--ink)]/10 pt-4">
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
