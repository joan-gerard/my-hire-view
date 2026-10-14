import type { Metadata } from "next";
import { LegalDocument } from "@/components/marketing";
import { COOKIES_COPY } from "@/lib/marketing/legal-copy";

export const metadata: Metadata = {
  title: "Cookies Policy",
  description:
    "Draft cookies policy for MyHireView. Final legal copy will ship before public launch.",
  robots: { index: false, follow: false },
};

export default function CookiesPage() {
  return <LegalDocument doc={COOKIES_COPY} />;
}
