import { describe, expect, it, vi, afterEach } from "vitest";
import {
  DEFAULT_ONBOARDING_CHECKLIST_PREFS,
  ONBOARDING_CHECKLIST_STORAGE_KEY,
  parseOnboardingChecklistStorage,
  prefsForPublicId,
  readOnboardingChecklistPrefs,
  writeOnboardingChecklistStorage,
} from "@/lib/utils/onboarding-checklist-storage";

describe("parseOnboardingChecklistStorage", () => {
  it("returns null for invalid payloads", () => {
    expect(parseOnboardingChecklistStorage(null)).toBeNull();
    expect(parseOnboardingChecklistStorage({})).toBeNull();
    expect(parseOnboardingChecklistStorage({ publicId: "  " })).toBeNull();
  });

  it("normalizes step ids and booleans", () => {
    expect(
      parseOnboardingChecklistStorage({
        publicId: " abc ",
        skipped: ["photo", "nope"],
        completed: ["publish_share"],
        dismissed: true,
        expanded: false,
      }),
    ).toEqual({
      publicId: "abc",
      skipped: ["photo"],
      completed: ["publish_share"],
      dismissed: true,
      expanded: false,
    });
  });
});

describe("prefsForPublicId", () => {
  it("returns defaults when public ids do not match", () => {
    const stored = parseOnboardingChecklistStorage({
      publicId: "old-id",
      skipped: ["photo"],
      completed: ["publish_share"],
      dismissed: true,
      expanded: false,
    });
    expect(prefsForPublicId(stored, "new-id")).toEqual(
      DEFAULT_ONBOARDING_CHECKLIST_PREFS,
    );
  });

  it("returns stored prefs when public ids match", () => {
    const stored = parseOnboardingChecklistStorage({
      publicId: "same-id",
      skipped: ["photo"],
      completed: ["publish_share"],
      dismissed: true,
      expanded: false,
    });
    expect(prefsForPublicId(stored, "same-id")).toEqual({
      skipped: ["photo"],
      completed: ["publish_share"],
      dismissed: true,
      expanded: false,
    });
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
      publicId: "pid-1",
      skipped: ["primary_cv"],
      completed: ["create_profile"],
      dismissed: false,
      expanded: true,
    });

    expect(store.get(ONBOARDING_CHECKLIST_STORAGE_KEY)).toBe(
      JSON.stringify({
        publicId: "pid-1",
        skipped: ["primary_cv"],
        completed: ["create_profile"],
        dismissed: false,
        expanded: true,
      }),
    );
    expect(store.has("myhireview:onboarding-checklist-skipped")).toBe(false);
    expect(store.has("myhireview:onboarding-checklist-dismissed")).toBe(false);
  });

  it("reads defaults when stored publicId belongs to another account", () => {
    const store = new Map<string, string>([
      [
        ONBOARDING_CHECKLIST_STORAGE_KEY,
        JSON.stringify({
          publicId: "old-account",
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
});
