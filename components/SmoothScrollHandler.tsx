"use client";

import { smoothScrollToElement } from "@/lib/smooth-scroll";
import { useEffect } from "react";

/** Default duration for in-page anchor scrolls (ms). Slower = smoother feel. */
const SCROLL_DURATION_MS = 1400;

/**
 * Listens for clicks on in-page anchor links (e.g. href="#early-access") and
 * scrolls to the target with a custom smooth animation instead of the browser default.
 */
export function SmoothScrollHandler() {
  useEffect(() => {
    function handleClick(e: MouseEvent): void {
      const target = e.target;
      if (!(target instanceof HTMLAnchorElement)) return;

      const href = target.getAttribute("href");
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
