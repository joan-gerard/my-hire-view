/**
 * Shared step map for F35 wizard + collapsible-sections layouts.
 * Order: Role → Candidate → CV & video → Share URL → Review/save.
 */

import type { ApplicationFormData } from "@/lib/types/application";

export const APPLICATION_FORM_STEP_IDS = [
  "role",
  "candidate",
  "materials",
  "share",
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
  first_name: "candidate",
  last_name: "candidate",
  location: "candidate",
  portfolio_url: "candidate",
  linkedin_url: "candidate",
  cv_url: "materials",
  cv_filename: "materials",
  video_url: "materials",
  slug: "share",
  slugNamePosition: "share",
};

/** Prefer earlier steps when several fields fail at once. */
const ERROR_FIELD_PRIORITY: (keyof ApplicationFormData)[] = [
  "company",
  "role",
  "cv_url",
  "video_url",
  "slug",
  "first_name",
  "last_name",
  "location",
  "portfolio_url",
  "linkedin_url",
];

/**
 * Step that owns the first present form error, or null when there are none.
 */
export function applicationFormStepForErrors(
  errors: Partial<Record<keyof ApplicationFormData, string>>,
): ApplicationFormStepId | null {
  for (const field of ERROR_FIELD_PRIORITY) {
    if (errors[field]) {
      return FIELD_TO_STEP[field] ?? "review";
    }
  }
  for (const [field, message] of Object.entries(errors)) {
    if (!message) continue;
    const step = FIELD_TO_STEP[field as keyof ApplicationFormData];
    if (step) return step;
  }
  return null;
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
    title: "Role",
    shortLabel: "Role",
    description: "Company and position for this application.",
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
    id: "share",
    title: "Share URL",
    shortLabel: "URL",
    description: "Choose how your public link looks before you save.",
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
