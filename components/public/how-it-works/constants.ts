/**
 * Data and configuration for the "How It Works" section.
 * Kept in a separate module so steps can be reused (e.g. tests, docs) and
 * thresholds can be tuned in one place.
 */

export interface HowItWorksStep {
  id: number;
  title: string;
  description: string;
  video: string;
}

export const HOW_IT_WORKS_STEPS: HowItWorksStep[] = [
  {
    id: 1,
    title: "Create Your Application",
    description:
      "Upload your CV, record a video pitch, and add your portfolio link.",
    video: "/step-1.mp4",
  },
  {
    id: 2,
    title: "Share Your Link",
    description:
      "Send your custom URL to recruiters via email, LinkedIn, or job applications.",
    video: "/step-2.mp4",
  },
  {
    id: 3,
    title: "Track & Follow Up",
    description:
      "See when recruiters view your application and follow up strategically.",
    video: "/step-3.mp4",
  },
];

/** Section visibility threshold for dark theme (0–1). */
export const IN_VIEW_THRESHOLD = 0.2;

/** Card visibility threshold to mark step as active (0–1). Use 1 for fully visible. */
export const CARD_IN_VIEW_THRESHOLD = 1;

/** Card is "in viewport" for width when this fraction is visible. Below this, card shrinks to 95%. */
export const CARD_WIDTH_VIEW_THRESHOLD = 0.15;

/** Delay in ms before step videos start autoplaying after card enters viewport. */
export const AUTOPLAY_DELAY_MS = 1500;

/** Card visibility threshold to trigger autoplay delay (0–1). */
export const AUTOPLAY_VIEW_THRESHOLD = 0.1;
