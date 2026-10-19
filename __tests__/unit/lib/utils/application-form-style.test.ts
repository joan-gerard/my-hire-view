import { afterEach, describe, expect, it, vi } from "vitest";
import {
  APPLICATION_FORM_STYLE_DEFAULT,
  APPLICATION_FORM_STYLE_STORAGE_KEY,
  getEnvApplicationFormStyleDefault,
  isApplicationFormStyleSwitchEnabled,
  parseApplicationFormStyle,
  readStoredApplicationFormStyle,
  resolveApplicationFormStyle,
  writeStoredApplicationFormStyle,
} from "@/lib/utils/application-form-style";

describe("parseApplicationFormStyle", () => {
  it("accepts wizard and sections (case-insensitive)", () => {
    expect(parseApplicationFormStyle("wizard")).toBe("wizard");
    expect(parseApplicationFormStyle("Sections")).toBe("sections");
    expect(parseApplicationFormStyle("  WIZARD  ")).toBe("wizard");
  });

  it("rejects unknown values", () => {
    expect(parseApplicationFormStyle("classic")).toBeNull();
    expect(parseApplicationFormStyle("")).toBeNull();
    expect(parseApplicationFormStyle(null)).toBeNull();
  });
});

describe("resolveApplicationFormStyle", () => {
  it("prefers search param over stored and env", () => {
    expect(
      resolveApplicationFormStyle({
        searchParam: "wizard",
        stored: "sections",
        envDefault: "sections",
      }),
    ).toBe("wizard");
  });

  it("falls back stored → env → hard default", () => {
    expect(
      resolveApplicationFormStyle({
        searchParam: "nope",
        stored: "wizard",
        envDefault: "sections",
      }),
    ).toBe("wizard");
    expect(
      resolveApplicationFormStyle({
        searchParam: null,
        stored: null,
        envDefault: "wizard",
      }),
    ).toBe("wizard");
    expect(resolveApplicationFormStyle({})).toBe(
      APPLICATION_FORM_STYLE_DEFAULT,
    );
  });
});

describe("localStorage helpers", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  function stubStorage(initial?: Record<string, string>) {
    const store = new Map<string, string>(Object.entries(initial ?? {}));
    vi.stubGlobal("localStorage", {
      getItem: (key: string) => store.get(key) ?? null,
      setItem: (key: string, value: string) => {
        store.set(key, value);
      },
      removeItem: (key: string) => {
        store.delete(key);
      },
    });
    return store;
  }

  it("round-trips a stored style", () => {
    const store = stubStorage();
    writeStoredApplicationFormStyle("wizard");
    expect(store.get(APPLICATION_FORM_STYLE_STORAGE_KEY)).toBe("wizard");
    expect(readStoredApplicationFormStyle()).toBe("wizard");
  });

  it("returns null for garbage in storage", () => {
    stubStorage({ [APPLICATION_FORM_STYLE_STORAGE_KEY]: "classic" });
    expect(readStoredApplicationFormStyle()).toBeNull();
  });
});

describe("env helpers", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("reads NEXT_PUBLIC_APPLICATION_FORM_STYLE", () => {
    vi.stubEnv("NEXT_PUBLIC_APPLICATION_FORM_STYLE", "wizard");
    expect(getEnvApplicationFormStyleDefault()).toBe("wizard");
  });

  it("gates the switch via NEXT_PUBLIC_SHOW_FORM_STYLE_SWITCH", () => {
    vi.stubEnv("NEXT_PUBLIC_SHOW_FORM_STYLE_SWITCH", "0");
    expect(isApplicationFormStyleSwitchEnabled()).toBe(false);
    vi.stubEnv("NEXT_PUBLIC_SHOW_FORM_STYLE_SWITCH", "1");
    expect(isApplicationFormStyleSwitchEnabled()).toBe(true);
  });
});
