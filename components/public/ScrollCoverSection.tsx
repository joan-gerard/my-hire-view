"use client";

import type { ReactNode } from "react";

export interface ScrollCoverSectionProps {
  /** Content that scrolls over the fixed hero image. Uses a solid background so it covers the image. */
  children: ReactNode;
  /** Optional extra class names for the section (e.g. for padding overrides). */
  className?: string;
}

export default function ScrollCoverSection({
  children,
  className = "",
}: ScrollCoverSectionProps) {
  return (
    <section className={`relative z-10 px-4 ${className}`.trim()}>
      <div className="bg-white">{children}</div>
    </section>
  );
}
