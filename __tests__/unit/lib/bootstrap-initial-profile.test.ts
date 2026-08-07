/**
 * Unit tests for bootstrapInitialProfile and publicIdFromUserMetadata validation.
 */
import { beforeEach, describe, expect, it, vi } from "vitest";

const { mockCreateInitialProfile } = vi.hoisted(() => ({
  mockCreateInitialProfile: vi.fn(),
}));

vi.mock("@/lib/auth/create-initial-profile", () => ({
  createInitialProfile: mockCreateInitialProfile,
}));

import { bootstrapInitialProfile } from "@/lib/auth/bootstrap-initial-profile";
import { publicIdFromUserMetadata } from "@/lib/auth/ensure-public-id";

beforeEach(() => {
  vi.clearAllMocks();
  mockCreateInitialProfile.mockResolvedValue({ error: null });
});

describe("publicIdFromUserMetadata", () => {
  it("returns a valid trimmed public_id", () => {
    expect(
      publicIdFromUserMetadata({
        id: "u1",
        user_metadata: { public_id: "  k7x2m9ab  " },
      }),
    ).toBe("k7x2m9ab");
  });

  it("returns null for missing, empty, or invalid values", () => {
    expect(publicIdFromUserMetadata({ id: "u1", user_metadata: {} })).toBeNull();
    expect(
      publicIdFromUserMetadata({
        id: "u1",
        user_metadata: { public_id: "   " },
      }),
    ).toBeNull();
    expect(
      publicIdFromUserMetadata({
        id: "u1",
        user_metadata: { public_id: "BAD-ID!" },
      }),
    ).toBeNull();
    expect(
      publicIdFromUserMetadata({
        id: "u1",
        user_metadata: { public_id: "K7X2M9AB" },
      }),
    ).toBeNull();
  });
});

describe("bootstrapInitialProfile", () => {
  it("creates a profile from Auth metadata", async () => {
    const result = await bootstrapInitialProfile({
      id: "user-1",
      user_metadata: {
        first_name: "Jane",
        last_name: "Doe",
        public_id: "k7x2m9ab",
      },
    });

    expect(result).toEqual({ error: null });
    expect(mockCreateInitialProfile).toHaveBeenCalledWith({
      userId: "user-1",
      first_name: "Jane",
      last_name: "Doe",
      public_id: "k7x2m9ab",
    });
  });

  it("generates a public_id when metadata is missing or invalid", async () => {
    await bootstrapInitialProfile({
      id: "user-1",
      user_metadata: {
        first_name: "Jane",
        last_name: "Doe",
        public_id: "not valid",
      },
    });

    expect(mockCreateInitialProfile).toHaveBeenCalledWith({
      userId: "user-1",
      first_name: "Jane",
      last_name: "Doe",
      public_id: expect.stringMatching(/^[a-z0-9]{8}$/),
    });
  });

  it("returns an error when names are missing", async () => {
    const result = await bootstrapInitialProfile({
      id: "user-1",
      user_metadata: { public_id: "k7x2m9ab" },
    });

    expect(result.error).toContain("first/last name");
    expect(mockCreateInitialProfile).not.toHaveBeenCalled();
  });
});
