/**
 * Keep ApplicationForm’s primary-CV GET from racing the library modal.
 * Modal updates bump generation so a slower initial fetch cannot overwrite
 * a newer list (and flip create flows back to tailored).
 *
 * F15-049: also avoid overwriting an explicit CV source choice (or a restored
 * create-form draft) when the initial library fetch completes.
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
 * Create-form initial library load may set a default CV mode only when the
 * user has not already chosen (radio / pending file / restored draft).
 * Edit always has a saved `cv_type`, so this stays false there.
 */
export function shouldApplyInitialCvModeDefault(args: {
  hasSavedCvType: boolean;
  userChoseCvMode: boolean;
}): boolean {
  return !args.hasSavedCvType && !args.userChoseCvMode;
}

/**
 * After a modal library update, auto-select the first primary on **create**
 * when the library was empty — unless the user already picked tailored/primary.
 * Never on edit: a saved `cv_type` must win.
 */
export function shouldAutoSelectFirstPrimaryOnLibraryFill(args: {
  hadPrimaryCvs: boolean;
  isCreate: boolean;
  listLength: number;
  /** Explicit radio / draft choice — do not force primary over tailored. */
  userChoseCvMode?: boolean;
}): boolean {
  return (
    !args.hadPrimaryCvs &&
    args.isCreate &&
    args.listLength > 0 &&
    !args.userChoseCvMode
  );
}
