"use client";

import AccountBillingPanel from "@/components/admin/account-settings/AccountBillingPanel";
import PrimaryCvLibrarySection from "@/components/forms/PrimaryCvLibrarySection";
import {
  createContext,
  useContext,
  useState,
  type ReactNode,
} from "react";

type AccountSettingsUsageContextValue = {
  applicationCount: number;
  primaryCvCount: number;
  setPrimaryCvCount: (count: number) => void;
};

const AccountSettingsUsageContext =
  createContext<AccountSettingsUsageContextValue | null>(null);

type AccountSettingsUsageProviderProps = {
  applicationCount: number;
  initialPrimaryCvCount: number;
  children: ReactNode;
};

/**
 * Shares application + primary-CV usage between the CVs and Billing tabs so
 * library mutations keep the Billing usage figures current without a refresh.
 */
export function AccountSettingsUsageProvider({
  applicationCount,
  initialPrimaryCvCount,
  children,
}: AccountSettingsUsageProviderProps) {
  const [primaryCvCount, setPrimaryCvCount] = useState(initialPrimaryCvCount);

  return (
    <AccountSettingsUsageContext.Provider
      value={{ applicationCount, primaryCvCount, setPrimaryCvCount }}
    >
      {children}
    </AccountSettingsUsageContext.Provider>
  );
}

function useAccountSettingsUsage(): AccountSettingsUsageContextValue {
  const value = useContext(AccountSettingsUsageContext);
  if (!value) {
    throw new Error(
      "Account settings usage hooks require AccountSettingsUsageProvider",
    );
  }
  return value;
}

/** CVs tab panel — updates shared primary-CV count on library changes. */
export function AccountCvsPanel() {
  const { setPrimaryCvCount } = useAccountSettingsUsage();
  return (
    <PrimaryCvLibrarySection
      onLibraryChange={(items) => setPrimaryCvCount(items.length)}
    />
  );
}

/** Billing tab panel — reads live primary-CV count from shared usage state. */
export function AccountBillingPanelConnected() {
  const { applicationCount, primaryCvCount } = useAccountSettingsUsage();
  return (
    <AccountBillingPanel
      applicationCount={applicationCount}
      primaryCvCount={primaryCvCount}
    />
  );
}
