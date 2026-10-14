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
  /** Vertical offset from the target (e.g. for fixed headers). */
  offset?: number;
};

export type ScrollToHashOptions = SmoothScrollOptions & {
  /**
   * When true (default), sync the URL with `history.pushState`.
   * Set false for `popstate` handling so Back/Forward do not push again.
   */
  updateHistory?: boolean;
};

/** Sticky marketing header height so section headings stay below it. */
function stickyHeaderOffset(): number {
  const shell = document.querySelector<HTMLElement>(".ot-header-shell");
  return shell?.offsetHeight ?? 0;
}

function resolveOffset(options: SmoothScrollOptions): number {
  return options.offset ?? stickyHeaderOffset();
}

/**
 * Smoothly scrolls the window to the given element over a configurable duration.
 * Uses requestAnimationFrame and ease-in-out sine easing (gradual start AND end).
 */
export function smoothScrollToElement(
  element: HTMLElement,
  options: SmoothScrollOptions = {},
): void {
  const duration = options.duration ?? 1400;
  const offset = resolveOffset(options);

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
 * Updates the URL hash without a jump (unless `updateHistory` is false).
 */
export function scrollToHash(
  hash: string,
  options: ScrollToHashOptions = {},
): boolean {
  const id = hash.startsWith("#") ? hash.slice(1) : hash;
  if (!id) return false;

  const element = document.getElementById(id);
  if (!element) return false;

  const reduceMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;
  const offset = resolveOffset(options);
  const updateHistory = options.updateHistory ?? true;

  if (reduceMotion) {
    const top =
      element.getBoundingClientRect().top +
      (window.scrollY ?? window.pageYOffset) -
      offset;
    window.scrollTo(0, top);
  } else {
    smoothScrollToElement(element, { ...options, offset });
  }

  if (
    updateHistory &&
    typeof history !== "undefined" &&
    history.pushState &&
    window.location.hash !== `#${id}`
  ) {
    history.pushState(null, "", `#${id}`);
  }

  return true;
}

function scrollDocumentTop(): void {
  const reduceMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;
  window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
}

/**
 * `scrollToHash` uses `pushState`, and the app sets `history.scrollRestoration =
 * "manual"`, so Back/Forward change the URL without scrolling. Bind this once
 * on marketing surfaces that use hash section nav.
 */
export function bindHashScrollPopstate(): () => void {
  function onPopState(): void {
    const { hash } = window.location;
    if (hash.length > 1) {
      scrollToHash(hash, { updateHistory: false });
      return;
    }
    scrollDocumentTop();
  }

  window.addEventListener("popstate", onPopState);
  return () => window.removeEventListener("popstate", onPopState);
}
