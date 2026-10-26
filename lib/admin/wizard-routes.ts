/**
 * Short-lived home for the current create/edit wizard.
 * Delete this module when one flow wins and the other route pair is removed.
 */

export const WIZARD_NEW_PATH = "/admin/wizard/new";

export function wizardEditPath(id: string): string {
  return `/admin/wizard/edit/${encodeURIComponent(id)}`;
}

/** True while the parked create wizard is the page in the address bar. */
export function isWizardCreatePath(pathname: string): boolean {
  return pathname === WIZARD_NEW_PATH || pathname.startsWith(`${WIZARD_NEW_PATH}/`);
}
