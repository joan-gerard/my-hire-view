import { afterEach, describe, expect, it, vi } from "vitest";
import {
  DEFAULT_STATUS_INDICATOR_STYLE,
  STATUS_INDICATOR_STORAGE_KEY,
  normalizeProfilePublicIdForPrefs,
  parseStatusIndicatorStorage,
  readStatusIndicatorStyle,
  styleFromStorageEvent,
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

  it("accepts v2 byAccount maps", () => {
    expect(
      parseStatusIndicatorStorage({
        byAccount: { pid: "high_contrast", "user:1": "colorful" },
      }),
    ).toEqual({
      byAccount: { pid: "high_contrast", "user:1": "colorful" },
    });
  });

  it("migrates legacy v1 single-account blobs", () => {
    expect(
      parseStatusIndicatorStorage({
        accountKey: "pid",
        style: "high_contrast",
      }),
    ).toEqual({ byAccount: { pid: "high_contrast" } });
  });
});

describe("normalizeProfilePublicIdForPrefs", () => {
  it("rejects empty, whitespace, and invalid public ids", () => {
    expect(normalizeProfilePublicIdForPrefs(null)).toBeNull();
    expect(normalizeProfilePublicIdForPrefs("  ")).toBeNull();
    expect(normalizeProfilePublicIdForPrefs("not-valid!!!")).toBeNull();
  });
});

describe("read/write StatusIndicatorStyle", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("keeps styles per account without overwriting siblings", () => {
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
    writeStatusIndicatorStyle("b", "colorful");
    expect(readStatusIndicatorStyle("a")).toBe("high_contrast");
    expect(readStatusIndicatorStyle("b")).toBe("colorful");

    const raw = store.get(STATUS_INDICATOR_STORAGE_KEY);
    expect(raw).toBeTruthy();
    expect(JSON.parse(raw!)).toEqual({
      byAccount: { a: "high_contrast", b: "colorful" },
    });
  });

  it("reads a legacy v1 blob for the matching account", () => {
    const store = new Map<string, string>([
      [
        STATUS_INDICATOR_STORAGE_KEY,
        JSON.stringify({ accountKey: "legacy", style: "high_contrast" }),
      ],
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

    expect(readStatusIndicatorStyle("legacy")).toBe("high_contrast");
    expect(readStatusIndicatorStyle("other")).toBe(
      DEFAULT_STATUS_INDICATOR_STYLE,
    );
  });
});

describe("styleFromStorageEvent", () => {
  it("returns the style for this account from a storage event", () => {
    const event = {
      key: STATUS_INDICATOR_STORAGE_KEY,
      newValue: JSON.stringify({
        byAccount: { a: "high_contrast", b: "colorful" },
      }),
    } as StorageEvent;

    expect(styleFromStorageEvent(event, "a")).toBe("high_contrast");
    expect(styleFromStorageEvent(event, "missing")).toBeNull();
    expect(
      styleFromStorageEvent(
        { key: "other", newValue: "{}" } as StorageEvent,
        "a",
      ),
    ).toBeNull();
  });
});
