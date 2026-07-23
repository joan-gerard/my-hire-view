/**
 * Unit tests for profile ensure helpers used by signup and auth callback.
 */
import { describe, it, expect, vi } from "vitest";
import {
  ensureProfileWithNames,
  namesFromUserMetadata,
} from "@/lib/auth/ensure-profile";

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

describe("ensureProfileWithNames", () => {
  it("upserts profiles and returns no error on success", async () => {
    const upsert = vi.fn().mockResolvedValue({ error: null });
    const supabase = { from: vi.fn().mockReturnValue({ upsert }) };

    const result = await ensureProfileWithNames(supabase, "user-1", {
      first_name: "Jane",
      last_name: "Doe",
    });

    expect(result.error).toBeNull();
    expect(supabase.from).toHaveBeenCalledWith("profiles");
    expect(upsert).toHaveBeenCalledWith(
      {
        user_id: "user-1",
        first_name: "Jane",
        last_name: "Doe",
      },
      { onConflict: "user_id" },
    );
  });

  it("returns the DB error message on failure", async () => {
    const supabase = {
      from: vi.fn().mockReturnValue({
        upsert: vi.fn().mockResolvedValue({ error: { message: "boom" } }),
      }),
    };

    const result = await ensureProfileWithNames(supabase, "user-1", {
      first_name: "Jane",
      last_name: "Doe",
    });

    expect(result.error).toBe("boom");
  });
});
