/**
 * Keep ApplicationForm’s primary-CV GET from racing the library modal.
 * Modal updates bump generation so a slower initial fetch cannot overwrite
 * a newer list (and flip create flows back to tailored).
 */

/** True when this in-flight form GET is still the latest library snapshot. */
export function isCurrentPrimaryCvLoad(
  generation: number,
  latest: number,
  cancelled = false,
): boolean {
  return !cancelled && generation === latest;
}

/**
 * After a modal library update, auto-select the first primary on **create**
 * when the library was empty. Never on edit: a saved `cv_type` must win.
 */
export function shouldAutoSelectFirstPrimaryOnLibraryFill(args: {
  hadPrimaryCvs: boolean;
  isCreate: boolean;
  listLength: number;
}): boolean {
  return !args.hadPrimaryCvs && args.isCreate && args.listLength > 0;
}
