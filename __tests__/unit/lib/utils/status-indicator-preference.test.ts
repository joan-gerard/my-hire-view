import { afterEach, describe, expect, it, vi } from "vitest";
import {
  DEFAULT_STATUS_INDICATOR_STYLE,
  STATUS_INDICATOR_STORAGE_KEY,
  parseStatusIndicatorStorage,
  readStatusIndicatorStyle,
  writeStatusIndicatorStyle,
} from "@/lib/utils/status-indicator-preference";

describe("parseStatusIndicatorStorage", () => {
  it("rejects invalid payloads", () => {
    expect(parseStatusIndicatorStorage(null)).toBeNull();
    expect(parseStatusIndicatorStorage({})).toBeNull();
    expect(
      parseStatusIndicatorStorage({ accountKey: "  ", style: "colorful" }),
    ).toBeNull();
    expect(
      parseStatusIndicatorStorage({ accountKey: "a", style: "neon" }),
    ).toBeNull();
  });

  it("accepts colorful and high_contrast", () => {
    expect(
      parseStatusIndicatorStorage({
        accountKey: "pid",
        style: "high_contrast",
      }),
    ).toEqual({ accountKey: "pid", style: "high_contrast" });
  });
});

describe("read/write StatusIndicatorStyle", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("returns default when storage is empty or account mismatches", () => {
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

    expect(readStatusIndicatorStyle("a")).toBe(DEFAULT_STATUS_INDICATOR_STYLE);

    writeStatusIndicatorStyle("a", "high_contrast");
    expect(readStatusIndicatorStyle("a")).toBe("high_contrast");
    expect(readStatusIndicatorStyle("other")).toBe(
      DEFAULT_STATUS_INDICATOR_STYLE,
    );

    const raw = store.get(STATUS_INDICATOR_STORAGE_KEY);
    expect(raw).toBeTruthy();
    expect(JSON.parse(raw!)).toEqual({
      accountKey: "a",
      style: "high_contrast",
    });
  });
});
