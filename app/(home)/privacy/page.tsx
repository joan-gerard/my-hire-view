import type { Metadata } from "next";
import { LegalDocument } from "@/components/marketing";
import { PRIVACY_COPY } from "@/lib/marketing/legal-copy";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "Draft privacy policy for MyHireView. Final legal copy will ship before public launch.",
  robots: { index: false, follow: false },
};

export default function PrivacyPage() {
  return <LegalDocument doc={PRIVACY_COPY} />;
}
