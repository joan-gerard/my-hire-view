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
