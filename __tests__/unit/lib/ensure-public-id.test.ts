/**
 * Unit tests for ensureProfilePublicId / resolvePublicIdReadOnly validation
 * and repair of invalid stored public ids.
 */
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  makeSupabaseClient,
  ok,
} from "../../helpers/supabase-mock";
import {
  ensureProfilePublicId,
  resolvePublicIdReadOnly,
} from "@/lib/auth/ensure-public-id";

describe("resolvePublicIdReadOnly", () => {
  it("returns a valid profiles.public_id", async () => {
    const client = makeSupabaseClient([ok({ public_id: "k7x2m9ab" })]);
    const id = await resolvePublicIdReadOnly(client as never, { id: "u1" });
    expect(id).toBe("k7x2m9ab");
  });

  it("ignores an invalid profiles.public_id and falls back to metadata", async () => {
    const client = makeSupabaseClient([ok({ public_id: "BAD!" })]);
    const id = await resolvePublicIdReadOnly(client as never, {
      id: "u1",
      user_metadata: { public_id: "k7x2m9ab" },
    });
    expect(id).toBe("k7x2m9ab");
  });

  it("returns null when both profile and metadata are invalid/missing", async () => {
    const client = makeSupabaseClient([ok({ public_id: "BAD!" })]);
    const id = await resolvePublicIdReadOnly(client as never, {
      id: "u1",
      user_metadata: { public_id: "also-bad" },
    });
    expect(id).toBeNull();
  });
});

describe("ensureProfilePublicId", () => {
  const mockUpdateUser = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockUpdateUser.mockResolvedValue({ data: { user: {} }, error: null });
  });

  function clientWithAuth(chains: ReturnType<typeof ok>[]) {
    const base = makeSupabaseClient(chains);
    return {
      ...base,
      auth: {
        ...base.auth,
        updateUser: mockUpdateUser,
      },
    };
  }

  it("returns a valid existing public_id and syncs Auth when metadata differs", async () => {
    const client = clientWithAuth([ok({ public_id: "k7x2m9ab" })]);

    const id = await ensureProfilePublicId(client as never, {
      id: "u1",
      user_metadata: { public_id: "otherid1" },
    });

    expect(id).toBe("k7x2m9ab");
    expect(mockUpdateUser).toHaveBeenCalledWith({
      data: { public_id: "k7x2m9ab" },
    });
  });

  it("does not sync Auth when metadata already matches a valid profile id", async () => {
    const client = clientWithAuth([ok({ public_id: "k7x2m9ab" })]);

    const id = await ensureProfilePublicId(client as never, {
      id: "u1",
      user_metadata: { public_id: "k7x2m9ab" },
    });

    expect(id).toBe("k7x2m9ab");
    expect(mockUpdateUser).not.toHaveBeenCalled();
  });

  it("repairs an invalid existing public_id instead of syncing it to Auth", async () => {
    const client = clientWithAuth([
      ok({ public_id: "BAD!" }),
      ok({ public_id: "fixed001" }), // conditional update
    ]);

    const id = await ensureProfilePublicId(client as never, {
      id: "u1",
      user_metadata: {
        first_name: "Jane",
        last_name: "Doe",
        public_id: "fixed001",
      },
    });

    expect(id).toBe("fixed001");
    expect(mockUpdateUser).not.toHaveBeenCalled(); // meta already matches
  });

  it("creates a profiles row when none exists", async () => {
    const client = clientWithAuth([
      ok(null),
      ok(null), // upsert
    ]);

    const id = await ensureProfilePublicId(client as never, {
      id: "u1",
      user_metadata: {
        first_name: "Jane",
        last_name: "Doe",
        public_id: "k7x2m9ab",
      },
    });

    expect(id).toBe("k7x2m9ab");
    expect(mockUpdateUser).not.toHaveBeenCalled();
  });
});
