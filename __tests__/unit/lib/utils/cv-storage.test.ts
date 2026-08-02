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
  isOwnedCvUrl,
  isCvStorageUrl,
} from "@/lib/utils/cv-storage";

const USER_ID = "user-abc";
const CUSTOM_URL = `https://r2.example.com/cvs/${USER_ID}/idempotency/key123.pdf`;
const MASTER_URL = `https://r2.example.com/cvs/masters/${USER_ID}/cv-1.pdf`;
const OTHER_CUSTOM = "https://r2.example.com/cvs/other-user/idempotency/key123.pdf";
const OTHER_MASTER = "https://r2.example.com/cvs/masters/other-user/cv-1.pdf";

describe("isOwnedCvObjectKey", () => {
  it("accepts custom and master prefixes for the user", () => {
    expect(
      isOwnedCvObjectKey(`cvs/${USER_ID}/idempotency/key123.pdf`, USER_ID),
    ).toBe(true);
    expect(isOwnedCvObjectKey(`cvs/masters/${USER_ID}/cv-1.pdf`, USER_ID)).toBe(
      true,
    );
  });

  it("rejects another user's keys and prefix-only paths", () => {
    expect(
      isOwnedCvObjectKey("cvs/other-user/idempotency/key123.pdf", USER_ID),
    ).toBe(false);
    expect(isOwnedCvObjectKey(`cvs/${USER_ID}/`, USER_ID)).toBe(false);
    expect(isOwnedCvObjectKey(`cvs/masters/${USER_ID}/`, USER_ID)).toBe(false);
    expect(isOwnedCvObjectKey(null, USER_ID)).toBe(false);
    expect(isOwnedCvObjectKey(`cvs/${USER_ID}/x.pdf`, "")).toBe(false);
    expect(isOwnedCvObjectKey(`cvs/a/b/x.pdf`, "a/b")).toBe(false);
  });
});

describe("isOwnedCvUrl / isCvStorageUrl", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("returns true for owned custom and master public URLs", () => {
    expect(isOwnedCvUrl(CUSTOM_URL, USER_ID)).toBe(true);
    expect(isOwnedCvUrl(MASTER_URL, USER_ID)).toBe(true);
    expect(isCvStorageUrl(CUSTOM_URL)).toBe(true);
  });

  it("returns false for another user's objects under the same host", () => {
    expect(isOwnedCvUrl(OTHER_CUSTOM, USER_ID)).toBe(false);
    expect(isOwnedCvUrl(OTHER_MASTER, USER_ID)).toBe(false);
    expect(isCvStorageUrl(OTHER_CUSTOM)).toBe(true);
  });

  it("returns false for non-R2 URLs", () => {
    expect(isOwnedCvUrl("https://evil.example/cv.pdf", USER_ID)).toBe(false);
    expect(isCvStorageUrl("https://evil.example/cv.pdf")).toBe(false);
  });
});
