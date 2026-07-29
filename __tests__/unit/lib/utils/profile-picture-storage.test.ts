/**
 * Unit tests for profile picture Storage URL helpers.
 */
import { describe, it, expect } from "vitest";
import {
  getProfilePictureStoragePath,
  isOwnedProfilePictureUrl,
} from "@/lib/utils/profile-picture-storage";

const USER_ID = "user-123";
const OWNED_URL =
  "https://abc.supabase.co/storage/v1/object/public/profile-pictures/user-123/abc.jpg";
const OTHER_USER_URL =
  "https://abc.supabase.co/storage/v1/object/public/profile-pictures/other-user/abc.jpg";

describe("getProfilePictureStoragePath", () => {
  it("extracts the object path from a profile-pictures public URL", () => {
    expect(getProfilePictureStoragePath(OWNED_URL)).toBe("user-123/abc.jpg");
  });

  it("returns null for non-storage or non-bucket URLs", () => {
    expect(getProfilePictureStoragePath("https://evil.example/x.jpg")).toBeNull();
    expect(getProfilePictureStoragePath("http://abc.supabase.co/storage/v1/object/public/profile-pictures/user-123/a.jpg")).toBeNull();
    expect(getProfilePictureStoragePath(null)).toBeNull();
  });
});

describe("isOwnedProfilePictureUrl", () => {
  it("returns true for a URL under the user's folder", () => {
    expect(isOwnedProfilePictureUrl(OWNED_URL, USER_ID)).toBe(true);
  });

  it("returns false for another user's folder", () => {
    expect(isOwnedProfilePictureUrl(OTHER_USER_URL, USER_ID)).toBe(false);
  });

  it("returns false for arbitrary https URLs", () => {
    expect(
      isOwnedProfilePictureUrl("https://cdn.example.com/pic.jpg", USER_ID),
    ).toBe(false);
  });

  it("returns false when the path is only the user id with no object", () => {
    const bare =
      "https://abc.supabase.co/storage/v1/object/public/profile-pictures/user-123/";
    expect(isOwnedProfilePictureUrl(bare, USER_ID)).toBe(false);
  });

  it("returns false for an empty user id", () => {
    expect(isOwnedProfilePictureUrl(OWNED_URL, "")).toBe(false);
  });
});
