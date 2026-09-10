import { NextResponse } from "next/server";

/** Successful `withAuth()` result for API route unit tests. */
export function authOk<T extends { id: string }>(user: T) {
  return { ok: true as const, user };
}

/** Missing-session `withAuth()` result (**401**). */
export function authUnauthorized() {
  return {
    ok: false as const,
    response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
  };
}
