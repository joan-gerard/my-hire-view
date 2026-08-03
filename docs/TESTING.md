# Testing

> Last updated: August 2, 2026

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
        profile-picture-storage.test.ts
        cv-storage.test.ts
        upload-idempotency.test.ts
        pdf.test.ts
        image.test.ts
        public-id.test.ts
      types/
        primary-cv.test.ts
      api/
        handle-api-error.test.ts
      rate-limit.test.ts
      profile-validation.test.ts
      ensure-profile.test.ts
    api/
      profile.test.ts
      profile-picture-upload.test.ts
      slug.test.ts
      applications-create.test.ts
      applications-edit.test.ts
      applications-list.test.ts
      applications-public-view.test.ts
      signup.test.ts
```

Manual QA for primary/tailored CVs and application status: [manual-testing/MANUAL_TEST_PRIMARY_CV_AND_STATUS.md](manual-testing/MANUAL_TEST_PRIMARY_CV_AND_STATUS.md).

---

## Test files

| File | What it covers |
|------|---------------|
| `__tests__/unit/lib/utils/slug-generate.test.ts` | **Pure slug utilities** — `validateSlugFormat` (empty input, too long, invalid chars, valid slugs), `generateSlug` (normalisation, special-char stripping, space collapsing), `buildSlug` (position `start`/`end`, partial and missing names) |
| `__tests__/unit/lib/utils/slug.test.ts` | **Server-side slug helpers** — `checkSlugUniqueness` (unique, taken, DB error), `validateSlugForApplication` (format short-circuits DB call, available, taken), `reserveBaseSlug` (name positions, collision throws `SlugCollisionError`), `SlugCollisionError` (shape and default message) |
| `__tests__/unit/lib/utils/profile-picture-storage.test.ts` | **Profile picture Storage URLs** — path parse, canonical `avatar.*`, ownership (canonical + legacy under user folder) |
| `__tests__/unit/lib/utils/cv-storage.test.ts` | **CV R2 ownership & delete** — `isOwnedTailoredCvUrl`, `isOwnedPrimaryCvObjectKey`, `deleteApplicationCvIfTailored`, `deleteCvIfOurs`, `checkCvObjectExists` (`true`/`false`/`undefined`) |
| `__tests__/unit/lib/utils/upload-idempotency.test.ts` | **Tailored upload idempotency** — HeadObject replay, size/type mismatch |
| `__tests__/unit/lib/utils/pdf.test.ts` | **PDF magic bytes** — `%PDF` detection |
| `__tests__/unit/lib/utils/image.test.ts` | **Image magic bytes** — JPEG / PNG / WebP detection + light header checks |
| `__tests__/unit/api/profile-picture-upload.test.ts` | **Profile picture upload** — auth **401** vs unexpected **500**, MIME + magic-byte rejects, Storage error logging without leaking messages, purge warning |
| `__tests__/unit/lib/utils/public-id.test.ts` | **Public id generation** |
| `__tests__/unit/lib/utils/resolve-public-application.test.ts` | **Public path resolution** — invalid `publicId` / slug format short-circuits before DB; valid pair resolves application + owner |
| `__tests__/unit/lib/types/primary-cv.test.ts` | **Primary CV types** — `PRIMARY_CV_MAX_PER_USER`, preview limit constants |
| `__tests__/unit/lib/ensure-profile.test.ts` | **Profile bootstrap** — `createInitialProfile` idempotency |
| `__tests__/unit/lib/rate-limit.test.ts` | **In-memory rate limiter** — `getClientIdentifier` (x-forwarded-for, x-real-ip, fallback to "unknown"), `rateLimit` (counting, window reset via fake timers, per-client isolation), `checkRateLimit`, `checkPerSlugRateLimit` (IP+path isolation), `rateLimit429` (429 status + Retry-After ≥ 1s) |
| `__tests__/unit/lib/api/handle-api-error.test.ts` | **API error helper** — `handleApiError` logs with context, default 500 message, custom message/status, optional log-only `meta` never returned to client |
| `__tests__/unit/lib/api/same-origin.test.ts` | **Analytics same-origin gate** — matching `Origin` / `Referer` / `Sec-Fetch-Site`, site URL allowlist, rejects foreign or missing signals |
| `__tests__/unit/lib/api/analytics-dedupe.test.ts` | **View/download dedupe cookies** — cookie names, present/absent checks, httpOnly + maxAge + secure-in-production |
| `__tests__/unit/lib/profile-validation.test.ts` | **Profile PUT body schema** — empty object ok, http(s) URLs, blank URL → null, unrecognized keys, max lengths for names/location/URLs, reject non-http(s) |
| `__tests__/unit/api/profile.test.ts` | **Flow #3 — Profile read and update** — GET cases; PUT validation, owned picture URL, delete previous after save + warnings on delete failure, clear picture, rate limit, 401 |
| `__tests__/unit/api/slug.test.ts` | **Flow #4 — Live slug feedback** — `POST /api/slug`: derived slug available → 200, name-in-URL variants, missing company/role → 400, `SlugCollisionError` → 409, unexpected error → 500, rate limit → 429. `POST /api/slug/validate`: valid + available → `{ok:true}`, invalid format → `{ok:false}`, taken → `{ok:false}`, `excludeId` forwarded to helper, non-string `excludeId` ignored, 401, 429 |
| `__tests__/unit/api/applications-create.test.ts` | **Flow #4 — Create application** — `POST /api/applications`: 201, profile fallback for candidate fields, `show_profile_picture` preference (no stored picture URL), primary/tailored `cv_type` validation, DB insert failure → 400, 429, 401 |
| `__tests__/unit/api/applications-list.test.ts` | **Dashboard list** — `GET /api/applications`: default limit 20 + `meta.total`, custom `limit`/`offset`, max limit cap, `q` search filter, `cv_exists` true for unknown/non-R2 and false when missing, 401, 429, 500 |
| `__tests__/unit/api/applications-edit.test.ts` | **Flow #5 — Edit application** — `PUT /api/applications`: 200 on success, 404 when application not found, 404 when owned by another user, old tailored CV deleted from R2 when `cv_url` changes, no deletion when `cv_url` unchanged, DB update failure → 400, 429, 401, 500 after auth. `GET /api/applications/by-id/[id]`: 200 + `cv_exists: true/false`, omits `cv_exists` for non-R2 URLs, 404 when not found or DB errors, 401, 500 after auth |
| `__tests__/unit/api/applications-public-view.test.ts` | **Flow #6 — Public view and view count** — `GET /api/applications/[slug]`: 200 + `cv_exists`, `cv_exists: false` when file missing, `cv_exists` omitted when no `cv_url` or non-R2 URL, 404, 429, 500 on unexpected error. `POST /api/applications/[slug]/view`: RPC + dedupe cookie for external viewer → 200, RPC skipped for owner (self-view guard) but cookie set, cookie short-circuit skips resolve/RPC, 403 when not same-origin, 404 when slug not found, 500 when RPC fails, 429 per-IP and per-slug |

---

## Design decisions

**No real network or database calls.** All external dependencies (Supabase client, `requireAuth`, rate limit) are mocked with `vi.mock()`. Mock functions are declared via `vi.hoisted()` so they are available before `vi.mock` factories execute (Vitest hoists `vi.mock` calls to the top of the file at compile time).

**Shared Supabase mock helper (`__tests__/helpers/supabase-mock.ts`).** Provides `makeChain`, `ok`, and `dbError` factories that build a fluent Supabase query-chain mock, and `makeSupabaseClient` which accepts an ordered list of chains so each sequential `from()` call in a route handler returns the next configured response.

**Full suite runs in under 600 ms.** With mocks in place no I/O occurs; all tests complete in one fast Node.js process.
