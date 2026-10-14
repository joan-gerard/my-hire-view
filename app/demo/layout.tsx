import type { Metadata } from "next";
import type { ReactNode } from "react";
import { stackSansHeadline, switzer } from "@/app/(home)/fonts";
import "./sprig-demo.css";

export const metadata: Metadata = {
  title: "Sprig — style guide demo",
  description:
    "Fictional apartment plant-care co-op used to demonstrate the MyHireView marketing brand style guide.",
  robots: { index: false, follow: false },
};

export default function DemoLayout({ children }: { children: ReactNode }) {
  return (
    <div className={`${switzer.variable} ${stackSansHeadline.variable}`}>
      {children}
    </div>
  );
}
