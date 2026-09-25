/**
 * Ease-in-out sine: gentle acceleration into the scroll, gentle deceleration
 * out of it. Speed difference between fastest and slowest point is minimal —
 * feels uniform rather than "zooming then braking".
 */
function easeInOutSine(t: number): number {
  return -(Math.cos(Math.PI * t) - 1) / 2;
}

export type SmoothScrollOptions = {
  /** Duration in ms. */
  duration?: number;
  /** Vertical offset from the target (e.g. for fixed headers). Default 0. */
  offset?: number;
};

/**
 * Smoothly scrolls the window to the given element over a configurable duration.
 * Uses requestAnimationFrame and ease-in-out sine easing (gradual start AND end).
 */
export function smoothScrollToElement(
  element: HTMLElement,
  options: SmoothScrollOptions = {},
): void {
  const { duration = 1400, offset = 0 } = options;

  const startY = window.scrollY ?? window.pageYOffset;
  const targetY = element.getBoundingClientRect().top + startY - offset;
  const distance = targetY - startY;
  const startTime = performance.now();

  function step(currentTime: number): void {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const eased = easeInOutSine(progress);
    window.scrollTo(0, startY + distance * eased);

    if (progress < 1) {
      requestAnimationFrame(step);
    }
  }

  requestAnimationFrame(step);
}

/**
 * Scroll to an in-page hash target (`#how`, `#pricing`, …).
 * Uses smooth animation unless the user prefers reduced motion.
 * Updates the URL hash without a jump.
 */
export function scrollToHash(
  hash: string,
  options: SmoothScrollOptions = {},
): boolean {
  const id = hash.startsWith("#") ? hash.slice(1) : hash;
  if (!id) return false;

  const element = document.getElementById(id);
  if (!element) return false;

  const reduceMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;

  if (reduceMotion) {
    const { offset = 0 } = options;
    const top =
      element.getBoundingClientRect().top +
      (window.scrollY ?? window.pageYOffset) -
      offset;
    window.scrollTo(0, top);
  } else {
    smoothScrollToElement(element, options);
  }

  if (typeof history !== "undefined" && history.pushState) {
    history.pushState(null, "", `#${id}`);
  }

  return true;
}
