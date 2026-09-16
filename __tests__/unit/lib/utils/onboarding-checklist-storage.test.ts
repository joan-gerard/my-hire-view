import { describe, expect, it, vi, afterEach } from "vitest";
import {
  DEFAULT_ONBOARDING_CHECKLIST_PREFS,
  ONBOARDING_CHECKLIST_STORAGE_KEY,
  parseOnboardingChecklistStorage,
  prefsForAccountKey,
  readOnboardingChecklistPrefs,
  resolveOnboardingAccountKey,
  writeOnboardingChecklistStorage,
} from "@/lib/utils/onboarding-checklist-storage";

describe("parseOnboardingChecklistStorage", () => {
  it("returns null for invalid payloads", () => {
    expect(parseOnboardingChecklistStorage(null)).toBeNull();
    expect(parseOnboardingChecklistStorage({})).toBeNull();
    expect(parseOnboardingChecklistStorage({ accountKey: "  " })).toBeNull();
  });

  it("normalizes step ids and booleans", () => {
    expect(
      parseOnboardingChecklistStorage({
        accountKey: " abc ",
        skipped: ["photo", "nope"],
        completed: ["publish_share"],
        dismissed: true,
        expanded: false,
      }),
    ).toEqual({
      accountKey: "abc",
      skipped: ["photo"],
      completed: ["publish_share"],
      dismissed: true,
      expanded: false,
    });
  });

  it("accepts legacy publicId field as accountKey", () => {
    expect(
      parseOnboardingChecklistStorage({
        publicId: "legacy-pid",
        skipped: [],
        completed: [],
        dismissed: false,
        expanded: true,
      }),
    ).toMatchObject({ accountKey: "legacy-pid" });
  });
});

describe("prefsForAccountKey", () => {
  it("returns defaults when account keys do not match", () => {
    const stored = parseOnboardingChecklistStorage({
      accountKey: "old-id",
      skipped: ["photo"],
      completed: ["publish_share"],
      dismissed: true,
      expanded: false,
    });
    expect(prefsForAccountKey(stored, "new-id")).toEqual(
      DEFAULT_ONBOARDING_CHECKLIST_PREFS,
    );
  });

  it("returns stored prefs when account keys match", () => {
    const stored = parseOnboardingChecklistStorage({
      accountKey: "same-id",
      skipped: ["photo"],
      completed: ["publish_share"],
      dismissed: true,
      expanded: false,
    });
    expect(prefsForAccountKey(stored, "same-id")).toEqual({
      skipped: ["photo"],
      completed: ["publish_share"],
      dismissed: true,
      expanded: false,
    });
  });
});

describe("resolveOnboardingAccountKey", () => {
  it("prefers profile public id, then metadata, then user id", () => {
    expect(
      resolveOnboardingAccountKey({
        profilePublicId: "from-profile",
        metadataPublicId: "from-meta",
        authUserId: "uid",
      }),
    ).toBe("from-profile");
    expect(
      resolveOnboardingAccountKey({
        profilePublicId: null,
        metadataPublicId: "from-meta",
        authUserId: "uid",
      }),
    ).toBe("from-meta");
    expect(
      resolveOnboardingAccountKey({
        profilePublicId: null,
        metadataPublicId: null,
        authUserId: "uid",
      }),
    ).toBe("user:uid");
    expect(
      resolveOnboardingAccountKey({
        profilePublicId: "  ",
        metadataPublicId: null,
        authUserId: null,
      }),
    ).toBeNull();
  });
});

describe("read/write OnboardingChecklistStorage", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("writes a single blob and clears legacy keys", () => {
    const store = new Map<string, string>();
    vi.stubGlobal("localStorage", {
      getItem: (key: string) => store.get(key) ?? null,
      setItem: (key: string, value: string) => {
        store.set(key, value);
      },
      removeItem: (key: string) => {
        store.delete(key);
      },
    });
    store.set("myhireview:onboarding-checklist-skipped", '["photo"]');
    store.set("myhireview:onboarding-checklist-dismissed", "true");

    writeOnboardingChecklistStorage({
      accountKey: "pid-1",
      skipped: ["primary_cv"],
      completed: ["create_profile"],
      dismissed: false,
      expanded: true,
    });

    expect(store.get(ONBOARDING_CHECKLIST_STORAGE_KEY)).toBe(
      JSON.stringify({
        accountKey: "pid-1",
        skipped: ["primary_cv"],
        completed: ["create_profile"],
        dismissed: false,
        expanded: true,
      }),
    );
    expect(store.has("myhireview:onboarding-checklist-skipped")).toBe(false);
    expect(store.has("myhireview:onboarding-checklist-dismissed")).toBe(false);
  });

  it("reads defaults when stored accountKey belongs to another account", () => {
    const store = new Map<string, string>([
      [
        ONBOARDING_CHECKLIST_STORAGE_KEY,
        JSON.stringify({
          accountKey: "old-account",
          skipped: [],
          completed: ["publish_share"],
          dismissed: true,
          expanded: true,
        }),
      ],
    ]);
    vi.stubGlobal("localStorage", {
      getItem: (key: string) => store.get(key) ?? null,
      setItem: () => {},
      removeItem: () => {},
    });

    expect(readOnboardingChecklistPrefs("new-account")).toEqual(
      DEFAULT_ONBOARDING_CHECKLIST_PREFS,
    );
  });

  it("migrates legacy keys into the account blob before clearing them", () => {
    const store = new Map<string, string>([
      ["myhireview:onboarding-checklist-skipped", '["photo"]'],
      ["myhireview:onboarding-checklist-completed", '["publish_share"]'],
      ["myhireview:onboarding-checklist-dismissed", "true"],
      ["myhireview:onboarding-checklist-expanded", "false"],
    ]);
    vi.stubGlobal("localStorage", {
      getItem: (key: string) => store.get(key) ?? null,
      setItem: (key: string, value: string) => {
        store.set(key, value);
      },
      removeItem: (key: string) => {
        store.delete(key);
      },
    });

    expect(readOnboardingChecklistPrefs("pid-legacy")).toEqual({
      skipped: ["photo"],
      completed: ["publish_share"],
      dismissed: true,
      expanded: false,
    });
    expect(JSON.parse(store.get(ONBOARDING_CHECKLIST_STORAGE_KEY)!)).toEqual({
      accountKey: "pid-legacy",
      skipped: ["photo"],
      completed: ["publish_share"],
      dismissed: true,
      expanded: false,
    });
    expect(store.has("myhireview:onboarding-checklist-skipped")).toBe(false);
    expect(store.has("myhireview:onboarding-checklist-completed")).toBe(false);
    expect(store.has("myhireview:onboarding-checklist-dismissed")).toBe(false);
    expect(store.has("myhireview:onboarding-checklist-expanded")).toBe(false);
  });
});
