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
      "These details are saved on this application.",
      "Updating your profile later does not change them here.",
      "Your picture stays live. Recruiters see the current one from your profile.",
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
      "Save stores a draft. It does not publish the link.",
      "Show preview opens the page recruiters will see.",
      "Fix anything marked missing before you save.",
    ],
  },
  edit: {
    role: [
      "Name the company the way a recruiter would search for it.",
      "Changing the company or role can change the share link.",
      "A link you already shared keeps working only if the slug stays the same.",
    ],
    candidate: [
      "Name, location, and links are from when this application was saved.",
      "Updating your profile does not change them here.",
      "Your picture stays live if this application shows it.",
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
      "Show preview opens the page recruiters will see.",
      "Fix anything marked missing before you save.",
    ],
  },
};

export function applicationFormSplitRecommendations(
  mode: ApplicationFormSplitMode,
  stepId: ApplicationFormStepId,
): readonly string[] {
  return RECOMMENDATIONS[mode][stepId];
}
