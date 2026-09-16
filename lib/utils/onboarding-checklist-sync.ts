/**
 * Browser event so the floating onboarding checklist can refetch after
 * profile / CV / application mutations without a full page reload.
 */

export const ONBOARDING_CHECKLIST_CHANGED_EVENT =
  "myhireview:onboarding-checklist-changed";

/** Notify listeners that onboarding-relevant data may have changed. */
export function notifyOnboardingChecklistChanged(): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(ONBOARDING_CHECKLIST_CHANGED_EVENT));
}

/**
 * Subscribe to onboarding data changes. Returns an unsubscribe function.
 */
export function subscribeOnboardingChecklistChanged(
  listener: () => void,
): () => void {
  if (typeof window === "undefined") return () => {};
  window.addEventListener(ONBOARDING_CHECKLIST_CHANGED_EVENT, listener);
  return () => {
    window.removeEventListener(ONBOARDING_CHECKLIST_CHANGED_EVENT, listener);
  };
}
