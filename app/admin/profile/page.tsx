import AccountSettingsView from "@/components/admin/account-settings/AccountSettingsView";

/**
 * Account settings for the account owner (`/admin/profile`).
 * Tabs (Profile, CVs, Preferences, Billing and plan, Password) are client
 * state — the URL does not change.
 */
export default function AdminProfilePage() {
  return <AccountSettingsView />;
}
