import type { Metadata } from "next";
import { requireAuth } from "@/lib/auth";
import { DemoAdminPage } from "./demo-admin-page";

export const metadata: Metadata = {
  title: "Dashboard demo — Sprig",
  description:
    "Authenticated dashboard preview: recently viewed and reimagined application cards with live data.",
  robots: { index: false, follow: false },
};

export default async function DemoAdminRoute() {
  await requireAuth();
  return <DemoAdminPage />;
}
