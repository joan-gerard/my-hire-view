import { describe, it, expect, vi, beforeEach } from "vitest";
import { makeSupabaseClient, ok, dbError } from "../../../helpers/supabase-mock";

const { mockCreateAdminClient } = vi.hoisted(() => ({
  mockCreateAdminClient: vi.fn(),
}));

vi.mock("@/lib/supabase/admin", () => ({
  createAdminClient: mockCreateAdminClient,
}));

import { resolvePublicApplication } from "@/lib/utils/resolve-public-application";

const PUBLIC_ID = "k7x2m9ab";
const SLUG = "volvo-engineer";
const OWNER_USER_ID = "owner-user-id";

beforeEach(() => {
  vi.clearAllMocks();
});

describe("resolvePublicApplication", () => {
  it("returns null without DB queries when publicId format is invalid", async () => {
    const adminFrom = vi.fn();
    mockCreateAdminClient.mockReturnValue({ from: adminFrom });

    const result = await resolvePublicApplication("BAD-ID!", SLUG);

    expect(result).toBeNull();
    expect(mockCreateAdminClient).not.toHaveBeenCalled();
    expect(adminFrom).not.toHaveBeenCalled();
  });

  it("returns null without DB queries when slug format is invalid", async () => {
    const adminFrom = vi.fn();
    mockCreateAdminClient.mockReturnValue({ from: adminFrom });

    const result = await resolvePublicApplication(PUBLIC_ID, "Volvo Engineer");

    expect(result).toBeNull();
    expect(mockCreateAdminClient).not.toHaveBeenCalled();
    expect(adminFrom).not.toHaveBeenCalled();
  });

  it("returns null without DB queries when slug is empty/whitespace", async () => {
    const adminFrom = vi.fn();
    mockCreateAdminClient.mockReturnValue({ from: adminFrom });

    const result = await resolvePublicApplication(PUBLIC_ID, "   ");

    expect(result).toBeNull();
    expect(mockCreateAdminClient).not.toHaveBeenCalled();
  });

  it("resolves an active application via service-role client when publicId and slug are valid", async () => {
    const application = {
      id: "app-1",
      slug: SLUG,
      user_id: OWNER_USER_ID,
      company: "Volvo",
      role: "Engineer",
      status: "active",
      show_profile_picture: false,
    };
    const admin = makeSupabaseClient([
      ok({
        user_id: OWNER_USER_ID,
        profile_picture_url: null,
        updated_at: "2026-01-01T00:00:00Z",
      }),
      ok(application),
    ]);
    mockCreateAdminClient.mockReturnValue(admin);

    const result = await resolvePublicApplication(PUBLIC_ID, SLUG);

    expect(result).toEqual({
      application: { ...application, profile_picture_url: null },
      ownerUserId: OWNER_USER_ID,
    });
    expect(admin.from).toHaveBeenCalledWith("profiles");
    expect(admin.from).toHaveBeenCalledWith("applications");
  });

  it("returns null when the profile row is missing", async () => {
    const admin = makeSupabaseClient([ok(null)]);
    mockCreateAdminClient.mockReturnValue(admin);

    const result = await resolvePublicApplication(PUBLIC_ID, SLUG);

    expect(result).toBeNull();
    expect(admin.from).toHaveBeenCalledTimes(1);
  });

  it("returns null when the application row is missing", async () => {
    const admin = makeSupabaseClient([
      ok({
        user_id: OWNER_USER_ID,
        profile_picture_url: null,
        updated_at: "2026-01-01T00:00:00Z",
      }),
      ok(null),
    ]);
    mockCreateAdminClient.mockReturnValue(admin);

    const result = await resolvePublicApplication(PUBLIC_ID, SLUG);

    expect(result).toBeNull();
    expect(admin.from).toHaveBeenCalledTimes(2);
  });

  it("throws when the profile query fails", async () => {
    const admin = makeSupabaseClient([dbError("connection refused")]);
    mockCreateAdminClient.mockReturnValue(admin);

    await expect(resolvePublicApplication(PUBLIC_ID, SLUG)).rejects.toEqual({
      message: "connection refused",
    });
  });

  it("throws when the application query fails", async () => {
    const admin = makeSupabaseClient([
      ok({
        user_id: OWNER_USER_ID,
        profile_picture_url: null,
        updated_at: "2026-01-01T00:00:00Z",
      }),
      dbError("timeout"),
    ]);
    mockCreateAdminClient.mockReturnValue(admin);

    await expect(resolvePublicApplication(PUBLIC_ID, SLUG)).rejects.toEqual({
      message: "timeout",
    });
  });
});
