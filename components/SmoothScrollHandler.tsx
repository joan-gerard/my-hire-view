"use client";

import { smoothScrollToElement } from "@/lib/smooth-scroll";
import { useEffect } from "react";

/** Default duration for in-page anchor scrolls (ms). Slower = smoother feel. */
const SCROLL_DURATION_MS = 1400;

/**
 * Listens for clicks on in-page anchor links (e.g. href="#early-access") and
 * scrolls to the target with a custom smooth animation instead of the browser default.
 * Skips modified clicks and non-primary buttons so Cmd/Ctrl/middle-click keep working.
 */
export function SmoothScrollHandler() {
  useEffect(() => {
    function handleClick(e: MouseEvent): void {
      // Preserve browser behavior for new-tab / modified clicks.
      if (e.defaultPrevented || e.button !== 0) return;
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;

      const target = e.target;
      if (!(target instanceof Element)) return;
      const anchor = target.closest("a[href]");
      if (!(anchor instanceof HTMLAnchorElement)) return;

      const href = anchor.getAttribute("href");
      if (!href || !href.startsWith("#")) return;

      const id = href.slice(1);
      if (!id) return;

      const element = document.getElementById(id);
      if (!element) return;

      e.preventDefault();
      smoothScrollToElement(element, { duration: SCROLL_DURATION_MS });
    }

    document.addEventListener("click", handleClick, { capture: true });
    return () =>
      document.removeEventListener("click", handleClick, { capture: true });
  }, []);

  return null;
}
