/**
 * Homepage marketing fonts — self-hosted via next/font (no CDN stylesheets).
 * Switzer: Fontshare free license (see ./fonts/README.md).
 * Stack Sans Headline: Google Fonts, self-hosted at build time by next/font/google.
 */
import localFont from "next/font/local";
import { Stack_Sans_Headline } from "next/font/google";

export const switzer = localFont({
  src: "./fonts/Switzer-Variable.woff2",
  variable: "--font-switzer",
  display: "swap",
  weight: "100 900",
});

export const stackSansHeadline = Stack_Sans_Headline({
  subsets: ["latin"],
  weight: "variable",
  variable: "--font-stack-sans-headline",
  display: "swap",
});
