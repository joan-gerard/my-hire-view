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
  getCvObjectKeyFromPublicUrl,
  toCanonicalCvPublicUrl,
  deleteCvIfOurs,
  deleteApplicationCvIfTailored,
  checkCvObjectExists,
} from "@/lib/utils/cv-storage";
import { getR2PublicBaseUrl, getR2S3Client } from "@/lib/storage/r2-client";
import { HeadObjectCommand } from "@aws-sdk/client-s3";

const USER_ID = "user-abc";
const TAILORED_URL = `https://r2.example.com/cvs/${USER_ID}/tailored/key123.pdf`;
const TAILORED_ENCODED_URL = `https://r2.example.com/cvs/${USER_ID}/tailored/key%2F123.pdf`;
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

describe("getCvObjectKeyFromPublicUrl / toCanonicalCvPublicUrl", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getR2PublicBaseUrl).mockReturnValue("https://r2.example.com");
  });

  it("decodes percent-encoded path segments to the same key", () => {
    expect(getCvObjectKeyFromPublicUrl(TAILORED_ENCODED_URL)).toBe(
      `cvs/${USER_ID}/tailored/key/123.pdf`,
    );
  });

  it("strips query strings and fragments when deriving the object key", () => {
    expect(
      getCvObjectKeyFromPublicUrl(`${TAILORED_URL}?download=1#section`),
    ).toBe(`cvs/${USER_ID}/tailored/key123.pdf`);
    expect(
      toCanonicalCvPublicUrl(`${TAILORED_URL}?download=1#section`),
    ).toBe(TAILORED_URL);
  });

  it("rebuilds a canonical URL with per-segment encoding", () => {
    expect(toCanonicalCvPublicUrl(TAILORED_ENCODED_URL)).toBe(
      `https://r2.example.com/cvs/${USER_ID}/tailored/key/123.pdf`,
    );
    expect(toCanonicalCvPublicUrl(TAILORED_URL)).toBe(TAILORED_URL);

    const reserved = `https://r2.example.com/cvs/${USER_ID}/tailored/file%3Fname%23v1.pdf`;
    expect(getCvObjectKeyFromPublicUrl(reserved)).toBe(
      `cvs/${USER_ID}/tailored/file?name#v1.pdf`,
    );
    expect(toCanonicalCvPublicUrl(reserved)).toBe(reserved);
  });

  it("rejects path traversal that would escape the tailored prefix", () => {
    const traversal = `https://r2.example.com/cvs/${USER_ID}/tailored/../primary/cv-1.pdf`;
    // URL parser resolves `..`; resulting key is primary — not accepted as tailored.
    expect(getCvObjectKeyFromPublicUrl(traversal)).toBe(
      `cvs/${USER_ID}/primary/cv-1.pdf`,
    );
    expect(isOwnedTailoredCvUrl(traversal, USER_ID)).toBe(false);
    expect(isOwnedPrimaryCvObjectKey(getCvObjectKeyFromPublicUrl(traversal), USER_ID)).toBe(
      true,
    );

    const encodedTraversal = `https://r2.example.com/cvs/${USER_ID}/tailored/%2e%2e/primary/cv-1.pdf`;
    expect(isOwnedTailoredCvUrl(encodedTraversal, USER_ID)).toBe(false);
  });

  it("returns null when R2 public base is unset", () => {
    vi.mocked(getR2PublicBaseUrl).mockImplementation(() => {
      throw new Error("Missing R2_PUBLIC_BASE_URL");
    });
    expect(getCvObjectKeyFromPublicUrl(TAILORED_URL)).toBeNull();
    expect(toCanonicalCvPublicUrl(TAILORED_URL)).toBeNull();
  });
});

describe("isOwnedCvUrl / isOwnedTailoredCvUrl / isCvStorageUrl", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getR2PublicBaseUrl).mockReturnValue("https://r2.example.com");
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

describe("deleteCvIfOurs / deleteApplicationCvIfTailored", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getR2PublicBaseUrl).mockReturnValue("https://r2.example.com");
  });

  it("rethrows R2 errors by default (fail closed)", async () => {
    const send = vi.fn().mockRejectedValue(new Error("R2 down"));
    vi.mocked(getR2S3Client).mockReturnValue({ send } as never);

    await expect(deleteCvIfOurs(TAILORED_URL, USER_ID)).rejects.toThrow(
      "R2 down",
    );
  });

  it("swallows R2 errors when onError is log", async () => {
    const send = vi.fn().mockRejectedValue(new Error("R2 down"));
    vi.mocked(getR2S3Client).mockReturnValue({ send } as never);

    await expect(
      deleteCvIfOurs(TAILORED_URL, USER_ID, { onError: "log" }),
    ).resolves.toBeUndefined();
  });

  it("skips R2 for primary application CVs (allow-list)", async () => {
    const send = vi.fn();
    vi.mocked(getR2S3Client).mockReturnValue({ send } as never);

    await deleteApplicationCvIfTailored(PRIMARY_URL, "primary", USER_ID);
    expect(send).not.toHaveBeenCalled();
  });

  it("skips R2 when cv_type is missing even if the URL looks tailored", async () => {
    const send = vi.fn();
    vi.mocked(getR2S3Client).mockReturnValue({ send } as never);

    await deleteApplicationCvIfTailored(TAILORED_URL, null, USER_ID);
    expect(send).not.toHaveBeenCalled();
  });

  it("does not delete a primary library object when cv_type is wrongly tailored", async () => {
    const send = vi.fn();
    vi.mocked(getR2S3Client).mockReturnValue({ send } as never);

    await deleteApplicationCvIfTailored(PRIMARY_URL, "tailored", USER_ID);
    expect(send).not.toHaveBeenCalled();
  });

  it("deletes only when cv_type is tailored and the key is under tailored/", async () => {
    const send = vi.fn().mockResolvedValue({});
    vi.mocked(getR2S3Client).mockReturnValue({ send } as never);

    await deleteApplicationCvIfTailored(TAILORED_URL, "tailored", USER_ID);
    expect(send).toHaveBeenCalled();
  });

  it("throws when R2_PUBLIC_BASE_URL is unset and a tailored URL needs cleanup", async () => {
    vi.mocked(getR2PublicBaseUrl).mockImplementation(() => {
      throw new Error("Missing R2_PUBLIC_BASE_URL");
    });
    const send = vi.fn();
    vi.mocked(getR2S3Client).mockReturnValue({ send } as never);

    await expect(
      deleteApplicationCvIfTailored(TAILORED_URL, "tailored", USER_ID),
    ).rejects.toThrow("Missing R2_PUBLIC_BASE_URL");
    expect(send).not.toHaveBeenCalled();
  });

  it("throws when R2_PUBLIC_BASE_URL is unset for deleteCvIfOurs with a URL", async () => {
    vi.mocked(getR2PublicBaseUrl).mockImplementation(() => {
      throw new Error("Missing R2_PUBLIC_BASE_URL");
    });

    await expect(deleteCvIfOurs(PRIMARY_URL, USER_ID)).rejects.toThrow(
      "Missing R2_PUBLIC_BASE_URL",
    );
  });
});

describe("checkCvObjectExists", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getR2PublicBaseUrl).mockReturnValue("https://r2.example.com");
  });

  it("returns true when HeadObject succeeds for an R2 URL", async () => {
    const send = vi.fn().mockResolvedValue({});
    vi.mocked(getR2S3Client).mockReturnValue({ send } as never);

    await expect(checkCvObjectExists(TAILORED_URL)).resolves.toBe(true);
    expect(send).toHaveBeenCalledWith(expect.any(HeadObjectCommand));
  });

  it("returns false when HeadObject reports NotFound for an R2 URL", async () => {
    const send = vi
      .fn()
      .mockRejectedValue({ name: "NotFound", $metadata: { httpStatusCode: 404 } });
    vi.mocked(getR2S3Client).mockReturnValue({ send } as never);

    await expect(checkCvObjectExists(TAILORED_URL)).resolves.toBe(false);
  });

  it("returns undefined when HeadObject fails for reasons other than NotFound", async () => {
    const send = vi.fn().mockRejectedValue(new Error("network timeout"));
    vi.mocked(getR2S3Client).mockReturnValue({ send } as never);

    await expect(checkCvObjectExists(TAILORED_URL)).resolves.toBeUndefined();
  });

  it("returns undefined for URLs outside our R2 public base", async () => {
    const send = vi.fn();
    vi.mocked(getR2S3Client).mockReturnValue({ send } as never);

    await expect(
      checkCvObjectExists("https://evil.example/cv.pdf"),
    ).resolves.toBeUndefined();
    expect(send).not.toHaveBeenCalled();
  });

  it("returns undefined for empty or invalid input", async () => {
    await expect(checkCvObjectExists(null)).resolves.toBeUndefined();
    await expect(checkCvObjectExists("")).resolves.toBeUndefined();
    await expect(checkCvObjectExists(undefined)).resolves.toBeUndefined();
  });
});
