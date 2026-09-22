import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./overtake.css";

export const metadata: Metadata = {
  title: "MyHireView — Our story",
  description:
    "We built MyHireView because good applications kept vanishing in the void. Create a personalized job application page with CV, video pitch, and proof they looked.",
};

export default function Demo2Layout({ children }: { children: ReactNode }) {
  return (
    <>
      <link rel="preconnect" href="https://api.fontshare.com" />
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      <link
        rel="stylesheet"
        href="https://api.fontshare.com/v2/css?f[]=switzer@400,500,600,700&display=swap"
      />
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Stack+Sans+Headline:wght@400;500&display=swap"
      />
      {children}
    </>
  );
}
