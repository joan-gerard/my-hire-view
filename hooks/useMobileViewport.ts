"use client";

import { useEffect, useState } from "react";

/**
 * Pixel width below which the layout is considered "mobile".
 * Matches Tailwind's md breakpoint (768px). Exported for use in media queries or layout logic.
 */
export const MOBILE_BREAKPOINT_PX = 768;

/**
 * True when viewport width is below the mobile breakpoint (matches Tailwind md).
 * Updates on resize. Use for conditional mobile UI (e.g. expandable header menu).
 */
export function useMobileViewport(): boolean {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(
      `(max-width: ${MOBILE_BREAKPOINT_PX - 1}px)`,
    );
    const handler = () => setIsMobile(media.matches);
    handler();
    media.addEventListener("change", handler);
    return () => media.removeEventListener("change", handler);
  }, []);

  return isMobile;
}
