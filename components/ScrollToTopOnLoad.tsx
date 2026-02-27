"use client";

import { useEffect } from "react";

/**
 * Ensures that on full page load or refresh, the user is at the top of the page.
 * - Sets scrollRestoration to "manual" so the browser does not restore the previous
 *   scroll position on refresh.
 * - Scrolls to (0, 0) on mount so the initial view is always from the start.
 * Mounted once in the root layout; runs on every full load/refresh, not on client-side navigations.
 */
export function ScrollToTopOnLoad() {
  useEffect(() => {
    if (typeof window === "undefined") return;

    // Prevent the browser from restoring scroll position on refresh or when
    // navigating back/forward. We control scroll ourselves on load.
    if ("scrollRestoration" in history) {
      history.scrollRestoration = "manual";
    }

    window.scrollTo(0, 0);
  }, []);

  return null;
}
