import { describe, it, expect } from "vitest";
import {
  generatePublicId,
  isValidPublicId,
  PUBLIC_ID_LENGTH,
} from "@/lib/utils/public-id";

describe("generatePublicId", () => {
  it("returns a string of the default length", () => {
    const id = generatePublicId();
    expect(id).toHaveLength(PUBLIC_ID_LENGTH);
    expect(isValidPublicId(id)).toBe(true);
  });

  it("generates distinct values", () => {
    const a = generatePublicId();
    const b = generatePublicId();
    expect(a).not.toBe(b);
  });
});

describe("isValidPublicId", () => {
  it("accepts lowercase alphanumeric ids", () => {
    expect(isValidPublicId("k7x2m9ab")).toBe(true);
  });

  it("rejects uppercase and symbols", () => {
    expect(isValidPublicId("K7X2M9AB")).toBe(false);
    expect(isValidPublicId("bad-id!")).toBe(false);
  });
});
