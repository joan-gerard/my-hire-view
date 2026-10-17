"use client";

import {
  ACCOUNT_SETTINGS_TABS,
  ACCOUNT_SETTINGS_TAB_EVENT,
  consumeAccountSettingsTabHandoff,
  DEFAULT_ACCOUNT_SETTINGS_TAB,
  isAccountSettingsTabId,
  type AccountSettingsTabEventDetail,
  type AccountSettingsTabId,
} from "@/lib/admin/account-settings-tabs";
import {
  useEffect,
  useId,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactNode,
} from "react";

type AccountSettingsProps = {
  panels: Record<AccountSettingsTabId, ReactNode>;
};

/**
 * Tabbed Account settings shell. URL stays `/admin/profile`; tabs are local state.
 * Panels stay mounted (hidden when inactive) so form draft state is preserved.
 */
export default function AccountSettings({ panels }: AccountSettingsProps) {
  const [activeTab, setActiveTab] = useState<AccountSettingsTabId>(
    DEFAULT_ACCOUNT_SETTINGS_TAB,
  );
  const tablistId = useId();
  const tabRefs = useRef<
    Partial<Record<AccountSettingsTabId, HTMLButtonElement | null>>
  >({});

  useEffect(() => {
    const pending = consumeAccountSettingsTabHandoff();
    if (pending) setActiveTab(pending);

    const onTabRequest = (event: Event) => {
      const detail = (event as CustomEvent<AccountSettingsTabEventDetail>)
        .detail;
      if (!isAccountSettingsTabId(detail?.tab)) return;
      // Clear any leftover handoff so a later remount does not re-apply it.
      consumeAccountSettingsTabHandoff();
      setActiveTab(detail.tab);
    };

    window.addEventListener(ACCOUNT_SETTINGS_TAB_EVENT, onTabRequest);
    return () => {
      window.removeEventListener(ACCOUNT_SETTINGS_TAB_EVENT, onTabRequest);
    };
  }, []);

  const selectTab = (tab: AccountSettingsTabId) => {
    setActiveTab(tab);
  };

  const focusTab = (tab: AccountSettingsTabId) => {
    tabRefs.current[tab]?.focus();
  };

  const handleTabKeyDown = (
    event: KeyboardEvent<HTMLButtonElement>,
    currentId: AccountSettingsTabId,
  ) => {
    const index = ACCOUNT_SETTINGS_TABS.findIndex((t) => t.id === currentId);
    if (index < 0) return;

    let nextIndex: number | null = null;
    switch (event.key) {
      case "ArrowRight":
      case "ArrowDown":
        nextIndex = (index + 1) % ACCOUNT_SETTINGS_TABS.length;
        break;
      case "ArrowLeft":
      case "ArrowUp":
        nextIndex =
          (index - 1 + ACCOUNT_SETTINGS_TABS.length) %
          ACCOUNT_SETTINGS_TABS.length;
        break;
      case "Home":
        nextIndex = 0;
        break;
      case "End":
        nextIndex = ACCOUNT_SETTINGS_TABS.length - 1;
        break;
      default:
        return;
    }

    event.preventDefault();
    const next = ACCOUNT_SETTINGS_TABS[nextIndex];
    if (!next) return;
    selectTab(next.id);
    focusTab(next.id);
  };

  return (
    <div className="space-y-6">
      <div className="min-w-0">
        <h1 className="font-heading text-3xl font-semibold tracking-[-0.03em] text-[var(--ink)] sm:text-4xl">
          Account settings
        </h1>
        <p className="mt-1.5 text-sm text-[var(--muted)]">
          Manage your profile, CVs, preferences, plan, and password.
        </p>
      </div>

      <div
        role="tablist"
        aria-label="Account settings sections"
        id={tablistId}
        className="flex gap-1 overflow-x-auto border-b border-[var(--ink)]/10 pb-px [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {ACCOUNT_SETTINGS_TABS.map((tab) => {
          const selected = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              id={`${tablistId}-${tab.id}`}
              aria-selected={selected}
              aria-controls={`${tablistId}-panel-${tab.id}`}
              tabIndex={selected ? 0 : -1}
              ref={(el) => {
                tabRefs.current[tab.id] = el;
              }}
              onClick={() => selectTab(tab.id)}
              onKeyDown={(event) => handleTabKeyDown(event, tab.id)}
              className={`shrink-0 cursor-pointer border-b-2 px-3 py-2.5 text-sm font-medium transition-colors focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ink)] ${
                selected
                  ? "border-[var(--ink)] text-[var(--ink)]"
                  : "border-transparent text-[var(--muted)] hover:text-[var(--ink)]"
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {ACCOUNT_SETTINGS_TABS.map((tab) => {
        const selected = activeTab === tab.id;
        return (
          <div
            key={tab.id}
            role="tabpanel"
            id={`${tablistId}-panel-${tab.id}`}
            aria-labelledby={`${tablistId}-${tab.id}`}
            hidden={!selected}
            className="space-y-6"
          >
            {panels[tab.id]}
          </div>
        );
      })}
    </div>
  );
}
