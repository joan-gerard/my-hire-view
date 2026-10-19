/**
 * Shared step map for F35 wizard + collapsible-sections layouts.
 * Order: Role → Candidate → CV & video → Share URL → Review/save.
 */

export const APPLICATION_FORM_STEP_IDS = [
  "role",
  "candidate",
  "materials",
  "share",
  "review",
] as const;

export type ApplicationFormStepId =
  (typeof APPLICATION_FORM_STEP_IDS)[number];

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
