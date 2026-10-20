/**
 * Shared step map for F35 wizard + collapsible-sections layouts.
 * Order: Role & share URL → Candidate → CV & video → Review/save.
 */

import type { ApplicationFormData } from "@/lib/types/application";

export const APPLICATION_FORM_STEP_IDS = [
  "role",
  "candidate",
  "materials",
  "review",
] as const;

export type ApplicationFormStepId =
  (typeof APPLICATION_FORM_STEP_IDS)[number];

/** Field → step ownership for surfacing submit-time errors on the right step. */
const FIELD_TO_STEP: Partial<
  Record<keyof ApplicationFormData, ApplicationFormStepId>
> = {
  company: "role",
  role: "role",
  slug: "role",
  slugNamePosition: "role",
  first_name: "candidate",
  last_name: "candidate",
  location: "candidate",
  portfolio_url: "candidate",
  linkedin_url: "candidate",
  cv_url: "materials",
  cv_filename: "materials",
  video_url: "materials",
};

/**
 * Step that owns the earliest present form error (by step order), or null
 * when there are none. Unknown fields fall back to `review`.
 */
export function applicationFormStepForErrors(
  errors: Partial<Record<keyof ApplicationFormData, string>>,
): ApplicationFormStepId | null {
  let earliest: ApplicationFormStepId | null = null;
  let earliestIndex = Number.POSITIVE_INFINITY;

  for (const [field, message] of Object.entries(errors)) {
    if (!message) continue;
    const step =
      FIELD_TO_STEP[field as keyof ApplicationFormData] ?? "review";
    const index = APPLICATION_FORM_STEP_IDS.indexOf(step);
    if (index >= 0 && index < earliestIndex) {
      earliest = step;
      earliestIndex = index;
    }
  }

  return earliest;
}

export type ApplicationFormStepDef = {
  id: ApplicationFormStepId;
  /** Full section / wizard title */
  title: string;
  /** Short label for progress chips */
  shortLabel: string;
  /** One-line helper under the title */
  description: string;
};

export const APPLICATION_FORM_STEPS: readonly ApplicationFormStepDef[] = [
  {
    id: "role",
    title: "Role & share URL",
    shortLabel: "Role",
    description:
      "Company, position, and how your public link looks for this application.",
  },
  {
    id: "candidate",
    title: "About you",
    shortLabel: "You",
    description: "What recruiters see about you on this application.",
  },
  {
    id: "materials",
    title: "CV & video",
    shortLabel: "CV",
    description: "Attach a CV and the YouTube intro for this role.",
  },
  {
    id: "review",
    title: "Review & save",
    shortLabel: "Save",
    description: "Check the essentials, then save when everything is ready.",
  },
] as const;

export function applicationFormStepIndex(
  id: ApplicationFormStepId,
): number {
  return APPLICATION_FORM_STEP_IDS.indexOf(id);
}

/**
 * Wizard progress-pill reachability.
 * Create uses a Continue frontier; edit allows every step.
 */
export function isWizardStepReachable(
  stepIndex: number,
  furthestIndex: number,
  allowAllSteps: boolean,
): boolean {
  if (allowAllSteps) return true;
  return stepIndex <= furthestIndex;
}
