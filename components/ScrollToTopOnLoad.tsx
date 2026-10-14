"use client";

import { useEffect } from "react";
import { scrollToHash } from "@/lib/smooth-scroll";

/**
 * On full page load or refresh:
 * - Sets scrollRestoration to "manual" so the browser does not restore a stale
 *   scroll position.
 * - With no hash: scrolls to the top.
 * - With a hash (e.g. `/#pricing` from marketing NAV): scrolls to that section
 *   after paint so sticky-header offset applies and deep links are not wiped.
 * Mounted once in the root layout; runs on every full load/refresh, not on
 * client-side navigations.
 */
export function ScrollToTopOnLoad() {
  useEffect(() => {
    if (typeof window === "undefined") return;

    if ("scrollRestoration" in history) {
      history.scrollRestoration = "manual";
    }

    const { hash } = window.location;
    if (hash.length > 1) {
      let cancelled = false;
      let outerFrame = 0;
      let innerFrame = 0;

      // Double rAF: wait until layout/hydration has the section nodes.
      outerFrame = requestAnimationFrame(() => {
        innerFrame = requestAnimationFrame(() => {
          if (cancelled) return;
          const scrolled = scrollToHash(hash, { updateHistory: false });
          if (!scrolled) {
            window.scrollTo(0, 0);
          }
        });
      });

      return () => {
        cancelled = true;
        cancelAnimationFrame(outerFrame);
        cancelAnimationFrame(innerFrame);
      };
    }

    window.scrollTo(0, 0);
  }, []);

  return null;
}
