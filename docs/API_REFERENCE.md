# MyHireView — API Reference

Standalone catalog of Next.js App Router API routes under `app/api/`. For architecture, data model, and request flows, see [ARCHITECTURE.md](ARCHITECTURE.md) and [DATA_FLOW.md](DATA_FLOW.md).

Each endpoint lists **What works** (practices already in place) and **Improvement opportunities** (follow-ups). When an improvement is shipped, move it into **What works** so this doc stays a living checklist.

---

## Table of contents

- [Conventions](#conventions)
- [Applications](#applications)
  - [GET applications](#get-applications) — `GET /api/applications`
  - [POST applications](#post-applications) — `POST /api/applications`
  - [PUT applications](#put-applications) — `PUT /api/applications`
  - [DELETE applications](#delete-applications) — `DELETE /api/applications`
  - [GET application by public path](#get-application-by-public-path) — `GET /api/applications/[publicId]/[slug]`
  - [GET application by id](#get-application-by-id) — `GET /api/applications/by-id/[id]`
  - [POST application view](#post-application-view) — `POST /api/applications/[publicId]/[slug]/view`
  - [POST application download](#post-application-download) — `POST /api/applications/[publicId]/[slug]/download`
  - [GET application viewer status](#get-application-viewer-status) — `GET /api/applications/[publicId]/[slug]/viewer-status`
- [Profile](#profile)
  - [GET profile](#get-profile) — `GET /api/profile`
  - [PUT profile](#put-profile) — `PUT /api/profile`
  - [GET profile primary CVs](#get-profile-primary-cvs) — `GET /api/profile/primary-cvs`
  - [POST profile primary CV](#post-profile-primary-cv) — `POST /api/profile/primary-cvs`
  - [DELETE profile primary CV](#delete-profile-primary-cv) — `DELETE /api/profile/primary-cvs`
- [Slugs](#slugs)
  - [POST slug](#post-slug) — `POST /api/slug`
  - [POST slug validate](#post-slug-validate) — `POST /api/slug/validate`
- [Uploads](#uploads)
  - [POST upload CV](#post-upload-cv) — `POST /api/upload`
  - [POST upload profile picture](#post-upload-profile-picture) — `POST /api/upload/profile-picture`
- [Auth](#auth)
  - [POST auth login](#post-auth-login) — `POST /api/auth/login`
  - [POST auth signup](#post-auth-signup) — `POST /api/auth/signup`
  - [POST auth logout](#post-auth-logout) — `POST /api/auth/logout`
- [Waitlist](#waitlist)
  - [POST waitlist](#post-waitlist) — `POST /api/waitlist`
- [Types](#types)

---

## Conventions

- **Base path** — All routes are under `/api/…` on the same origin as the app.
- **Auth** — Session cookies (Supabase SSR). Handlers that need a user call `requireAuth()` from `lib/auth.ts` and return **401** `{ error: "Unauthorized" }` when there is no session.
- **Content type** — JSON bodies unless noted (`multipart/form-data` for uploads).
- **Success shape** — Often `{ data }` or `{ success: true }`. Endpoint sections below list specifics.
- **Error shape** — `{ error: string }` (some endpoints also return `{ ok: false, error }`).
- **Rate limiting** — Per IP via `lib/rate-limit.ts`. Exceeded limit → **429** with `Retry-After` and `{ error: "Too many requests. Please try again later." }`.
- **Default write limit** — `DEFAULT_API_RATE_LIMIT`: **60 requests / minute / IP** (used by most write routes unless noted).

Related deep-dives: [PDF_AND_R2.md](PDF_AND_R2.md) (CV upload), [PROFILE_PICTURE.md](PROFILE_PICTURE.md), [VIEW_COUNT_FIX.md](VIEW_COUNT_FIX.md).

Cross-cutting improvements that apply to many routes: schema validation at the boundary (e.g. Zod), a shared `withAuth` / `handleApiError` helper so auth failures are not confused with other errors, and structured server-side logging without leaking internals to clients. See also [CODE_REVIEW.md](CODE_REVIEW.md).

---

## Applications

### GET applications

`GET /api/applications`

List the authenticated user’s applications (newest first), paginated. Returns only the fields the admin dashboard uses (search, card status, insights, archive/delete/edit links, share URLs) — not CV/video/candidate/profile columns. Each item includes `public_id` for building share links (`/view/{public_id}/{slug}`). `public_id` is resolved read-only (profiles row, then Auth `user_metadata`); this endpoint does **not** create a profiles row.

- **Auth:** Required
- **Rate limit:** Default (60/min)
- **Query:**
  - `limit` — page size (default **20**, max **50**)
  - `offset` — rows to skip (default **0**)
  - `q` — optional case-insensitive search on `company`, `role`, or `slug` (max 100 chars; filter metacharacters stripped)
- **Errors:** `401` `{ error: "Unauthorized" }`; `429`; `500` `{ error: string }` (DB message or `"Failed to fetch applications"`)

**Success — `200`**

```json
{
  "data": [
    {
      "id": "uuid",
      "public_id": "k7x2m9ab",
      "slug": "acme-frontend-engineer",
      "company": "Acme",
      "role": "Frontend Engineer",
      "status": "active",
      "archived_at": null,
      "cv_url": "https://pub.example/cvs/…",
      "cv_exists": true,
      "view_count": 12,
      "download_count": 3,
      "created_at": "2026-07-01T12:00:00.000Z",
      "last_viewed_at": "2026-07-20T09:30:00.000Z"
    }
  ],
  "meta": {
    "limit": 20,
    "offset": 0,
    "total": 47
  }
}
```

| Field                   | Type                                    | Notes                                              |
| ----------------------- | --------------------------------------- | -------------------------------------------------- |
| `data[].id`             | `string` (UUID)                         | Edit / archive / delete                            |
| `data[].slug`           | `string`                                | Public URL + search                                |
| `data[].company`        | `string`                                | Card title + search                                |
| `data[].role`           | `string`                                | Card title + search                                |
| `data[].status`         | `"active"` \| `"draft"` \| `"archived"` | Card status                                        |
| `data[].archived_at`    | `string` (ISO) \| `null`                | Set when archived; retention clock                 |
| `data[].cv_url`         | `string`                                | Used for `cv_exists` check                         |
| `data[].cv_exists`      | `boolean`                               | Dashboard “CV missing” badge when false            |
| `data[].view_count`     | `number`                                | Status icon + insights                             |
| `data[].download_count` | `number`                                | Insights                                           |
| `data[].created_at`     | `string` (ISO)                          | Insights                                           |
| `data[].last_viewed_at` | `string` (ISO) \| `null`                | Insights; null if never viewed by a non-owner      |
| `meta.limit`            | `number`                                | Echo of applied page size                          |
| `meta.offset`           | `number`                                | Echo of applied offset                             |
| `meta.total`            | `number`                                | Total matching rows (after `q`, before page slice) |

TypeScript: `ApplicationListItem`, `ApplicationListResponse`, `APPLICATION_LIST_DEFAULT_LIMIT` / `APPLICATION_LIST_MAX_LIMIT` in `lib/types/application.ts` (projection: `APPLICATION_LIST_SELECT`).

**What works**

- Requires auth; scoped to `user_id` so users only see their own rows.
- Rate limited (default 60/min) before auth/query work.
- Dedicated auth try/catch → **401**; unexpected failures → **500** with server log (not mislabeled as unauthorized).
- Offset pagination with default page size **20** (max **50**) and `meta.total` for UI pagers.
- Optional server-side `q` search so pagination and filtering stay consistent.
- Stable ordering (`created_at` descending) for the dashboard.
- Clear success shape `{ data, meta }`.
- Projects only dashboard list fields (not `select("*")`).

---

### POST applications

`POST /api/applications`

Create an application. Candidate fields fall back to the user’s profile when omitted. Stores `show_profile_picture` only (avatar URL is read live from the profile on public view).

- **Auth:** Required
- **Rate limit:** Default (60/min)
- **Body** (`ApplicationCreateInput`): `company`, `role`, `slug`, `cv_url`, `video_url` (required); optional `cv_type` (`"primary"` | `"tailored"`, default `"tailored"`), `primary_cv_id` (required when `cv_type` is `"primary"`), `first_name`, `last_name`, `location`, `portfolio_url`, `linkedin_url`, `slugNamePosition` (`"start"` | `"end"` | `null` → stored as `include_name_in_slug`), `cv_filename`, `use_original_cv_filename` (default `true`), `show_profile_picture`
- **Success:** `201` `{ data: Application }`
- **Errors:** `400` schema validation / insert / primary CV missing; `401`; `409` slug taken (`validateSlugForApplication` or unique constraint) or tailored `cv_url` already used; `429`; `500` unexpected failures

**What works**

- Auth required; inserts always set `user_id` from the session (not the client body).
- Rate limited.
- Dedicated auth try/catch → **401**; unexpected failures → **500** with server log (not mislabeled as unauthorized).
- **Schema validation** (`applicationCreateSchema` in `lib/validation/application.ts`): required trimmed strings; http(s) URLs for `cv_url` / `video_url` / optional portfolio / LinkedIn; slug format via `validateSlugFormat`; enums/booleans; rejects unexpected keys; `primary_cv_id` UUID required when `cv_type` is `"primary"`. Invalid bodies return clear **400** `{ error }` before any insert.
- Profile snapshot / fallback for candidate fields keeps recruiter data on the application row.
- Avatar preference is a boolean only — no denormalized picture URL on the application row.
- **Primary CV:** when `cv_type` is `"primary"`, `primary_cv_id` must reference a row in the caller’s `primary_cvs` library; `cv_url` is resolved from that library row (client may send the same URL for convenience).
- **Tailored CV:** when `cv_type` is `"tailored"` (default), `cv_url` must be a caller-owned tailored upload (`cvs/{userId}/tailored/…`); not a primary library key. Reusing another application’s tailored URL returns **409**.
- **Slug uniqueness:** calls `validateSlugForApplication` (same helper as `POST /api/slug/validate`) before insert so a taken slug returns **409** with `SLUG_COLLISION_USER_MESSAGE` without relying only on the DB. Postgres unique violations (`23505`) remain a race backstop with the same **409** message.
- Returns **201** with the created row.

---

### PUT applications

`PUT /api/applications`

Update an application owned by the current user. Replacing a tailored `cv_url` deletes the previous tailored R2 object when it belongs to the caller (`deleteApplicationCvIfTailored` / `deleteCvIfOurs`). Primary library objects are never deleted here. Updates `show_profile_picture` when provided (avatar still comes from the profile at view time).

- **Auth:** Required
- **Rate limit:** Default (60/min)
- **Body:** `id` (required) plus partial `ApplicationUpdateInput` (`company`, `role`, `slug`, `cv_url`, `video_url`, `status`, `cv_type`, `primary_cv_id`, candidate fields, `slugNamePosition`, `cv_filename`, `use_original_cv_filename`, `show_profile_picture`). Setting `status` to `archived` sets `archived_at` (resets clock); `active`/`draft` clears `archived_at`.
- **Success:** `200` `{ data: Application }`
- **Errors:** `400`; `401`; `404` if missing or not owned; `409` tailored `cv_url` already used by another application; `429`

Note: `description` in the body is ignored (column removed in migration 017).

**What works**

- Auth + ownership check before update; **404** when missing or not owned (no existence leak across users beyond that).
- Rate limited.
- On `cv_url` change, deletes the **previous** R2 object only when `cv_type` is **tailored** and `deleteApplicationCvIfTailored` / `deleteCvIfOurs` confirms the URL is under `R2_PUBLIC_BASE_URL` **and** the object key belongs to the caller (`cvs/{userId}/tailored/…` or `cvs/{userId}/primary/…` for ownership; only tailored objects are deleted on replace).
- Rejects a new tailored `cv_url` that is not a caller-owned tailored upload (**400**), or that is already used by another of the caller’s applications (**409**). Keeping the same `cv_url` on the current row is allowed. Switching to **primary** resolves URL from the caller’s `primary_cvs` library via `primary_cv_id`.
- Persists `show_profile_picture` when provided (public view uses live profile picture).
- Maps `slugNamePosition` → `include_name_in_slug` instead of exposing the DB column name as the only contract.

**Improvement opportunities**

- Avoid spreading the raw body into the update payload (mass-assignment risk for fields like `user_id`, `view_count`, `download_count`). Whitelist allowed keys explicitly.
- Schema-validate partial updates; require `id` as a UUID.
- **Delete-before-update ordering:** on tailored CV replacement the handler calls `deleteApplicationCvIfTailored(existing.cv_url, existing.cv_type, …)` **before** the Supabase update. If the update then fails (**400**), the row still points at `existing.cv_url` but the object is already gone. Persist the new `cv_url` first, then delete the old object only after a successful update.
- Improve error handling / logging (same catch-all **401** issue).
- Optionally return **409** on slug collisions instead of a generic **400**.

---

### DELETE applications

`DELETE /api/applications`

Hard-delete an application and its tailored CV object in R2 (when the URL belongs to the caller).

- **Auth:** Required
- **Rate limit:** Default (60/min)
- **Query:** `id` (required)
- **Success:** `200` `{ success: true }`
- **Errors:** `400` missing id / DB error; `401`; `404` if missing or not owned; `429`

**What works**

- Auth + ownership check before delete.
- Rate limited.
- Cleans up the CV in R2 when the URL is under `R2_PUBLIC_BASE_URL` **and** the object key belongs to the caller (`deleteApplicationCvIfTailored` → `deleteCvIfOurs`). Safe with the one-tailored-CV-per-application attach rule (primary library objects are never deleted here).
- Requires an explicit `id` query param (fails closed if missing).

**Improvement opportunities**

- Validate `id` as a UUID before querying.
- If R2 delete fails, log and decide whether to fail the request or proceed (today delete continues after `deleteCvIfOurs`; document or harden that policy).
- Same auth-vs-500 catch handling as other handlers.
- Consider soft-delete-only for some clients if hard delete is irreversible by design (archive already covers soft hide).

---

### GET application by public path

`GET /api/applications/[publicId]/[slug]`

Public fetch of one application by the owner’s opaque `public_id` and per-user `slug`. Adds `cv_exists` when `cv_url` is set (R2 `HeadObject` check). See [PUBLIC_URL_OPTION_B.md](PUBLIC_URL_OPTION_B.md).

- **Auth:** Not required
- **Rate limit:** **120 requests / minute / IP**
- **Success:** `200` `{ data: Application & { cv_exists?: boolean } }`
- **Errors:** `404`; `429`; `500`

**What works**

- Public by design for shareable recruiter links; no login required.
- Per-IP rate limit (120/min) tuned for viewing while limiting scraping.
- `cv_exists` helps the UI avoid broken “View CV” links when the object is missing.
- Clear **404** when the public id + slug pair does not resolve.

**Improvement opportunities**

- Return a public DTO: omit `user_id` and any other owner-only fields from the response.
- Cache `cv_exists` or skip the HeadObject on every request if latency / R2 cost becomes an issue.
- For archived applications (`status = archived`), consider a dedicated response shape vs full payload (page already handles archived UI).
- Log unexpected errors server-side before returning **500**.

---

### GET application by id

`GET /api/applications/by-id/[id]`

Owner-only fetch for the edit page. Same `cv_exists` behaviour as the public slug GET.

- **Auth:** Required
- **Rate limit:** None
- **Success:** `200` `{ data: Application & { cv_exists?: boolean } }`
- **Errors:** `401`; `404` if missing or not owned

**What works**

- Auth required; filters by both `id` and `user_id` so owners cannot load another user’s row.
- Dedicated by-id endpoint avoids fetching the full list just to edit one application.
- Same `cv_exists` enrichment as the public slug GET for consistent edit UX.

**Improvement opportunities**

- Add a rate limit consistent with other authenticated reads.
- Validate `id` as a UUID; distinguish **401** from **500** in the catch path.
- Optionally make `cv_exists` lazy/opt-in if HeadObject slows the edit page.

---

### POST application view

`POST /api/applications/[publicId]/[slug]/view`

Record a page view. Owner views are acknowledged but **not** counted. Non-owner increments use the `increment_application_view_count(p_public_id, p_slug)` SECURITY DEFINER RPC via the service-role admin client (updates `view_count` and `last_viewed_at`). See [VIEW_COUNT_FIX.md](VIEW_COUNT_FIX.md).

- **Auth:** Not required (session used only to detect owner)
- **Rate limit:** Default (60/min)
- **Success:** `200` `{ success: true }`
- **Errors:** `404`; `429`; `500`

**What works**

- Owner self-views are detected via session and excluded from the count.
- Increments go through a SECURITY DEFINER RPC with the service-role client (avoids RLS update issues for anonymous viewers).
- Rate limited; returns a simple `{ success: true }` contract.
- Also updates `last_viewed_at` for non-owner views.

**Improvement opportunities**

- Client `sessionStorage` dedupe is easy to bypass; add a short-lived server-side or cookie-based “already counted” token per slug to reduce count inflation.
- Log RPC failures with slug / error code for ops; keep client message generic.
- Consider a stricter per-slug rate limit in addition to per-IP.
- Validate slug format early to avoid unnecessary DB hits.

---

### POST application download

`POST /api/applications/[publicId]/[slug]/download`

Record a CV download. Same owner-exclusion and RPC pattern as view (`increment_application_download_count(p_public_id, p_slug)`).

- **Auth:** Not required (session used only to detect owner)
- **Rate limit:** Default (60/min)
- **Success:** `200` `{ success: true }`
- **Errors:** `404`; `429`; `500`

**What works**

- Mirrors the view-count pattern: owner excluded, SECURITY DEFINER RPC, service-role client.
- Rate limited; consistent `{ success: true }` response.
- Keeps download analytics aligned with view analytics for the dashboard.

**Improvement opportunities**

- Same as view: server-side dedupe / signed cookie, RPC logging, stricter per-slug limits, early slug validation.
- Optionally require a matching Referer / same-origin check to blunt trivial cross-site spam (defense in depth only; not a substitute for auth).

---

### GET application viewer status

`GET /api/applications/[publicId]/[slug]/viewer-status`

Whether the current viewer owns the application (used to show the public-view footer only to non-owners). Unauthenticated viewers get `isOwner: false`.

- **Auth:** Not required
- **Rate limit:** None
- **Success:** `200` `{ isOwner: boolean }`
- **Errors:** `404`; `500`

**What works**

- Minimal payload (`{ isOwner }`) — does not leak application content.
- Works for anonymous and signed-in viewers; owners are detected from session.
- Supports UI that should differ for recruiters vs the applicant without a full page refetch.

**Improvement opportunities**

- Add a light rate limit (this is a cheap ownership probe and currently unlimited).
- Validate slug format; log unexpected errors.
- Could fold into the public GET payload (e.g. `isOwner`) to save a round trip, if the view page always needs both.

---

## Profile

### GET profile

`GET /api/profile`

Return the current user’s profile. **Read-only** — does not create a row. If no profile exists (`PGRST116`), returns **404**.

- **Auth:** Required
- **Rate limit:** Default (60/min)
- **Success:** `200` `{ data: Profile }`
- **Errors:** `404` profile not found; `401`; `429`; `500`

**What works**

- Auth required; selects only by session `user_id`.
- Distinguishes “no row” (`404`) from other DB errors (`500`).
- Profiles are normally created at signup; GET never creates a row.
- Rate limited (default 60/min) before auth/query work.
- Dedicated auth try/catch → **401**; unexpected failures after auth → **500** with server log (not mislabeled as unauthorized).

---

### PUT profile

`PUT /api/profile`

Upsert profile fields (row usually already exists from signup). Requires non-empty `first_name` and `last_name` (after merge with existing — so picture-only updates work). Assigns or preserves `public_id`. Body is schema-validated with Zod. When names/`public_id` change, syncs Auth `user_metadata`. When `profile_picture_url` changes, **after** a successful upsert deletes the previous Storage object. Applications do not store a picture URL copy — they read the live profile URL when `show_profile_picture` is true. See [PROFILE_PICTURE.md](PROFILE_PICTURE.md).

- **Auth:** Required
- **Rate limit:** Default (60/min)
- **Body** (`ProfileUpdateInput`, Zod `profileUpdateSchema`): Optional `first_name`, `last_name`, `location`, `portfolio_url`, `linkedin_url`, `profile_picture_url` — omit picture field to leave unchanged; `null` to clear. Unexpected keys → **400**. Max lengths: names **100**, location **200**, URLs **2048**. Non-null picture URL must be under the caller’s Storage folder.
- **Success:** `200` `{ data: Profile }` optionally with `warnings: string[]` (e.g. Storage delete or metadata sync failed)
- **Errors:** `400` schema / unowned picture URL / missing names / upsert error; `401`; `429`; `500`

**What works**

- Auth required; upsert keyed by `user_id` (create-on-first-save).
- Rate limited; Zod validation; ownership check on picture URLs.
- Deletes previous Storage object after successful write when the URL changes; surfaces partial failures as `warnings`.
- No applications fan-out for picture URLs (live profile read on view).
- Dedicated auth try/catch → **401**; unexpected failures after auth → **500** with server log (not mislabeled as unauthorized).

---

### GET profile primary CVs

`GET /api/profile/primary-cvs`

List the authenticated user’s primary CV library (newest first). Each row includes usage metadata for delete UX.

- **Auth:** Required
- **Rate limit:** Default (60/min)
- **Success:** `200` `{ data: PrimaryCv[] }` — each item includes `applications_count` and `used_by` (preview of applications referencing that primary; capped for UI)
- **Errors:** `400` DB error; `401`; `429`

**What works**

- Auth required; scoped to session `user_id`.
- Rate limited.
- Joins application references so delete flows can show count + preview without extra round trips.

---

### POST profile primary CV

`POST /api/profile/primary-cvs`

Upload a PDF to the primary CV library (max **5** per user). Object key: `cvs/{userId}/primary/{id}.pdf`. See [PDF_AND_R2.md](PDF_AND_R2.md).

- **Auth:** Required
- **Rate limit:** Default (60/min)
- **Body:** `multipart/form-data` with `file` (PDF, max **3 MB**); optional `label` (max **120** chars)
- **Success:** `201` `{ data: PrimaryCv & { applications_count: 0, used_by: [] } }`
- **Errors:** `400` missing file / library at max / validation; `401`; `429`; `500` (R2 not configured / upload failure)

**What works**

- Auth required; enforces **5** primaries per user before upload.
- PDF-only, **3 MB** max, `%PDF` magic-byte check.
- Writes R2 object then inserts `primary_cvs` row; rolls back R2 on insert failure.
- Returns usage fields (`applications_count: 0`, `used_by: []`) for consistent client shape.

---

### DELETE profile primary CV

`DELETE /api/profile/primary-cvs?id=…`

Remove a primary CV from the library and delete its R2 object. Applications that still reference it keep the URL but show **CV missing** on the dashboard until edited.

- **Auth:** Required
- **Rate limit:** Default (60/min)
- **Query:** `id` (required, primary CV UUID)
- **Success:** `200` `{ success: true, applications_affected: number }`
- **Errors:** `400` missing id / DB error; `401`; `404` not found or not owned; `429`

**What works**

- Auth + ownership check before delete.
- Deletes `primary_cvs` row and R2 object (`deleteCvIfOurs`).
- Returns `applications_affected` count for confirm UX (client may show this before calling DELETE).

---

## Slugs

### POST slug

`POST /api/slug`

Derive a slug from company/role (and optional name-in-URL rules) via `reserveBaseSlug`. Returns **409** if that exact slug is already taken **for the current user** (no numeric suffix). Optional `excludeId` ignores the current row when editing. Slugs are unique per user (`UNIQUE (user_id, slug)`), not globally.

- **Auth:** Required
- **Rate limit:** Default (60/min)
- **Body:** `company`, `role` (required); optional `excludeId` (UUID), `first_name`, `last_name`, `slugNamePosition` (`"start"` | `"end"` | `null`)
- **Success:** `200` `{ slug: string }`
- **Errors:** `400` invalid JSON / schema; `401`; `404` `excludeId` missing or not owned; `409` collision; `429`; `500`

**What works**

- Auth required; dedicated auth try/catch → **401**.
- Rate limited.
- **Schema validation** (`slugReserveSchema` in `lib/validation/slug.ts`): trimmed non-empty `company` / `role` (max length); optional names; `slugNamePosition` enum or null; UUID `excludeId`; rejects unexpected keys; malformed JSON / non-object bodies → clear **400**.
- When `excludeId` is present, verifies the application belongs to the current user before reserving (**404** otherwise).
- Uses shared `reserveBaseSlug` / `SlugCollisionError` for consistent slug rules and a clear **409** when taken.
- Supports name-in-URL positions and `excludeId` for edit flows without inventing numeric suffixes.
- Logs unexpected failures before returning **500**.

---

### POST slug validate

`POST /api/slug/validate`

Check format and uniqueness of a proposed slug **for the current user** (used when the user edits the slug field manually). Invalid or taken slugs return **200** with `{ ok: false, error }` (not 4xx), so the client can show inline feedback.

- **Auth:** Required
- **Rate limit:** **30 requests / minute / IP** (`SLUG_VALIDATE_RATE_LIMIT`)
- **Body:** `slug` (string, required; may be empty for format feedback); optional `excludeId` (UUID)
- **Success:** `200` `{ ok: true }` or `200` `{ ok: false, error: string }`
- **Errors:** `400` invalid JSON / schema; `401`; `404` `excludeId` missing or not owned; `429`; `500` `{ ok: false, error }`

**What works**

- Auth required; dedicated auth try/catch → **401**.
- Tighter rate limit than general writes (**30/min**), suited to the debounced slug field while capping abuse.
- **Schema validation** (`slugValidateSchema`): requires a string `slug`; UUID `excludeId`; rejects unexpected keys; malformed JSON / non-object bodies → clear **400**.
- When `excludeId` is present, verifies ownership via `assertExcludeIdOwnedByUser` (**404** otherwise).
- Shared `validateSlugForApplication` covers format + uniqueness.
- **200** + `{ ok: false, error }` is a deliberate UX contract for inline form feedback (invalid or taken slugs are not **4xx**).
- Logs unexpected failures before returning **500**.

---

## Uploads

### POST upload CV

`POST /api/upload`

Upload a tailored CV PDF to Cloudflare R2. Requires an idempotency key so retries reuse the same object. Full details: [PDF_AND_R2.md](PDF_AND_R2.md).

- **Auth:** Required
- **Rate limit:** **10 / minute** per IP and per user; max **2** concurrent uploads per user (best-effort per instance)
- **Body:** `multipart/form-data` with `file` (PDF, max **3 MB**)
- **Idempotency:** Header `Idempotency-Key` / `idempotency-key`, or form field `idempotency_key`: 8–128 chars, `[a-zA-Z0-9_-]` only. Object key: `cvs/{userId}/tailored/<key>.pdf`. If the object already exists and size/content-type match the request → `{ url, idempotent: true }` without re-upload; size/type mismatch → **409**.
- **Success:** `200` `{ url: string, idempotent: boolean }`
- **Errors:** `400` missing/invalid file or key; `401`; `409` idempotency key reused with a different file; `429`; `500` (R2 not configured / upload failure)

**What works**

- Auth required (dedicated check before processing).
- Stricter rate limit than general writes (**10/min** IP + user) and a concurrent upload cap (**2** per user, in-memory / per instance).
- Restricts to PDF MIME type and **3 MB** max size; rejects bodies that do not start with `%PDF` (magic bytes), not MIME alone.
- Idempotency keys scoped per user (`cvs/{userId}/tailored/<key>.pdf`); HeadObject replay returns the same URL without re-upload when size and content type match.
- **Atomic create:** `PutObject` uses `IfNoneMatch: "*"` so concurrent creates with the same key cannot overwrite; **412** (and a single **409** retry) re-checks HeadObject and returns `{ url, idempotent: true }` or **409** on mismatch.
- Fails clearly when R2 is not configured; logs upload/config errors server-side.
- Application attach/delete paths authorize object keys per user (`isOwnedTailoredCvUrl` on attach / `deleteCvIfOurs(url, userId)` on delete). Tailored `cv_url` values must be unique across the caller’s applications (**409** if reused); re-uploading the same PDF for another app creates a new object key. Primary CVs are shared via `cv_type: "primary"` and are not subject to the one-URL-per-app rule.

**Improvement opportunities**

- None specific to this route beyond general upload UX / observability.

---

### POST upload profile picture

`POST /api/upload/profile-picture`

Upload (overwrite) the caller’s canonical avatar at `{user_id}/avatar.{jpg|png|webp}` in the `profile-pictures` bucket, purge other objects in that folder, and return the public URL. Intended to be called from profile **Save** (upload-on-save), not on file pick. See [PROFILE_PICTURE.md](PROFILE_PICTURE.md).

- **Auth:** Required
- **Rate limit:** Default (60/min)
- **Body:** `multipart/form-data` with `file` (JPEG, PNG, or WebP; max **5 MB**)
- **Success:** `200` `{ url: string }` optionally `{ warning }` if purge of older files failed
- **Errors:** `400` missing/invalid file; `401`; `429`; `500`

**What works**

- Canonical path + upsert enforces one picture per user; removes leftover folder objects after upload.
- Auth required (dedicated check → **401**); unexpected/Storage failures → **500** with generic client message; Storage errors logged with `status` / `statusCode`.
- Rate limited; JPEG/PNG/WebP MIME + magic-byte / light header checks (JPEG SOI, PNG IHDR, WebP VP8\*); **5 MB** cap. Object extension and `contentType` follow detected bytes, not the client MIME alone.

**Improvement opportunities**

- None specific to this route beyond general upload UX / observability.

---

## Auth

Auth handlers use `createSupabaseRouteClient` so `Set-Cookie` is applied on the JSON response. See [SUPABASE_AUTH_SETUP.md](SUPABASE_AUTH_SETUP.md).

### POST auth login

`POST /api/auth/login`

- **Auth:** Not required
- **Rate limit:** **15 / minute / IP**
- **Body:** `{ email, password }`
- **Success:** `200` `{ success: true }` (+ session cookies)
- **Errors:** `400` missing fields; `401` bad credentials; `429`; `500` no session

**What works**

- Per-IP rate limit (**15/min**) to blunt brute force while allowing typo retries.
- Requires both email and password before calling Supabase.
- Uses the route client so session cookies land on the response (middleware can read them next request).
- Distinguishes missing fields (**400**), auth failure (**401**), and missing session (**500**).
- Does **not** create a `profiles` row (signup / auth callback does).

**Improvement opportunities**

- Normalize/validate email format; enforce a max password length before calling Supabase.
- Return a generic **401** message (avoid forwarding raw Supabase error text that can aid enumeration).
- Consider account-level / email-based throttling in addition to per-IP (shared NATs).
- Wrap `request.json()` in try/catch for malformed bodies → **400**.

---

### POST auth signup

`POST /api/auth/signup`

- **Auth:** Not required
- **Rate limit:** **5 / minute / IP**
- **Body:** `{ email, password, confirmPassword, first_name, last_name }` — all required; `password` and `confirmPassword` must match; password min length **6**; names trimmed and non-empty
- **Success:** `200` `{ success: true, requiresConfirmation: false }` with cookies when a session is created immediately; or `200` `{ success: true, requiresConfirmation: true }` when email confirmation is required
- **Errors:** `400` (missing fields, password mismatch, too-short password, Supabase error); `429`

`emailRedirectTo` is set to `{origin}/auth/callback`. First/last name and `public_id` are stored in Auth `user_metadata` and a `profiles` row is created via the service-role helper (`createInitialProfile`) — works with or without an immediate session. When confirmation is required, the response **preserves PKCE cookies** from `signUp` so `/auth/callback` can exchange the email link code. The callback also retries `createInitialProfile` idempotently.

**Side effects**

- Creates a `profiles` row (`user_id`, `public_id`, `first_name`, `last_name`; other columns null). Failures are logged; signup still succeeds so the auth callback can retry.

**What works**

- Tight **5/min** rate limit (stricter than login’s **15/min**).
- Requires email, password confirmation, and first/last name; uses the route client for cookies when a session exists.
- Explicit `requiresConfirmation` flag so the UI can guide email-confirm flows.
- Sets `emailRedirectTo` to `/auth/callback` on the current origin.
- Seeds Auth `user_metadata` and inserts the initial profiles row (service role; idempotent).

**Improvement opportunities**

- Prefer generic errors for “user already exists” vs other failures to reduce enumeration (align with Supabase project settings).
- Handle malformed JSON safely; log unexpected Auth API failures.
- Optional CAPTCHA / bot protection if signup spam appears.

---

### POST auth logout

`POST /api/auth/logout`

- **Auth:** Not required
- **Rate limit:** **20 / minute / IP**
- **Body:** None
- **Success:** `200` `{ success: true }` (session cleared)
- **Errors:** `429`

**What works**

- Rate limited (looser than login/signup, still bounded).
- Uses the route client so `signOut` clears session cookies on the response.
- Simple, idempotent-friendly success contract.

**Improvement opportunities**

- Check `signOut` result and log failures; still clear cookies when possible.
- Optionally require an authenticated session (or CSRF cookie pattern) so logout is not a no-op spam target—though current behaviour is acceptable for cookie clearing.

---

## Waitlist

### POST waitlist

`POST /api/waitlist`

Pre-launch landing-page signup. Inserts into `waitlist_signups` via the service-role admin client.

- **Auth:** Not required
- **Rate limit:** **5 / minute / IP**
- **Body — required:** `email`, `first_name`, `job_search_status` (`Actively searching` | `Casually looking` | `Career planning` | `Other`)
- **Body — optional:** `primary_goal` (`Get more interviews` | `Track my applications` | `Stand out to recruiters` | `Network with recruiters` | `Other`), `career_stage` (`Entry-level` | `Junior (1–3 years)` | `Mid-level (3–7 years)` | `Senior (7+ years)` | `Other`)
- **Success:** `200` `{ success: true }`
- **Errors:** `400` validation; `409` duplicate email; `429`; `500`

**What works**

- Strict **5/min** rate limit for a public write endpoint.
- Validates required fields and allowlists enum values for status / goal / stage.
- Basic email format check; normalizes email to lowercase on insert.
- Maps unique violations to **409**; generic message for other DB errors (logs server-side).
- Insert-only via service role; response does not return row data.

**Improvement opportunities**

- Add bot protection (CAPTCHA, honeypot field, or Turnstile) — IP rate limits alone are weak against distributed spam.
- Cap `first_name` length; tighten email validation (or use a small library).
- Consider returning a uniform **200** for duplicate emails to reduce waitlist enumeration (trade-off vs current explicit **409**).

---

## Types

Canonical TypeScript shapes live in:

- `lib/types/application.ts` — `Application`, `ApplicationListItem`, `ApplicationListResponse`, `ApplicationCreateInput`, `ApplicationUpdateInput`, `ApplicationCvType` (`"primary"` | `"tailored"`)
- `lib/validation/application.ts` — `applicationCreateSchema` / `formatApplicationCreateZodError` for `POST /api/applications`
- `lib/validation/slug.ts` — `slugReserveSchema` / `formatSlugReserveZodError` for `POST /api/slug`; `slugValidateSchema` / `formatSlugValidateZodError` for `POST /api/slug/validate`
- `lib/types/profile.ts` — `Profile`, `ProfileUpdateInput`
- `lib/types/primary-cv.ts` — `PrimaryCv`, `PrimaryCvApplicationPreview`, `PRIMARY_CV_MAX_PER_USER`

Client helpers for some application calls: `lib/api/applications.ts`.
