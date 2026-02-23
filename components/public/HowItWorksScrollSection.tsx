"use client";

import type { ReactNode } from "react";

export interface HowItWorksScrollSectionProps {
  /** Content that scrolls over the fixed hero image. Uses a solid background so it covers the image. */
  children: ReactNode;
  /** Optional extra class names for the section (e.g. for padding overrides). */
  className?: string;
}

/**
 * Wrapper for the section that appears below HowItWorksHero. This section
 * has a solid background and a higher z-index so that as the user scrolls,
 * it moves up and visually covers the fixed hero image.
 */
export default function HowItWorksScrollSection({
  children,
  className = "",
}: HowItWorksScrollSectionProps) {
  return (
    <section
      className={`relative z-10 bg-background px-4 py-16 sm:px-6 sm:py-20 lg:px-8 ${className}`.trim()}
    >
      {children}
    </section>
  );
}
