/**
 * Unit tests for CV R2 URL ownership helpers.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/storage/r2-client", () => ({
  getR2PublicBaseUrl: vi.fn(() => "https://r2.example.com"),
  getR2Bucket: vi.fn(() => "cvs"),
  getR2S3Client: vi.fn(),
}));

import {
  isOwnedCvObjectKey,
  isOwnedTailoredCvObjectKey,
  isOwnedPrimaryCvObjectKey,
  isOwnedCvUrl,
  isOwnedTailoredCvUrl,
  isCvStorageUrl,
} from "@/lib/utils/cv-storage";

const USER_ID = "user-abc";
const TAILORED_URL = `https://r2.example.com/cvs/${USER_ID}/tailored/key123.pdf`;
const PRIMARY_URL = `https://r2.example.com/cvs/${USER_ID}/primary/cv-1.pdf`;
const OTHER_TAILORED = "https://r2.example.com/cvs/other-user/tailored/key123.pdf";
const OTHER_PRIMARY = "https://r2.example.com/cvs/other-user/primary/cv-1.pdf";

describe("isOwnedTailoredCvObjectKey", () => {
  it("accepts the tailored prefix only", () => {
    expect(
      isOwnedTailoredCvObjectKey(`cvs/${USER_ID}/tailored/key123.pdf`, USER_ID),
    ).toBe(true);
  });

  it("rejects primary keys", () => {
    expect(
      isOwnedTailoredCvObjectKey(`cvs/${USER_ID}/primary/cv-1.pdf`, USER_ID),
    ).toBe(false);
  });
});

describe("isOwnedPrimaryCvObjectKey", () => {
  it("accepts the primary prefix only", () => {
    expect(
      isOwnedPrimaryCvObjectKey(`cvs/${USER_ID}/primary/cv-1.pdf`, USER_ID),
    ).toBe(true);
  });

  it("rejects tailored keys", () => {
    expect(
      isOwnedPrimaryCvObjectKey(`cvs/${USER_ID}/tailored/key123.pdf`, USER_ID),
    ).toBe(false);
  });
});

describe("isOwnedCvObjectKey", () => {
  it("accepts primary and tailored prefixes for the user", () => {
    expect(
      isOwnedCvObjectKey(`cvs/${USER_ID}/tailored/key123.pdf`, USER_ID),
    ).toBe(true);
    expect(isOwnedCvObjectKey(`cvs/${USER_ID}/primary/cv-1.pdf`, USER_ID)).toBe(
      true,
    );
  });

  it("rejects another user's keys and prefix-only paths", () => {
    expect(
      isOwnedCvObjectKey("cvs/other-user/tailored/key123.pdf", USER_ID),
    ).toBe(false);
    expect(isOwnedCvObjectKey(`cvs/${USER_ID}/tailored/`, USER_ID)).toBe(false);
    expect(isOwnedCvObjectKey(`cvs/${USER_ID}/primary/`, USER_ID)).toBe(false);
    expect(isOwnedCvObjectKey(null, USER_ID)).toBe(false);
    expect(isOwnedCvObjectKey(`cvs/${USER_ID}/tailored/x.pdf`, "")).toBe(false);
    expect(isOwnedCvObjectKey(`cvs/a/b/x.pdf`, "a/b")).toBe(false);
  });
});

describe("isOwnedCvUrl / isOwnedTailoredCvUrl / isCvStorageUrl", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("returns true for owned tailored and primary public URLs", () => {
    expect(isOwnedCvUrl(TAILORED_URL, USER_ID)).toBe(true);
    expect(isOwnedCvUrl(PRIMARY_URL, USER_ID)).toBe(true);
    expect(isOwnedTailoredCvUrl(TAILORED_URL, USER_ID)).toBe(true);
    expect(isOwnedTailoredCvUrl(PRIMARY_URL, USER_ID)).toBe(false);
    expect(isCvStorageUrl(TAILORED_URL)).toBe(true);
  });

  it("returns false for another user's objects under the same host", () => {
    expect(isOwnedCvUrl(OTHER_TAILORED, USER_ID)).toBe(false);
    expect(isOwnedCvUrl(OTHER_PRIMARY, USER_ID)).toBe(false);
    expect(isCvStorageUrl(OTHER_TAILORED)).toBe(true);
  });

  it("returns false for non-R2 URLs", () => {
    expect(isOwnedCvUrl("https://evil.example/cv.pdf", USER_ID)).toBe(false);
    expect(isCvStorageUrl("https://evil.example/cv.pdf")).toBe(false);
  });
});
