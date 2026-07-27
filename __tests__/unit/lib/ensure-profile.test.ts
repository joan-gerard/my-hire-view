/**
 * Unit tests for Auth user_metadata name helpers.
 */
import { describe, it, expect } from "vitest";
import { namesFromUserMetadata } from "@/lib/auth/ensure-profile";

describe("namesFromUserMetadata", () => {
  it("returns trimmed names when both are present", () => {
    expect(
      namesFromUserMetadata({
        id: "u1",
        user_metadata: { first_name: "  Jane ", last_name: " Doe" },
      }),
    ).toEqual({ first_name: "Jane", last_name: "Doe" });
  });

  it("returns null when either name is missing", () => {
    expect(
      namesFromUserMetadata({
        id: "u1",
        user_metadata: { first_name: "Jane" },
      }),
    ).toBeNull();
    expect(namesFromUserMetadata({ id: "u1", user_metadata: {} })).toBeNull();
  });
});
