"use client";

import { useEffect } from "react";

/**
 * Disables vertical overscroll (bounce) on the document so that when the user
 * is at the bottom of the page, trying to scroll further does not reveal
 * content above (e.g. a fixed hero). Use on pages where a fixed background
 * must stay hidden when scrolled past.
 */
export default function PreventOverscrollReveal() {
  useEffect(() => {
    const html = document.documentElement;
    const body = document.body;
    const prevHtml = html.style.overscrollBehaviorY;
    const prevBody = body.style.overscrollBehaviorY;
    html.style.overscrollBehaviorY = "none";
    body.style.overscrollBehaviorY = "none";
    return () => {
      html.style.overscrollBehaviorY = prevHtml;
      body.style.overscrollBehaviorY = prevBody;
    };
  }, []);

  return null;
}
