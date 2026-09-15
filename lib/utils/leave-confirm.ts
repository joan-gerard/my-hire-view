/**
 * Pure helpers for same-origin leave interception (create-app draft guard).
 */

import type { CreateApplicationDraftInput } from "@/lib/utils/create-application-draft";

/**
 * Returns the same-origin path to navigate to when the click should be blocked
 * for a leave confirm, or null when the click should proceed normally.
 */
export function shouldBlockSameOriginNavigation(
  hrefAttr: string,
  currentHref: string,
): string | null {
  const trimmed = hrefAttr.trim();
  if (
    !trimmed ||
    trimmed.startsWith("#") ||
    trimmed.startsWith("mailto:") ||
    trimmed.startsWith("tel:") ||
    trimmed.startsWith("javascript:")
  ) {
    return null;
  }

  let url: URL;
  let current: URL;
  try {
    url = new URL(trimmed, currentHref);
    current = new URL(currentHref);
  } catch {
    return null;
  }

  if (url.origin !== current.origin) return null;

  // Same document + fragment-only changes are not leaving the page.
  const nextDoc = `${url.pathname}${url.search}`;
  const hereDoc = `${current.pathname}${current.search}`;
  if (nextDoc === hereDoc) return null;

  return `${url.pathname}${url.search}${url.hash}`;
}

/**
 * Fields that count as user progress for leave-confirm (ignores auto slug and
 * automatic CV library defaults; keeps manual slug text when edited).
 */
export function leaveRelevantDraftSnapshot(
  draft: CreateApplicationDraftInput,
): string {
  return JSON.stringify({
    company: draft.company,
    role: draft.role,
    video_url: draft.video_url,
    first_name: draft.first_name,
    last_name: draft.last_name,
    location: draft.location,
    portfolio_url: draft.portfolio_url,
    linkedin_url: draft.linkedin_url,
    include: draft.include,
    slugNamePosition: draft.slugNamePosition,
    slugManuallyEdited: draft.slugManuallyEdited,
    slug: draft.slugManuallyEdited ? draft.slug : null,
    showProfilePicture: draft.showProfilePicture,
    use_original_cv_filename: draft.use_original_cv_filename,
    cvModeUserChosen: draft.cvModeUserChosen,
    cvMode: draft.cvModeUserChosen ? draft.cvMode : null,
    selectedPrimaryId: draft.cvModeUserChosen
      ? draft.selectedPrimaryId
      : null,
  });
}

export function hasLeaveRelevantDraftChanges(
  baseline: string,
  current: CreateApplicationDraftInput,
): boolean {
  return baseline !== leaveRelevantDraftSnapshot(current);
}

/** History state marker used by `useLeaveConfirm` sentinel entries. */
export function isLeaveGuardHistoryState(state: unknown): boolean {
  return (
    !!state &&
    typeof state === "object" &&
    (state as { __mhvLeaveGuard?: boolean }).__mhvLeaveGuard === true
  );
}

/**
 * Wait until the leave-confirm history sentinel is gone (or timeout).
 * Call after disarming the guard and before programmatic navigation so
 * `history.back()` from sentinel removal cannot race `router.push`.
 *
 * RAF polls for a fast clear while the tab is visible; a `setTimeout`
 * deadline always wins so backgrounded tabs (where RAF may pause) cannot
 * hang Save & Preview forever.
 */
export function waitUntilLeaveGuardCleared(timeoutMs = 500): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  if (!isLeaveGuardHistoryState(window.history.state)) {
    return Promise.resolve();
  }
  return new Promise((resolve) => {
    let settled = false;
    let rafId = 0;

    const done = () => {
      if (settled) return;
      settled = true;
      window.clearTimeout(deadlineId);
      if (rafId !== 0) {
        window.cancelAnimationFrame(rafId);
      }
      resolve();
    };

    const deadlineId = window.setTimeout(done, timeoutMs);

    const tick = () => {
      if (settled) return;
      if (!isLeaveGuardHistoryState(window.history.state)) {
        done();
        return;
      }
      rafId = window.requestAnimationFrame(tick);
    };
    rafId = window.requestAnimationFrame(tick);
  });
}
