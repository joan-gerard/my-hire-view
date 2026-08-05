import { describe, it, expect, vi, beforeEach } from "vitest";
import type { SupabaseClient } from "@supabase/supabase-js";
import { makeSupabaseClient, ok } from "../../../helpers/supabase-mock";

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

/** `makeSupabaseClient` is a partial mock; cast for helpers that take `SupabaseClient`. */
function asClient(
  client: ReturnType<typeof makeSupabaseClient>,
): SupabaseClient {
  return client as unknown as SupabaseClient;
}

function unusedClient(): SupabaseClient {
  return { from: vi.fn() } as unknown as SupabaseClient;
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("resolvePublicApplication", () => {
  it("returns null without DB queries when publicId format is invalid", async () => {
    const supabase = unusedClient();
    const adminFrom = vi.fn();
    mockCreateAdminClient.mockReturnValue({ from: adminFrom });

    const result = await resolvePublicApplication(
      supabase,
      "BAD-ID!",
      SLUG,
    );

    expect(result).toBeNull();
    expect(mockCreateAdminClient).not.toHaveBeenCalled();
    expect(adminFrom).not.toHaveBeenCalled();
    expect(supabase.from).not.toHaveBeenCalled();
  });

  it("returns null without DB queries when slug format is invalid", async () => {
    const supabase = unusedClient();
    const adminFrom = vi.fn();
    mockCreateAdminClient.mockReturnValue({ from: adminFrom });

    const result = await resolvePublicApplication(
      supabase,
      PUBLIC_ID,
      "Volvo Engineer",
    );

    expect(result).toBeNull();
    expect(mockCreateAdminClient).not.toHaveBeenCalled();
    expect(adminFrom).not.toHaveBeenCalled();
    expect(supabase.from).not.toHaveBeenCalled();
  });

  it("returns null without DB queries when slug is empty/whitespace", async () => {
    const supabase = unusedClient();
    const adminFrom = vi.fn();
    mockCreateAdminClient.mockReturnValue({ from: adminFrom });

    const result = await resolvePublicApplication(supabase, PUBLIC_ID, "   ");

    expect(result).toBeNull();
    expect(mockCreateAdminClient).not.toHaveBeenCalled();
    expect(supabase.from).not.toHaveBeenCalled();
  });

  it("resolves an active application when publicId and slug are valid", async () => {
    const profileChain = ok({
      user_id: OWNER_USER_ID,
      profile_picture_url: null,
      updated_at: "2026-01-01T00:00:00Z",
    });
    const adminFrom = vi.fn().mockReturnValue(profileChain);
    mockCreateAdminClient.mockReturnValue({ from: adminFrom });

    const application = {
      id: "app-1",
      slug: SLUG,
      user_id: OWNER_USER_ID,
      company: "Volvo",
      role: "Engineer",
      status: "active",
      show_profile_picture: false,
    };
    const supabase = asClient(makeSupabaseClient([ok(application)]));

    const result = await resolvePublicApplication(supabase, PUBLIC_ID, SLUG);

    expect(result).toEqual({
      application: { ...application, profile_picture_url: null },
      ownerUserId: OWNER_USER_ID,
    });
    expect(adminFrom).toHaveBeenCalledWith("profiles");
    expect(supabase.from).toHaveBeenCalledWith("applications");
  });
});
