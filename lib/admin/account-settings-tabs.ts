/**
 * Account settings tabs on `/admin/profile` (client state only — URL stays `/admin/profile`).
 * Top nav stays labelled Profile; page title is Account settings.
 */

export const ACCOUNT_SETTINGS_TABS = [
  { id: "profile", label: "Profile" },
  { id: "cvs", label: "CVs" },
  { id: "preferences", label: "Preferences" },
  /** Shell only until Stripe / membership (E2). */
  { id: "billing", label: "Billing and plan", preview: true },
  /** Shell only until change-password wiring (L4-098 / F36-120). */
  { id: "password", label: "Password", preview: true },
] as const;

export type AccountSettingsTabId =
  (typeof ACCOUNT_SETTINGS_TABS)[number]["id"];

export const DEFAULT_ACCOUNT_SETTINGS_TAB: AccountSettingsTabId = "profile";

/** Optional handoff so another page can open a specific tab after navigating here. */
export const ACCOUNT_SETTINGS_TAB_HANDOFF_KEY =
  "myhireview:account-settings-tab" as const;

/** Same-document signal when Account settings is already mounted. */
export const ACCOUNT_SETTINGS_TAB_EVENT =
  "myhireview:account-settings-tab" as const;

export type AccountSettingsTabEventDetail = {
  tab: AccountSettingsTabId;
};

export function isAccountSettingsTabId(
  value: string | null | undefined,
): value is AccountSettingsTabId {
  return ACCOUNT_SETTINGS_TABS.some((tab) => tab.id === value);
}

export function parseAccountSettingsTab(
  value: string | null | undefined,
): AccountSettingsTabId {
  return isAccountSettingsTabId(value)
    ? value
    : DEFAULT_ACCOUNT_SETTINGS_TAB;
}

function getSessionStorage(): Storage | null {
  try {
    const storage = (
      globalThis as typeof globalThis & { sessionStorage?: Storage }
    ).sessionStorage;
    return storage ?? null;
  } catch {
    return null;
  }
}

/**
 * Open a tab on Account settings.
 * - Cross-route: sessionStorage handoff consumed on mount
 * - Same page (`/admin/profile` already open): CustomEvent for live listeners
 */
export function requestAccountSettingsTab(tab: AccountSettingsTabId): void {
  try {
    getSessionStorage()?.setItem(ACCOUNT_SETTINGS_TAB_HANDOFF_KEY, tab);
  } catch {
    // Ignore quota / private-mode failures — event may still deliver same-page.
  }
  try {
    const target = globalThis as typeof globalThis & {
      dispatchEvent?: (event: Event) => boolean;
      CustomEvent?: typeof CustomEvent;
    };
    if (typeof target.dispatchEvent !== "function" || !target.CustomEvent) {
      return;
    }
    target.dispatchEvent(
      new target.CustomEvent<AccountSettingsTabEventDetail>(
        ACCOUNT_SETTINGS_TAB_EVENT,
        { detail: { tab } },
      ),
    );
  } catch {
    // Ignore environments without DOM events.
  }
}

/** Consume a pending tab handoff (clears storage). */
export function consumeAccountSettingsTabHandoff(): AccountSettingsTabId | null {
  try {
    const storage = getSessionStorage();
    if (!storage) return null;
    const value = storage.getItem(ACCOUNT_SETTINGS_TAB_HANDOFF_KEY);
    storage.removeItem(ACCOUNT_SETTINGS_TAB_HANDOFF_KEY);
    return isAccountSettingsTabId(value) ? value : null;
  } catch {
    return null;
  }
}
