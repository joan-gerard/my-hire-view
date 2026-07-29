# Testing

> Last updated: May 4, 2026

---

## Setup

**Framework:** [Vitest](https://vitest.dev/) — fast, native TypeScript, no Babel overhead.

**Configuration:** `vitest.config.ts` at the project root. The `@/` path alias is resolved natively via `resolve.alias`.

**Scripts:**

| Command | Use |
|---------|-----|
| `pnpm test` | Interactive watch mode (development) |
| `pnpm test:ci` | Single run — no watch, exits with code 1 on failure (used in CI and pre-merge checks) |

---

## Structure

```
__tests__/
  helpers/
    supabase-mock.ts     — reusable Supabase fluent-chain mock factory
  unit/
    lib/
      utils/
        slug-generate.test.ts
        slug.test.ts
      rate-limit.test.ts
    api/
      profile.test.ts
      slug.test.ts
      applications-create.test.ts
      applications-edit.test.ts
      applications-list.test.ts
      applications-public-view.test.ts
```

---

## Test files

| File | What it covers |
|------|---------------|
| `__tests__/unit/lib/utils/slug-generate.test.ts` | **Pure slug utilities** — `validateSlugFormat` (empty input, too long, invalid chars, valid slugs), `generateSlug` (normalisation, special-char stripping, space collapsing), `buildSlug` (position `start`/`end`, partial and missing names) |
| `__tests__/unit/lib/utils/slug.test.ts` | **Server-side slug helpers** — `checkSlugUniqueness` (unique, taken, DB error), `validateSlugForApplication` (format short-circuits DB call, available, taken), `reserveBaseSlug` (name positions, collision throws `SlugCollisionError`), `SlugCollisionError` (shape and default message) |
| `__tests__/unit/lib/rate-limit.test.ts` | **In-memory rate limiter** — `getClientIdentifier` (x-forwarded-for, x-real-ip, fallback to "unknown"), `rateLimit` (counting, window reset via fake timers, per-client isolation), `checkRateLimit`, `rateLimit429` (429 status + Retry-After ≥ 1s) |
| `__tests__/unit/api/profile.test.ts` | **Flow #3 — Profile read and update** — `GET /api/profile`: existing profile, missing row → 404 (`PGRST116`), DB error → 500, unexpected throw after auth → 500, rate limit → 429, 401. `PUT /api/profile`: success, invalid portfolio URL → 400, invalid LinkedIn URL → 400, upsert failure → 400, rate limit → 429, 401, profile picture deletion triggered when URL changes |
| `__tests__/unit/api/slug.test.ts` | **Flow #4 — Live slug feedback** — `POST /api/slug`: derived slug available → 200, name-in-URL variants, missing company/role → 400, `SlugCollisionError` → 409, unexpected error → 500, rate limit → 429. `POST /api/slug/validate`: valid + available → `{ok:true}`, invalid format → `{ok:false}`, taken → `{ok:false}`, `excludeId` forwarded to helper, non-string `excludeId` ignored, 401, 429 |
| `__tests__/unit/api/applications-create.test.ts` | **Flow #4 — Create application** — `POST /api/applications`: 201 on success, candidate fields fall back to profile when absent from body, explicit body fields override profile, `show_profile_picture: true` copies URL from profile snapshot, `show_profile_picture: false` sets URL to null, DB insert failure → 400, 429, 401 |
| `__tests__/unit/api/applications-list.test.ts` | **Dashboard list** — `GET /api/applications`: default limit 20 + `meta.total`, custom `limit`/`offset`, max limit cap, `q` search filter, 401, 429, 500 |
| `__tests__/unit/api/applications-edit.test.ts` | **Flow #5 — Edit application** — `PUT /api/applications`: 200 on success, 404 when application not found, 404 when owned by another user, old CV deleted from R2 when `cv_url` changes, no deletion when `cv_url` unchanged, DB update failure → 400, 429, 401. `GET /api/applications/by-id/[id]`: 200 + `cv_exists: true/false`, 404 when not found or DB errors, 401 |
| `__tests__/unit/api/applications-public-view.test.ts` | **Flow #6 — Public view and view count** — `GET /api/applications/[slug]`: 200 + `cv_exists`, `cv_exists: false` when file missing, `cv_exists` omitted when no `cv_url`, 404, 429. `POST /api/applications/[slug]/view`: RPC called for external viewer → 200, RPC skipped for owner (self-view guard), 404 when slug not found, 500 when RPC fails, 429 |

---

## Design decisions

**No real network or database calls.** All external dependencies (Supabase client, `requireAuth`, rate limit) are mocked with `vi.mock()`. Mock functions are declared via `vi.hoisted()` so they are available before `vi.mock` factories execute (Vitest hoists `vi.mock` calls to the top of the file at compile time).

**Shared Supabase mock helper (`__tests__/helpers/supabase-mock.ts`).** Provides `makeChain`, `ok`, and `dbError` factories that build a fluent Supabase query-chain mock, and `makeSupabaseClient` which accepts an ordered list of chains so each sequential `from()` call in a route handler returns the next configured response.

**Full suite runs in under 600 ms.** With mocks in place no I/O occurs; all tests complete in one fast Node.js process.
