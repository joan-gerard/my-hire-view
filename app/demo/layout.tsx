import type { Metadata } from "next";
import type { ReactNode } from "react";
import { DemoShell } from "./demo-shell";
import "./parley.css";

export const metadata: Metadata = {
  title: "MyHireView — Stand out. Get seen.",
  description:
    "Create your page, share your link, and get noticed by recruiters. A personalized job application with CV, video pitch, and analytics.",
};

export default function DemoLayout({ children }: { children: ReactNode }) {
  return <DemoShell>{children}</DemoShell>;
}
