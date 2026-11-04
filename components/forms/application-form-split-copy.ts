import type { ApplicationFormStepId } from "@/components/forms/application-form-steps";

export type ApplicationFormSplitMode = "create" | "edit";

const RECOMMENDATIONS: Record<
  ApplicationFormSplitMode,
  Record<ApplicationFormStepId, readonly string[]>
> = {
  create: {
    role: [
      "Name the company the way a recruiter would search for it.",
      "The share link updates as you type the company and role.",
      "Leave your name out of the URL when you want a shorter link.",
    ],
    candidate: [
      "These details update your profile when you save this application.",
      "They are not saved if you cancel or leave.",
      "This page only chooses which ones recruiters see. Your picture stays on your profile.",
    ],
    materials: [
      "A primary CV is reused across applications.",
      "A tailored CV is only for this role.",
      "You can switch source until you save.",
    ],
    video: [
      "Paste a YouTube link. Unlisted videos work.",
      "Recruiters see the video on the share page.",
      "A short intro is enough.",
    ],
    review: [
      "Save draft & preview stores a draft. It does not publish the link.",
      "Preview opens the page recruiters will see. It does not save.",
      "Company, role, résumé, share link, and YouTube intro are required before that save.",
    ],
  },
  edit: {
    role: [
      "Name the company the way a recruiter would search for it.",
      "Changing the company or role keeps the share link you already saved.",
      "Reset to suggested builds a new link. Saving then replaces the old one.",
    ],
    candidate: [
      "Saving updates your profile, then copies what you show onto this application.",
      "Changes here are not saved if you cancel or leave.",
      "This page only chooses which ones recruiters see. Your picture stays on your profile.",
    ],
    materials: [
      "A primary CV is reused across applications.",
      "A tailored CV is only for this role.",
      "Replacing the file updates what recruiters download after you save.",
    ],
    video: [
      "Paste a YouTube link. Unlisted videos work.",
      "Recruiters see the video on the share page.",
      "A short intro is enough.",
    ],
    review: [
      "Save updates this application and returns you to the dashboard.",
      "Preview opens the page recruiters will see. It does not save.",
      "Company, role, résumé, share link, and YouTube intro are required before that save.",
    ],
  },
};

export function applicationFormSplitRecommendations(
  mode: ApplicationFormSplitMode,
  stepId: ApplicationFormStepId,
): readonly string[] {
  return RECOMMENDATIONS[mode][stepId];
}
