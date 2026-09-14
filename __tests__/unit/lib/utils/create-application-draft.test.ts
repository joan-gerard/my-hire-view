/**
 * Tests for /admin/new localStorage draft helpers (F15-045).
 */
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  CREATE_APPLICATION_DRAFT_MAX_AGE_MS,
  CREATE_APPLICATION_DRAFT_VERSION,
  clearCreateApplicationDraft,
  createApplicationDraftStorageKey,
  isCreateApplicationDraftBlank,
  loadCreateApplicationDraft,
  parseCreateApplicationDraft,
  saveCreateApplicationDraft,
  type CreateApplicationDraft,
} from "@/lib/utils/create-application-draft";

function sampleDraft(
  overrides: Partial<CreateApplicationDraft> = {},
): CreateApplicationDraft {
  return {
    v: CREATE_APPLICATION_DRAFT_VERSION,
    savedAt: new Date().toISOString(),
    company: "Acme",
    role: "Engineer",
    slug: "acme-engineer",
    video_url: "https://youtu.be/abc",
    first_name: "Ada",
    last_name: "Lovelace",
    location: "",
    portfolio_url: "",
    linkedin_url: "",
    include: {
      first_name: true,
      last_name: true,
      location: false,
      portfolio_url: false,
      linkedin_url: false,
    },
    slugNamePosition: null,
    slugManuallyEdited: false,
    showProfilePicture: true,
    cvMode: "primary",
    cvModeUserChosen: false,
    selectedPrimaryId: "cv-1",
    use_original_cv_filename: true,
    ...overrides,
  };
}

function memoryStorage(initial: Record<string, string> = {}) {
  const map = new Map(Object.entries(initial));
  return {
    getItem: (key: string) => map.get(key) ?? null,
    setItem: (key: string, value: string) => {
      map.set(key, value);
    },
    removeItem: (key: string) => {
      map.delete(key);
    },
    _map: map,
  };
}

describe("createApplicationDraftStorageKey", () => {
  it("scopes keys by user id and refuses a shared fallback", () => {
    expect(createApplicationDraftStorageKey("abc123")).toBe(
      "myhireview:create-application-draft:abc123",
    );
    expect(createApplicationDraftStorageKey("  ")).toBeNull();
    expect(createApplicationDraftStorageKey("")).toBeNull();
  });
});

describe("parseCreateApplicationDraft", () => {
  it("accepts a valid v2 draft", () => {
    const draft = sampleDraft({
      cvMode: "tailored",
      selectedPrimaryId: null,
      cvModeUserChosen: true,
    });
    expect(parseCreateApplicationDraft(draft)?.cvModeUserChosen).toBe(true);
  });

  it("migrates v1 drafts with cvModeUserChosen false", () => {
    const v1 = {
      ...sampleDraft({ cvModeUserChosen: true }),
      v: 1,
    };
    delete (v1 as { cvModeUserChosen?: boolean }).cvModeUserChosen;
    const parsed = parseCreateApplicationDraft(v1);
    expect(parsed?.v).toBe(2);
    expect(parsed?.cvModeUserChosen).toBe(false);
  });

  it("rejects wrong version, corrupt include, and expired drafts", () => {
    expect(
      parseCreateApplicationDraft({ ...sampleDraft(), v: 999 }),
    ).toBeNull();
    expect(
      parseCreateApplicationDraft({
        ...sampleDraft(),
        include: { first_name: true },
      }),
    ).toBeNull();
    const old = sampleDraft({
      savedAt: new Date(
        Date.now() - CREATE_APPLICATION_DRAFT_MAX_AGE_MS - 1,
      ).toISOString(),
    });
    expect(parseCreateApplicationDraft(old)).toBeNull();
  });
});

describe("isCreateApplicationDraftBlank", () => {
  it("treats a fully empty create form as blank", () => {
    expect(
      isCreateApplicationDraftBlank({
        company: "",
        role: "",
        slug: "",
        video_url: "",
        first_name: "",
        last_name: "",
        location: "",
        portfolio_url: "",
        linkedin_url: "",
        include: {
          first_name: false,
          last_name: false,
          location: false,
          portfolio_url: false,
          linkedin_url: false,
        },
        slugNamePosition: null,
        slugManuallyEdited: false,
        showProfilePicture: true,
        cvMode: "primary",
        cvModeUserChosen: false,
        selectedPrimaryId: null,
        use_original_cv_filename: true,
      }),
    ).toBe(true);
  });

  it("keeps drafts with personal-only progress or explicit CV choice", () => {
    expect(
      isCreateApplicationDraftBlank({
        company: "",
        role: "",
        slug: "",
        video_url: "",
        first_name: "Ada",
        last_name: "",
        location: "",
        portfolio_url: "",
        linkedin_url: "",
        include: {
          first_name: true,
          last_name: false,
          location: false,
          portfolio_url: false,
          linkedin_url: false,
        },
        slugNamePosition: null,
        slugManuallyEdited: false,
        showProfilePicture: true,
        cvMode: "primary",
        cvModeUserChosen: false,
        selectedPrimaryId: null,
        use_original_cv_filename: true,
      }),
    ).toBe(false);

    expect(
      isCreateApplicationDraftBlank({
        company: "",
        role: "",
        slug: "",
        video_url: "",
        first_name: "",
        last_name: "",
        location: "",
        portfolio_url: "",
        linkedin_url: "",
        include: {
          first_name: false,
          last_name: false,
          location: false,
          portfolio_url: false,
          linkedin_url: false,
        },
        slugNamePosition: null,
        slugManuallyEdited: false,
        showProfilePicture: true,
        cvMode: "tailored",
        cvModeUserChosen: true,
        selectedPrimaryId: null,
        use_original_cv_filename: true,
      }),
    ).toBe(false);

    // Auto-default tailored (empty library) with no other edits is still blank.
    expect(
      isCreateApplicationDraftBlank({
        company: "",
        role: "",
        slug: "",
        video_url: "",
        first_name: "",
        last_name: "",
        location: "",
        portfolio_url: "",
        linkedin_url: "",
        include: {
          first_name: false,
          last_name: false,
          location: false,
          portfolio_url: false,
          linkedin_url: false,
        },
        slugNamePosition: null,
        slugManuallyEdited: false,
        showProfilePicture: true,
        cvMode: "tailored",
        cvModeUserChosen: false,
        selectedPrimaryId: null,
        use_original_cv_filename: true,
      }),
    ).toBe(true);
  });

  it("keeps drafts with company", () => {
    expect(
      isCreateApplicationDraftBlank({
        ...sampleDraft(),
        company: "Acme",
      }),
    ).toBe(false);
  });
});

describe("load/save/clearCreateApplicationDraft", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("round-trips through storage and clears blank payloads", () => {
    const storage = memoryStorage();
    const key = createApplicationDraftStorageKey("user-1");
    expect(key).not.toBeNull();
    saveCreateApplicationDraft(key!, sampleDraft(), storage);
    expect(loadCreateApplicationDraft(key!, storage)?.company).toBe("Acme");

    saveCreateApplicationDraft(
      key!,
      {
        company: "",
        role: "",
        slug: "",
        video_url: "",
        first_name: "",
        last_name: "",
        location: "",
        portfolio_url: "",
        linkedin_url: "",
        include: {
          first_name: false,
          last_name: false,
          location: false,
          portfolio_url: false,
          linkedin_url: false,
        },
        slugNamePosition: null,
        slugManuallyEdited: false,
        showProfilePicture: true,
        cvMode: "primary",
        cvModeUserChosen: false,
        selectedPrimaryId: null,
        use_original_cv_filename: true,
      },
      storage,
    );
    expect(storage.getItem(key!)).toBeNull();

    saveCreateApplicationDraft(key!, sampleDraft(), storage);
    clearCreateApplicationDraft(key!, storage);
    expect(loadCreateApplicationDraft(key!, storage)).toBeNull();
  });

  it("removes corrupt JSON on load", () => {
    const key = createApplicationDraftStorageKey("user-2");
    expect(key).not.toBeNull();
    const storage = memoryStorage({ [key!]: "{not-json" });
    expect(loadCreateApplicationDraft(key!, storage)).toBeNull();
    expect(storage.getItem(key!)).toBeNull();
  });
});
