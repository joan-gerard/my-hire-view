import type { Metadata } from "next";
import { CareLogPage } from "./care-log-page";

export const metadata: Metadata = {
  title: "Sprig care log — style guide demo",
  description:
    "Fictional Sprig care-log subpage demonstrating denser marketing UI patterns.",
  robots: { index: false, follow: false },
};

export default function DemoCareLogRoute() {
  return <CareLogPage />;
}
