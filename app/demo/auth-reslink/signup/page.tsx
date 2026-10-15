import type { Metadata } from "next";
import "../auth-reslink.css";
import SignupDemo from "./SignupDemo";

export const metadata: Metadata = {
  title: "Auth signup demo (Reslink × MHV)",
  description:
    "Style-only signup demo: Reslink split-card layout with MyHireView brand tokens.",
  robots: { index: false, follow: false },
};

export default function DemoAuthSignupPage() {
  return <SignupDemo />;
}
