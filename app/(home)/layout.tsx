import type { Metadata } from "next";
import type { ReactNode } from "react";
import { stackSansHeadline, switzer } from "./fonts";
import "./mhv-demo.css";

export const metadata: Metadata = {
  title: {
    default: "MyHireView",
    template: "%s — MyHireView",
  },
  description:
    "We built MyHireView because good applications kept vanishing in the void. Create a personalized job application page with CV, video pitch, and proof they looked.",
};

export default function MarketingLayout({ children }: { children: ReactNode }) {
  return (
    <div className={`${switzer.variable} ${stackSansHeadline.variable}`}>
      {children}
    </div>
  );
}
