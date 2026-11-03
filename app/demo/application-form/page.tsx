import type { Metadata } from "next";
import { ApplicationFormDemo } from "./application-form-demo";

export const metadata: Metadata = {
  title: "Application form demo — MyHireView",
  description:
    "A UI-only proposal for creating an application, with one chapter open at a time.",
  robots: { index: false, follow: false },
};

export default function ApplicationFormDemoPage() {
  return <ApplicationFormDemo />;
}
