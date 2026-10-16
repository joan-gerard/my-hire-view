import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  ACCOUNT_SETTINGS_TABS,
  ACCOUNT_SETTINGS_TAB_HANDOFF_KEY,
  consumeAccountSettingsTabHandoff,
  DEFAULT_ACCOUNT_SETTINGS_TAB,
  parseAccountSettingsTab,
  requestAccountSettingsTab,
} from "@/lib/admin/account-settings-tabs";

describe("account-settings-tabs", () => {
  const store = new Map<string, string>();

  beforeEach(() => {
    store.clear();
    vi.stubGlobal("sessionStorage", {
      getItem: (key: string) => store.get(key) ?? null,
      setItem: (key: string, value: string) => {
        store.set(key, value);
      },
      removeItem: (key: string) => {
        store.delete(key);
      },
      clear: () => {
        store.clear();
      },
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("exposes five tabs in the product order", () => {
    expect(ACCOUNT_SETTINGS_TABS.map((t) => t.id)).toEqual([
      "profile",
      "cvs",
      "preferences",
      "billing",
      "password",
    ]);
  });

  it("parses known tabs and falls back to profile", () => {
    expect(parseAccountSettingsTab("billing")).toBe("billing");
    expect(parseAccountSettingsTab("preferences")).toBe("preferences");
    expect(parseAccountSettingsTab(undefined)).toBe(
      DEFAULT_ACCOUNT_SETTINGS_TAB,
    );
    expect(parseAccountSettingsTab("nope")).toBe("profile");
  });

  it("hands off a tab via sessionStorage for post-navigation open", () => {
    requestAccountSettingsTab("preferences");
    expect(store.get(ACCOUNT_SETTINGS_TAB_HANDOFF_KEY)).toBe("preferences");
    expect(consumeAccountSettingsTabHandoff()).toBe("preferences");
    expect(store.has(ACCOUNT_SETTINGS_TAB_HANDOFF_KEY)).toBe(false);
    expect(consumeAccountSettingsTabHandoff()).toBeNull();
  });
});
