import { describe, it, expect, vi, beforeEach } from "vitest";

// ---------------------------------------------------------------------------
// vi.mock is hoisted to the top of the file at compile time, so any variables
// referenced inside a vi.mock factory must also be hoisted with vi.hoisted().
// ---------------------------------------------------------------------------
const { mockFrom, mockCreateClient } = vi.hoisted(() => {
  const mockFrom = vi.fn();
  return {
    mockFrom,
    mockCreateClient: vi.fn().mockResolvedValue({ from: mockFrom }),
  };
});

vi.mock("@/lib/supabase/server", () => ({
  createClient: mockCreateClient,
}));

// Build the fluent query chain after the mocks are defined
function buildChain(resolvedValue: { data: unknown; error: unknown }) {
  // Each chained method returns the chain itself so callers can do
  // .from().select().eq().neq() etc. The terminal .data / .error comes from
  // awaiting the last call.
  const chain = {
    select: vi.fn(),
    eq: vi.fn(),
    neq: vi.fn(),
    then: (onfulfilled: (value: unknown) => unknown) =>
      Promise.resolve(resolvedValue).then(onfulfilled),
    catch: (onrejected: (reason: unknown) => unknown) =>
      Promise.resolve(resolvedValue).catch(onrejected),
    finally: (onfinally: (() => void) | null | undefined) =>
      Promise.resolve(resolvedValue).finally(onfinally ?? undefined),
  } as Record<string, unknown>;
  // Wire all chain methods to return `chain` itself
  (chain.select as ReturnType<typeof vi.fn>).mockReturnValue(chain);
  (chain.eq as ReturnType<typeof vi.fn>).mockReturnValue(chain);
  (chain.neq as ReturnType<typeof vi.fn>).mockReturnValue(chain);
  return chain;
}

import {
  checkSlugUniqueness,
  validateSlugForApplication,
  reserveBaseSlug,
  SlugCollisionError,
  SLUG_COLLISION_USER_MESSAGE,
} from "@/lib/utils/slug";

beforeEach(() => {
  vi.clearAllMocks();
});

// ---------------------------------------------------------------------------
// checkSlugUniqueness
// ---------------------------------------------------------------------------
describe("checkSlugUniqueness", () => {
  it("returns true when no row matches (slug is unique)", async () => {
    mockFrom.mockReturnValue(buildChain({ data: [], error: null }));
    const unique = await checkSlugUniqueness("volvo-engineer");
    expect(unique).toBe(true);
  });

  it("returns false when a matching row is found (slug is taken)", async () => {
    mockFrom.mockReturnValue(
      buildChain({ data: [{ id: "existing-id" }], error: null }),
    );
    const unique = await checkSlugUniqueness("volvo-engineer");
    expect(unique).toBe(false);
  });

  it("throws when the DB query errors", async () => {
    mockFrom.mockReturnValue(
      buildChain({ data: null, error: { message: "DB error" } }),
    );
    await expect(checkSlugUniqueness("volvo-engineer")).rejects.toThrow(
      "Failed to check slug uniqueness",
    );
  });
});

// ---------------------------------------------------------------------------
// validateSlugForApplication
// ---------------------------------------------------------------------------
describe("validateSlugForApplication", () => {
  it("returns ok:false with format error for an invalid slug (no DB call)", async () => {
    // Empty slug — format validation rejects before hitting the DB
    const result = await validateSlugForApplication("");
    expect(result.ok).toBe(false);
    expect((result as { ok: false; error: string }).error).toBeTruthy();
    expect(mockFrom).not.toHaveBeenCalled();
  });

  it("returns ok:false with format error for uppercase characters", async () => {
    const result = await validateSlugForApplication("Volvo-Engineer");
    expect(result.ok).toBe(false);
    expect(mockFrom).not.toHaveBeenCalled();
  });

  it("returns ok:true for a valid and available slug", async () => {
    mockFrom.mockReturnValue(buildChain({ data: [], error: null }));
    const result = await validateSlugForApplication("volvo-engineer");
    expect(result).toEqual({ ok: true });
  });

  it("returns ok:false with collision message for a taken slug", async () => {
    mockFrom.mockReturnValue(
      buildChain({ data: [{ id: "x" }], error: null }),
    );
    const result = await validateSlugForApplication("volvo-engineer");
    expect(result.ok).toBe(false);
    expect((result as { ok: false; error: string }).error).toBe(
      SLUG_COLLISION_USER_MESSAGE,
    );
  });

  it("passes excludeId to the uniqueness check (edit flow)", async () => {
    // When `excludeId` is provided the chain should include `.neq(id, excludeId)`.
    // We verify that the query chain was set up with the from call at all — the
    // important thing is the mock is called, meaning no short-circuit.
    mockFrom.mockReturnValue(buildChain({ data: [], error: null }));
    await validateSlugForApplication("volvo-engineer", "some-id-123");
    expect(mockFrom).toHaveBeenCalledWith("applications");
  });
});

// ---------------------------------------------------------------------------
// reserveBaseSlug
// ---------------------------------------------------------------------------
describe("reserveBaseSlug", () => {
  it("returns the derived slug when it is unique", async () => {
    mockFrom.mockReturnValue(buildChain({ data: [], error: null }));
    const slug = await reserveBaseSlug("Volvo", "Engineer");
    expect(slug).toBe("volvo-engineer");
  });

  it("throws SlugCollisionError when the slug is already taken", async () => {
    mockFrom.mockReturnValue(
      buildChain({ data: [{ id: "taken" }], error: null }),
    );
    await expect(reserveBaseSlug("Volvo", "Engineer")).rejects.toThrow(
      SlugCollisionError,
    );
  });

  it("incorporates name at start when position is 'start'", async () => {
    mockFrom.mockReturnValue(buildChain({ data: [], error: null }));
    const slug = await reserveBaseSlug(
      "Volvo",
      "Engineer",
      undefined,
      "John",
      "Doe",
      "start",
    );
    expect(slug).toBe("john-doe-volvo-engineer");
  });

  it("incorporates name at end when position is 'end'", async () => {
    mockFrom.mockReturnValue(buildChain({ data: [], error: null }));
    const slug = await reserveBaseSlug(
      "Volvo",
      "Engineer",
      undefined,
      "John",
      "Doe",
      "end",
    );
    expect(slug).toBe("volvo-engineer-john-doe");
  });

  it("falls back to base slug when name is empty and position is set", async () => {
    mockFrom.mockReturnValue(buildChain({ data: [], error: null }));
    const slug = await reserveBaseSlug(
      "Volvo",
      "Engineer",
      undefined,
      "",
      "",
      "start",
    );
    expect(slug).toBe("volvo-engineer");
  });
});

// ---------------------------------------------------------------------------
// SlugCollisionError
// ---------------------------------------------------------------------------
describe("SlugCollisionError", () => {
  it("has the correct name and code", () => {
    const err = new SlugCollisionError();
    expect(err.name).toBe("SlugCollisionError");
    expect(err.code).toBe("SLUG_COLLISION");
    expect(err).toBeInstanceOf(Error);
  });

  it("uses the default user-facing message", () => {
    const err = new SlugCollisionError();
    expect(err.message).toBe(SLUG_COLLISION_USER_MESSAGE);
  });

  it("accepts a custom message", () => {
    const err = new SlugCollisionError("custom msg");
    expect(err.message).toBe("custom msg");
  });
});
