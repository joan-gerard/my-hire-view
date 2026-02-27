"use client";

import { useScrollCover } from "@/contexts/ScrollCoverContext";
import type { ReactNode } from "react";
import { useCallback } from "react";

export interface ScrollCoverSectionProps {
  /** Content that scrolls over the fixed hero image. Uses a solid background so it covers the image. */
  children: ReactNode;
  /** Optional extra class names for the section (e.g. for padding overrides). */
  className?: string;
}

/**
 * 1px sentinel at the top; when it scrolls past the viewport top, the context sets
 * scrollCoverReachedTop so the header can switch to a white background.
 */
function ScrollCoverSentinel({
  setRef,
}: {
  setRef: (el: HTMLElement | null) => void;
}) {
  const refCallback = useCallback(
    (node: HTMLDivElement | null) => {
      setRef(node);
    },
    [setRef],
  );
  return (
    <div
      ref={refCallback}
      aria-hidden
      className="h-px w-full bg-white pointer-events-none"
      style={{ marginBottom: -1 }}
    />
  );
}

export default function ScrollCoverSection({
  children,
  className = "",
}: ScrollCoverSectionProps) {
  const { setScrollCoverSentinelRef } = useScrollCover();

  return (
    <section className={`relative z-10 ${className}`.trim()}>
      <div className="bg-white">
        <ScrollCoverSentinel setRef={setScrollCoverSentinelRef} />
        {children}
      </div>
    </section>
  );
}
