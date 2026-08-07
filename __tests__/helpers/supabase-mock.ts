/**
 * Factory helpers for building Supabase fluent query-chain mocks.
 *
 * The Supabase client uses a builder pattern:
 *   supabase.from("table").select("*").eq("col", val).single()
 *
 * Each helper produces a plain object whose methods all return `this` so they
 * can be chained, and whose terminal methods (single, order-without-single,
 * rpc) resolve to the provided value.
 */
import { vi } from "vitest";

export type DbResult<T = unknown> = {
  data: T;
  error: null | { message: string; code?: string };
  count?: number | null;
};

/**
 * Creates a chainable mock builder that resolves to `result` when awaited
 * (via `.single()`) or when the chain itself is awaited directly.
 */
export function makeChain<T = unknown>(result: DbResult<T>) {
  const self: Record<string, unknown> = {
    select: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    upsert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    neq: vi.fn().mockReturnThis(),
    is: vi.fn().mockReturnThis(),
    gt: vi.fn().mockReturnThis(),
    gte: vi.fn().mockReturnThis(),
    lt: vi.fn().mockReturnThis(),
    lte: vi.fn().mockReturnThis(),
    or: vi.fn().mockReturnThis(),
    ilike: vi.fn().mockReturnThis(),
    range: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue(result),
    maybeSingle: vi.fn().mockResolvedValue(result),
    rpc: vi.fn().mockResolvedValue(result),
    // Make the chain itself awaitable for cases like `await supabase.from(...).update(...).eq(...)`
    then: (resolve: (v: DbResult<T>) => unknown) =>
      Promise.resolve(result).then(resolve),
    catch: (reject: (e: unknown) => unknown) =>
      Promise.resolve(result).catch(reject),
    finally: (fin: (() => void) | undefined) =>
      Promise.resolve(result).finally(fin),
  };
  // All chained methods return `self` so callers can do .eq().eq().single()
  (self.select as ReturnType<typeof vi.fn>).mockReturnValue(self);
  (self.insert as ReturnType<typeof vi.fn>).mockReturnValue(self);
  (self.upsert as ReturnType<typeof vi.fn>).mockReturnValue(self);
  (self.update as ReturnType<typeof vi.fn>).mockReturnValue(self);
  (self.delete as ReturnType<typeof vi.fn>).mockReturnValue(self);
  (self.eq as ReturnType<typeof vi.fn>).mockReturnValue(self);
  (self.neq as ReturnType<typeof vi.fn>).mockReturnValue(self);
  (self.is as ReturnType<typeof vi.fn>).mockReturnValue(self);
  (self.gt as ReturnType<typeof vi.fn>).mockReturnValue(self);
  (self.gte as ReturnType<typeof vi.fn>).mockReturnValue(self);
  (self.lt as ReturnType<typeof vi.fn>).mockReturnValue(self);
  (self.lte as ReturnType<typeof vi.fn>).mockReturnValue(self);
  (self.or as ReturnType<typeof vi.fn>).mockReturnValue(self);
  (self.ilike as ReturnType<typeof vi.fn>).mockReturnValue(self);
  (self.range as ReturnType<typeof vi.fn>).mockReturnValue(self);
  (self.limit as ReturnType<typeof vi.fn>).mockReturnValue(self);
  (self.order as ReturnType<typeof vi.fn>).mockReturnValue(self);
  return self;
}

/** Shorthand: chain that resolves successfully with `data`. */
export function ok<T>(data: T) {
  return makeChain<T>({ data, error: null });
}

/** Shorthand: list/query chain that also returns a `count` (for `{ count: "exact" }`). */
export function okWithCount<T>(data: T, count: number) {
  return makeChain<T>({ data, error: null, count });
}

/** Shorthand: chain that resolves with a DB error. */
export function dbError(message: string, code?: string) {
  return makeChain({ data: null, error: { message, code } });
}

/**
 * Creates a mock Supabase client whose `.from()` returns chains in order.
 * Each call to `.from()` consumes the next chain in `chains`.
 * The last chain is reused for any additional calls.
 */
export function makeSupabaseClient(
  chains: ReturnType<typeof makeChain>[],
  authUser: { id: string } | null = null,
) {
  const mockFrom = vi.fn();
  for (let i = 0; i < chains.length - 1; i++) {
    mockFrom.mockReturnValueOnce(chains[i]);
  }
  mockFrom.mockReturnValue(chains[chains.length - 1]);

  return {
    from: mockFrom,
    auth: {
      getUser: vi.fn().mockResolvedValue({ data: { user: authUser } }),
      updateUser: vi.fn().mockResolvedValue({ data: { user: authUser }, error: null }),
    },
    rpc: vi.fn().mockResolvedValue({ data: null, error: null }),
  };
}
