import type { Metadata } from "next";
import { MhvLanding } from "./mhv-landing";

export const metadata: Metadata = {
  title: "Our story",
  description:
    "We built MyHireView because good applications kept vanishing in the void. Create a personalized job application page with CV, video pitch, and proof they looked.",
};

export default function HomePage() {
  return <MhvLanding />;
}
