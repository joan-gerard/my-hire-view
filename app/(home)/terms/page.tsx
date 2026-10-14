import type { Metadata } from "next";
import { LegalDocument } from "@/components/marketing";
import { TERMS_COPY } from "@/lib/marketing/legal-copy";

export const metadata: Metadata = {
  title: "Terms of Service",
  description:
    "Draft terms of service for MyHireView. Final legal copy will ship before public launch.",
  robots: { index: false, follow: false },
};

export default function TermsPage() {
  return <LegalDocument doc={TERMS_COPY} />;
}
