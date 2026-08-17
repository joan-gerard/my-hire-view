/**
 * Unit tests for profile picture Storage URL helpers.
 */
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import {
  cacheBustProfilePictureUrl,
  canonicalProfilePicturePath,
  getProfilePictureStoragePath,
  isCanonicalProfilePicturePath,
  isOwnedProfilePictureUrl,
} from "@/lib/utils/profile-picture-storage";

const USER_ID = "user-123";
const SUPABASE_ORIGIN = "https://abc.supabase.co";
const CANONICAL_URL =
  "https://abc.supabase.co/storage/v1/object/public/profile-pictures/user-123/avatar.jpg";
const LEGACY_URL =
  "https://abc.supabase.co/storage/v1/object/public/profile-pictures/user-123/abc.jpg";
const OTHER_USER_URL =
  "https://abc.supabase.co/storage/v1/object/public/profile-pictures/other-user/avatar.jpg";
/** Same path shape as ours, but on an attacker-controlled host (C2-008). */
const LOOKALIKE_EXTERNAL_URL =
  "https://evil.example/storage/v1/object/public/profile-pictures/user-123/avatar.jpg";

beforeEach(() => {
  vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", SUPABASE_ORIGIN);
});

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("getProfilePictureStoragePath", () => {
  it("extracts the object path from a profile-pictures public URL", () => {
    expect(getProfilePictureStoragePath(CANONICAL_URL)).toBe(
      "user-123/avatar.jpg",
    );
  });

  it("returns null for non-storage or non-bucket URLs", () => {
    expect(getProfilePictureStoragePath("https://evil.example/x.jpg")).toBeNull();
    expect(
      getProfilePictureStoragePath(
        "http://abc.supabase.co/storage/v1/object/public/profile-pictures/user-123/avatar.jpg",
      ),
    ).toBeNull();
    expect(getProfilePictureStoragePath(null)).toBeNull();
  });

  it("returns null for lookalike paths on a foreign HTTPS origin (C2-008)", () => {
    expect(getProfilePictureStoragePath(LOOKALIKE_EXTERNAL_URL)).toBeNull();
  });

  it("returns null when NEXT_PUBLIC_SUPABASE_URL is unset", () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "");
    expect(getProfilePictureStoragePath(CANONICAL_URL)).toBeNull();
  });

  it("accepts URLs when the env var has a trailing slash", () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", `${SUPABASE_ORIGIN}/`);
    expect(getProfilePictureStoragePath(CANONICAL_URL)).toBe(
      "user-123/avatar.jpg",
    );
  });
});

describe("canonicalProfilePicturePath", () => {
  it("builds userId/avatar.ext and normalizes jpeg to jpg", () => {
    expect(canonicalProfilePicturePath(USER_ID, "png")).toBe(
      "user-123/avatar.png",
    );
    expect(canonicalProfilePicturePath(USER_ID, "jpeg")).toBe(
      "user-123/avatar.jpg",
    );
  });
});

describe("isCanonicalProfilePicturePath", () => {
  it("accepts avatar with allowed extensions", () => {
    expect(isCanonicalProfilePicturePath("user-123/avatar.webp", USER_ID)).toBe(
      true,
    );
  });

  it("rejects legacy UUID filenames", () => {
    expect(isCanonicalProfilePicturePath("user-123/abc.jpg", USER_ID)).toBe(
      false,
    );
  });
});

describe("isOwnedProfilePictureUrl", () => {
  it("returns true for canonical and legacy URLs under the user's folder", () => {
    expect(isOwnedProfilePictureUrl(CANONICAL_URL, USER_ID)).toBe(true);
    expect(isOwnedProfilePictureUrl(LEGACY_URL, USER_ID)).toBe(true);
  });

  it("returns false for another user's folder", () => {
    expect(isOwnedProfilePictureUrl(OTHER_USER_URL, USER_ID)).toBe(false);
  });

  it("returns false for arbitrary https URLs", () => {
    expect(
      isOwnedProfilePictureUrl("https://cdn.example.com/pic.jpg", USER_ID),
    ).toBe(false);
  });

  it("returns false for lookalike storage paths on a foreign origin (C2-008)", () => {
    expect(isOwnedProfilePictureUrl(LOOKALIKE_EXTERNAL_URL, USER_ID)).toBe(
      false,
    );
  });

  it("returns false when the path is only the user id with no object", () => {
    const bare =
      "https://abc.supabase.co/storage/v1/object/public/profile-pictures/user-123";
    expect(isOwnedProfilePictureUrl(bare, USER_ID)).toBe(false);
  });

  it("returns false when the path is the user folder with a trailing slash", () => {
    const bare =
      "https://abc.supabase.co/storage/v1/object/public/profile-pictures/user-123/";
    expect(isOwnedProfilePictureUrl(bare, USER_ID)).toBe(false);
  });

  it("returns false for an empty user id", () => {
    expect(isOwnedProfilePictureUrl(CANONICAL_URL, "")).toBe(false);
  });
});

describe("cacheBustProfilePictureUrl", () => {
  it("appends v query from version", () => {
    expect(
      cacheBustProfilePictureUrl(CANONICAL_URL, "2026-01-01T00:00:00Z"),
    ).toBe(`${CANONICAL_URL}?v=2026-01-01T00%3A00%3A00Z`);
  });

  it("replaces an existing v param", () => {
    expect(cacheBustProfilePictureUrl(`${CANONICAL_URL}?v=old`, "new")).toBe(
      `${CANONICAL_URL}?v=new`,
    );
  });

  it("leaves blob URLs and empty version unchanged", () => {
    expect(cacheBustProfilePictureUrl("blob:http://localhost/x", "1")).toBe(
      "blob:http://localhost/x",
    );
    expect(cacheBustProfilePictureUrl(CANONICAL_URL, "")).toBe(CANONICAL_URL);
    expect(cacheBustProfilePictureUrl(null, "1")).toBeNull();
  });
});
