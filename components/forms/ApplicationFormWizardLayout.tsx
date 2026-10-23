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
import { FiArrowLeft, FiArrowRight, FiCheck } from "react-icons/fi";

export type ApplicationFormStepContentMap = Record<
  ApplicationFormStepId,
  ReactNode
>;

interface ApplicationFormWizardLayoutProps {
  stepContents: ApplicationFormStepContentMap;
  currentStepId: ApplicationFormStepId;
  onStepChange: (id: ApplicationFormStepId) => void;
  /** Fired when Continue leaves a step. Pill clicks and Back do not confirm it. */
  onContinue?: (fromStepId: ApplicationFormStepId) => void;
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
  /** Final step actions (Save). */
  actions: ReactNode;
}

function stepButtonClassName(args: {
  active: boolean;
  reachable: boolean;
  completed: boolean;
  /** Compact horizontal chips on small screens. */
  compact?: boolean;
}): string {
  const { active, reachable, completed, compact = false } = args;
  const base = compact
    ? // Fixed width: wider than content-sized chips, but the full strip stays near the progress bar width.
      "inline-flex w-[6.75rem] shrink-0 items-center gap-1.5 rounded-xl px-2.5 py-2 text-left text-xs font-medium sm:w-[7.5rem]"
    : "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors";

  if (active) {
    return `${base} cursor-pointer bg-[var(--ink)] text-[var(--white)]`;
  }
  if (completed) {
    return `${base} cursor-pointer border border-[var(--status-dot-viewed)]/50 bg-[var(--status-wash-viewed)] text-[var(--ink)] hover:brightness-[0.98]`;
  }
  if (reachable) {
    return `${base} cursor-pointer border border-[var(--ink)]/12 bg-[var(--paper)]/70 text-[var(--ink)] hover:bg-[var(--ink)]/[0.04]`;
  }
  // No extra opacity — muted alone stays readable; opacity stacked on muted was nearly illegible.
  return `${base} cursor-not-allowed border border-[var(--ink)]/10 bg-[var(--paper)]/50 text-[var(--ink)]/65`;
}

function stepMarkerClassName(args: {
  active: boolean;
  completed: boolean;
  compact?: boolean;
}): string {
  const { active, completed, compact = false } = args;
  const size = compact
    ? "flex size-6 shrink-0 items-center justify-center rounded-md text-[0.65rem] font-semibold"
    : "flex size-7 shrink-0 items-center justify-center rounded-lg text-xs font-semibold";

  if (active) {
    return `${size} bg-[var(--white)]/15 text-[var(--white)]`;
  }
  if (completed) {
    return `${size} bg-[var(--white)]/80 text-[var(--ink)]`;
  }
  return `${size} border border-[var(--ink)]/15 bg-[var(--white)] text-[var(--ink)]/55`;
}

export default function ApplicationFormWizardLayout({
  stepContents,
  currentStepId,
  onStepChange,
  onContinue,
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
  const stepCount = APPLICATION_FORM_STEPS.length;
  // Progress tracks check marks only — viewing an earlier/other step does not move the bar.
  const completedCount = APPLICATION_FORM_STEPS.reduce((count, s, i) => {
    return isWizardStepCompleted(
      i,
      furthestIndex,
      stepReady(s.id),
      allowAllSteps,
    )
      ? count + 1
      : count;
  }, 0);
  const progressPercent =
    stepCount === 0 ? 0 : Math.round((completedCount / stepCount) * 100);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const skipInitialFocusRef = useRef(true);
  const mobileStepRefs = useRef(
    new Map<ApplicationFormStepId, HTMLButtonElement>(),
  );

  useEffect(() => {
    if (skipInitialFocusRef.current) {
      skipInitialFocusRef.current = false;
      return;
    }
    headingRef.current?.focus();
  }, [currentStepId]);

  // Keep the active chip visible in the horizontal mobile rail.
  useEffect(() => {
    mobileStepRefs.current.get(currentStepId)?.scrollIntoView({
      behavior: "smooth",
      inline: "center",
      block: "nearest",
    });
  }, [currentStepId]);

  const renderStepButton = (
    s: (typeof APPLICATION_FORM_STEPS)[number],
    i: number,
    compact: boolean,
  ) => {
    const active = s.id === currentStepId;
    const reachable = isWizardStepReachable(i, furthestIndex, allowAllSteps);
    const completed = isWizardStepCompleted(
      i,
      furthestIndex,
      stepReady(s.id),
      allowAllSteps,
    );

    return (
      <button
        type="button"
        ref={
          compact
            ? (el) => {
                if (el) mobileStepRefs.current.set(s.id, el);
                else mobileStepRefs.current.delete(s.id);
              }
            : undefined
        }
        onClick={() => {
          if (reachable) onStepChange(s.id);
        }}
        disabled={!reachable}
        className={stepButtonClassName({
          active,
          reachable,
          completed,
          compact,
        })}
        aria-current={active ? "step" : undefined}
      >
        <span
          className={stepMarkerClassName({ active, completed, compact })}
          aria-hidden
        >
          {completed ? (
            <FiCheck
              className={compact ? "size-3" : "size-3.5"}
              strokeWidth={2.5}
            />
          ) : (
            i + 1
          )}
        </span>
        {compact ? (
          <span className="min-w-0 flex-1 truncate font-semibold">
            {s.shortLabel}
          </span>
        ) : (
          <span className="min-w-0 flex-1">
            <span
              className={
                active
                  ? "block text-sm font-semibold text-[var(--white)]"
                  : "block text-sm font-semibold text-[var(--ink)]"
              }
            >
              {s.title}
            </span>
            <span
              className={
                active
                  ? "mt-0.5 block text-xs text-[var(--white)]/75"
                  : "mt-0.5 block text-xs text-[var(--muted)]"
              }
            >
              {s.description}
            </span>
          </span>
        )}
      </button>
    );
  };

  const footer = !isLast ? (
    <div className="flex flex-wrap items-center justify-between gap-3">
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
        <FiArrowLeft className="size-4" aria-hidden />
        Back
      </Button>
      <div className="group relative inline-flex">
        <Button
          type="button"
          variant="primary"
          aria-disabled={!canContinue || undefined}
          className={
            !canContinue
              ? "cursor-not-allowed opacity-50 hover:opacity-50!"
              : undefined
          }
          onClick={() => {
            if (!canContinue) return;
            onContinue?.(step.id);
            onStepChange(APPLICATION_FORM_STEPS[index + 1].id);
          }}
          aria-describedby={
            !canContinue && continueBlockedReason
              ? "wizard-continue-blocked-reason"
              : undefined
          }
        >
          Continue
          <FiArrowRight className="size-4" aria-hidden />
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
    <div className="flex flex-wrap items-center justify-between gap-3">
      <Button
        type="button"
        variant="secondary"
        onClick={() => onStepChange(APPLICATION_FORM_STEPS[index - 1].id)}
      >
        <FiArrowLeft className="size-4" aria-hidden />
        Back
      </Button>
      {actions}
    </div>
  );

  const progressHeader = (
    <div className="space-y-2">
      <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
        <p className="font-heading text-sm font-semibold tracking-[-0.02em] text-[var(--ink)]">
          Application progress
        </p>
        <p className="text-xs font-medium text-[var(--muted)]">
          {completedCount} of {stepCount} complete
        </p>
      </div>
      <div
        className="h-1.5 overflow-hidden rounded-full bg-[var(--ink)]/10"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={stepCount}
        aria-valuenow={completedCount}
        aria-label={`${completedCount} of ${stepCount} steps complete`}
      >
        <div
          className="h-full rounded-full bg-[var(--ink)] transition-[width] duration-300 ease-out"
          style={{ width: `${progressPercent}%` }}
        />
      </div>
    </div>
  );

  return (
    /*
     * Bleed to the form shell edges so the rail/form split reads as two
     * regions without nesting a second bordered card (F35 atmosphere).
     */
    <div className="-m-4 flex flex-col sm:-m-6 lg:flex-row lg:items-stretch">
      {/* Mobile / tablet: sticky progress + horizontal step rail */}
      <div className="sticky top-[var(--admin-header-height,72px)] z-20 shrink-0 space-y-3 border-b border-[var(--ink)]/10 bg-[var(--white)] p-4 sm:p-6 lg:hidden">
        {progressHeader}
        <ol
          className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-0.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          aria-label="Form progress"
        >
          {APPLICATION_FORM_STEPS.map((s, i) => (
            <li key={s.id} className="shrink-0">
              {renderStepButton(s, i, true)}
            </li>
          ))}
        </ol>
      </div>

      {/* Desktop: full-height rail; the step list sticks under the admin header. */}
      <aside className="hidden w-[17.5rem] shrink-0 border-[var(--ink)]/10 lg:flex lg:flex-col lg:border-r xl:w-[19rem]">
        <div className="sticky top-[var(--admin-header-height,72px)] z-20 flex max-h-[calc(100svh-var(--admin-header-height,72px))] flex-col gap-4 overflow-y-auto bg-[var(--white)] p-4 sm:p-6">
          {progressHeader}
          <ol className="flex flex-col gap-1.5" aria-label="Form progress">
            {APPLICATION_FORM_STEPS.map((s, i) => (
              <li key={s.id}>{renderStepButton(s, i, false)}</li>
            ))}
          </ol>
        </div>
      </aside>

      {/* Form column */}
      <div className="flex min-w-0 flex-1 flex-col p-4 sm:p-6">
        <div className="-mx-4 mb-4 border-b border-[var(--ink)]/10 px-4 pb-4 sm:-mx-6 sm:mb-6 sm:px-6 sm:pb-5">
          <h2
            ref={headingRef}
            tabIndex={-1}
            className="font-heading text-xl font-semibold tracking-[-0.02em] text-[var(--ink)] outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ink)]"
          >
            {step.title}
          </h2>
          <p className="mt-1 text-sm text-[var(--muted)]">{step.description}</p>
        </div>

        <div className="min-w-0 flex-1 space-y-4 sm:space-y-6">
          {stepContents[currentStepId]}
        </div>

        <div className="mt-6 border-t border-[var(--ink)]/10 pt-4 sm:mt-8 sm:pt-5">
          {footer}
        </div>
      </div>
    </div>
  );
}
