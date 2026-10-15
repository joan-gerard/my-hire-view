import type { Metadata } from "next";
import "../auth-reslink.css";
import LoginDemo from "./LoginDemo";

export const metadata: Metadata = {
  title: "Auth login demo (Reslink × MHV)",
  description:
    "Style-only login demo: Reslink centered-card layout with MyHireView brand tokens.",
  robots: { index: false, follow: false },
};

export default function DemoAuthLoginPage() {
  return <LoginDemo />;
}
