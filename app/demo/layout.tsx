import type { Metadata } from "next";
import type { ReactNode } from "react";
import { DemoShell } from "./demo-shell";
import "./parley.css";

export const metadata: Metadata = {
  title: "Parley — The AI agent that works with you, not just for you",
  description:
    "Parley thinks, plans, and acts alongside you — handling emails, scheduling, research, and complex workflows.",
};

export default function DemoLayout({ children }: { children: ReactNode }) {
  return <DemoShell>{children}</DemoShell>;
}
