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
  - [GET application by slug](#get-application-by-slug) — `GET /api/applications/[slug]`
  - [GET application by id](#get-application-by-id) — `GET /api/applications/by-id/[id]`
  - [POST application view](#post-application-view) — `POST /api/applications/[slug]/view`
  - [POST application download](#post-application-download) — `POST /api/applications/[slug]/download`
  - [GET application viewer status](#get-application-viewer-status) — `GET /api/applications/[slug]/viewer-status`
- [Profile](#profile)
  - [GET profile](#get-profile) — `GET /api/profile`
  - [PUT profile](#put-profile) — `PUT /api/profile`
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

List the authenticated user’s applications (newest first), paginated. Returns only the fields the admin dashboard uses (search, card status, insights, archive/delete/edit links) — not CV/video/candidate/profile columns.

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
      "slug": "acme-frontend-engineer",
      "company": "Acme",
      "role": "Frontend Engineer",
      "is_active": true,
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

| Field | Type | Notes |
| --- | --- | --- |
| `data[].id` | `string` (UUID) | Edit / archive / delete |
| `data[].slug` | `string` | Public URL + search |
| `data[].company` | `string` | Card title + search |
| `data[].role` | `string` | Card title + search |
| `data[].is_active` | `boolean` | Active vs archived status |
| `data[].view_count` | `number` | Status icon + insights |
| `data[].download_count` | `number` | Insights |
| `data[].created_at` | `string` (ISO) | Insights |
| `data[].last_viewed_at` | `string` (ISO) \| `null` | Insights; null if never viewed by a non-owner |
| `meta.limit` | `number` | Echo of applied page size |
| `meta.offset` | `number` | Echo of applied offset |
| `meta.total` | `number` | Total matching rows (after `q`, before page slice) |

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

Create an application. Candidate fields fall back to the user’s profile when omitted. When `show_profile_picture` is true, `profile_picture_url` is copied from the profile (otherwise null).

- **Auth:** Required
- **Rate limit:** Default (60/min)
- **Body** (`ApplicationCreateInput`): `company`, `role`, `slug`, `cv_url`, `video_url` (required); optional `first_name`, `last_name`, `location`, `portfolio_url`, `linkedin_url`, `slugNamePosition` (`"start"` | `"end"` | `null` → stored as `include_name_in_slug`), `cv_filename`, `use_original_cv_filename` (default `true`), `show_profile_picture`
- **Success:** `201` `{ data: Application }`
- **Errors:** `400` insert/validation; `401`; `429`

**What works**

- Auth required; inserts always set `user_id` from the session (not the client body).
- Rate limited.
- Profile snapshot / fallback for candidate fields keeps recruiter data on the application row.
- Profile picture URL is derived server-side from `show_profile_picture` + profile, not trusted raw from the client.
- Returns **201** with the created row.

**Improvement opportunities**

- Validate the body with a schema (required strings, URL formats for `cv_url` / `video_url` / portfolio / LinkedIn, slug format) before insert; return clear **400**s instead of relying on DB errors.
- Re-check slug uniqueness (or call the same helper as `/api/slug/validate`) inside this handler to close race windows between client validate and create.
- Ensure `cv_url` belongs to this app’s R2 public base **and** is an object the current user is allowed to attach (today any HTTPS string is stored; that enables later cross-user R2 deletes via PUT/DELETE — see those sections).
- Same auth vs non-auth error handling as GET (don’t treat all thrown errors as **401**).
- Map unique-constraint failures to **409** with a stable message.

---

### PUT applications

`PUT /api/applications`

Update an application owned by the current user. Replacing `cv_url` deletes the previous R2 object when the URL is under this app’s public R2 base (`deleteCvIfOurs`). `profile_picture_url` is re-resolved from the profile using `show_profile_picture`.

- **Auth:** Required
- **Rate limit:** Default (60/min)
- **Body:** `id` (required) plus partial `ApplicationUpdateInput` (`company`, `role`, `slug`, `cv_url`, `video_url`, `is_active`, candidate fields, `slugNamePosition`, `cv_filename`, `use_original_cv_filename`, `show_profile_picture`)
- **Success:** `200` `{ data: Application }`
- **Errors:** `400`; `401`; `404` if missing or not owned; `429`

Note: `description` in the body is ignored (column removed in migration 017).

**What works**

- Auth + ownership check before update; **404** when missing or not owned (no existence leak across users beyond that).
- Rate limited.
- On `cv_url` change, deletes the **previous** R2 object only when `deleteCvIfOurs` confirms the URL is under `R2_PUBLIC_BASE_URL` (blocks deleting arbitrary non-R2 URLs).
- Re-resolves `profile_picture_url` from the profile using the show-picture preference.
- Maps `slugNamePosition` → `include_name_in_slug` instead of exposing the DB column name as the only contract.

**Improvement opportunities**

- Avoid spreading the raw body into the update payload (mass-assignment risk for fields like `user_id`, `view_count`, `download_count`). Whitelist allowed keys explicitly.
- Schema-validate partial updates; require `id` as a UUID.
- Validate new `cv_url` against the R2 public base when present.
- **CV object ownership:** `deleteCvIfOurs` only checks the public URL prefix, not whether the object belongs to this user/application. An authenticated user can set another user’s public CV URL on their own row (POST/PUT accept arbitrary `cv_url`), then replace or delete that application and remove the other user’s R2 object. Fix by tying uploads to the user (e.g. key prefix `cvs/{userId}/…`), rejecting `cv_url` values the caller did not upload, and/or authorizing the object key before `DeleteObject`.
- **Shared CV references:** the same R2 URL can appear on more than one application (idempotent upload reuse, or copying a URL). Replacing/deleting one row still `DeleteObject`s that key, so other apps that still reference it show a missing file (`cv_exists: false`). Before delete, count remaining `applications.cv_url` references (or use per-application / reference-counted objects).
- **Delete-before-update ordering:** on CV replacement the handler calls `deleteCvIfOurs(existing.cv_url)` **before** the Supabase update. If the update then fails (**400**), the row still points at `existing.cv_url` but the object is already gone. Persist the new `cv_url` first, then delete the old object only after a successful update.
- Improve error handling / logging (same catch-all **401** issue).
- Optionally return **409** on slug collisions instead of a generic **400**.

---

### DELETE applications

`DELETE /api/applications`

Hard-delete an application and its CV object in R2 (when the URL is under this app’s public R2 base).

- **Auth:** Required
- **Rate limit:** Default (60/min)
- **Query:** `id` (required)
- **Success:** `200` `{ success: true }`
- **Errors:** `400` missing id / DB error; `401`; `404` if missing or not owned; `429`

**What works**

- Auth + ownership check before delete.
- Rate limited.
- Cleans up the CV in R2 when the URL is under `R2_PUBLIC_BASE_URL` (`deleteCvIfOurs`).
- Requires an explicit `id` query param (fails closed if missing).

**Improvement opportunities**

- Validate `id` as a UUID before querying.
- Same CV risks as PUT: prefix-only `deleteCvIfOurs` allows deleting another user’s object if its public URL was stored on this row; shared URLs can orphan other applications. See PUT improvements (object ownership + reference checks).
- If R2 delete fails, log and decide whether to fail the request or proceed (today delete continues after `deleteCvIfOurs`; document or harden that policy).
- Same auth-vs-500 catch handling as other handlers.
- Consider soft-delete-only for some clients if hard delete is irreversible by design (archive already covers soft hide).

---

### GET application by slug

`GET /api/applications/[slug]`

Public fetch of one application by slug. Adds `cv_exists` when `cv_url` is set (R2 `HeadObject` check).

- **Auth:** Not required
- **Rate limit:** **120 requests / minute / IP**
- **Success:** `200` `{ data: Application & { cv_exists?: boolean } }`
- **Errors:** `404`; `429`; `500`

**What works**

- Public by design for shareable recruiter links; no login required.
- Per-IP rate limit (120/min) tuned for viewing while limiting scraping.
- `cv_exists` helps the UI avoid broken “View CV” links when the object is missing.
- Clear **404** when the slug does not exist.

**Improvement opportunities**

- Return a public DTO: omit `user_id` and any other owner-only fields from the response.
- Cache `cv_exists` or skip the HeadObject on every request if latency / R2 cost becomes an issue.
- For archived applications (`is_active = false`), consider a dedicated response shape vs full payload (page already handles archived UI).
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

`POST /api/applications/[slug]/view`

Record a page view. Owner views are acknowledged but **not** counted. Non-owner increments use the `increment_application_view_count` SECURITY DEFINER RPC via the service-role admin client (updates `view_count` and `last_viewed_at`). See [VIEW_COUNT_FIX.md](VIEW_COUNT_FIX.md).

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

`POST /api/applications/[slug]/download`

Record a CV download. Same owner-exclusion and RPC pattern as view (`increment_application_download_count`).

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

`GET /api/applications/[slug]/viewer-status`

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

Return the current user’s profile. If no row exists (`PGRST116`), inserts an empty profile and returns it.

- **Auth:** Required
- **Rate limit:** None
- **Success:** `200` `{ data: Profile }`
- **Errors:** `400` insert failed; `401`; `500`

**What works**

- Auth required; selects/inserts only by session `user_id`.
- Auto-creates a row when missing so the profile page never depends on a separate “init” call.
- Distinguishes “no row” (`PGRST116`) from other DB errors.

**Improvement opportunities**

- GET with insert side effect is surprising; prefer a dedicated ensure/create path or upsert on first PUT, and keep GET read-only.
- Add a rate limit; fix catch-all **401** vs **500**.
- Handle concurrent first-GET races (two inserts) more explicitly if unique violations appear.

---

### PUT profile

`PUT /api/profile`

Upsert profile fields. Requires non-empty `first_name` and `last_name` (after merge with existing). Validates `portfolio_url` and `linkedin_url` (http/https only). When `profile_picture_url` changes, deletes the previous Supabase Storage object (if ours) and syncs `applications.profile_picture_url` for rows where `show_profile_picture` is true. See [PROFILE_PICTURE.md](PROFILE_PICTURE.md).

- **Auth:** Required
- **Rate limit:** Default (60/min)
- **Body** (`ProfileUpdateInput`): Optional `first_name`, `last_name`, `location`, `portfolio_url`, `linkedin_url`, `profile_picture_url` — merged result must still have first and last name
- **Success:** `200` `{ data: Profile }`
- **Errors:** `400` missing names / invalid URL / upsert error; `401`; `429`

**What works**

- Auth required; upsert keyed by `user_id`.
- Rate limited.
- Keeps first/last name required after signup (editable on the profile page, not clearable to empty).
- Validates portfolio/LinkedIn URLs (http/https only) before write.
- Cleans up the previous profile picture in Storage when the URL changes (`deleteProfilePictureIfOurs`).
- Syncs `applications.profile_picture_url` for apps that opted into showing the picture.

**Improvement opportunities**

- Schema-validate all fields: max lengths for names/location, reject unexpected keys.
- When accepting `profile_picture_url`, require it to be under this user’s `profile-pictures` path (not an arbitrary URL).
- If Storage delete or applications sync fails, log and surface a partial-failure strategy instead of silent continuation.
- Same auth-vs-500 error handling improvement.

---

## Slugs

### POST slug

`POST /api/slug`

Derive a slug from company/role (and optional name-in-URL rules) via `reserveBaseSlug`. Returns **409** if that exact slug is already taken (no numeric suffix). Optional `excludeId` ignores the current row when editing.

- **Auth:** **Not required** (consider tightening for production)
- **Rate limit:** Default (60/min)
- **Body:** `company`, `role` (required); optional `excludeId`, `first_name`, `last_name`, `slugNamePosition` (`"start"` | `"end"`)
- **Success:** `200` `{ slug: string }`
- **Errors:** `400` missing company/role; `409` collision; `429`; `500`

**What works**

- Rate limited.
- Requires `company` and `role` before generating.
- Uses shared `reserveBaseSlug` / `SlugCollisionError` for consistent slug rules and a clear **409** when taken.
- Supports name-in-URL positions and `excludeId` for edit flows without inventing numeric suffixes.

**Improvement opportunities**

- **Require auth** (highest priority): aligns with `/api/slug/validate` and stops anonymous slug probing / enumeration.
- Validate and sanitize inputs (non-empty trimmed strings, max lengths, allowed `slugNamePosition` values, UUID `excludeId`).
- When authenticated + `excludeId`, verify the excluded application belongs to the current user.
- Log unexpected failures before returning **500**.

---

### POST slug validate

`POST /api/slug/validate`

Check format and uniqueness of a proposed slug (used when the user edits the slug field manually). Invalid or taken slugs return **200** with `{ ok: false, error }` (not 4xx), so the client can show inline feedback.

- **Auth:** Required
- **Rate limit:** Default (60/min)
- **Body:** `slug` (string); optional `excludeId` (string, max 64 chars)
- **Success:** `200` `{ ok: true }` or `200` `{ ok: false, error: string }`
- **Errors:** `401`; `429`; `500` `{ ok: false, error }`

**What works**

- Auth required (unlike `/api/slug`).
- Rate limited.
- Dedicated auth try/catch returns **401** before business logic.
- Shared `validateSlugForApplication` covers format + uniqueness.
- **200** + `{ ok: false, error }` is a deliberate UX contract for inline form feedback.
- Sanitizes `excludeId` (type/length) before use.

**Improvement opportunities**

- When `excludeId` is present, verify ownership so users cannot use another user’s id to “exclude” a collision check.
- Tighten `excludeId` to UUID format (not only length ≤ 64).
- Optionally rate-limit more tightly (debounced UI still fires often).
- Keep the intentional **200** + `{ ok: false }` contract documented for API clients.

---

## Uploads

### POST upload CV

`POST /api/upload`

Upload a CV PDF to Cloudflare R2. Requires an idempotency key so retries reuse the same object. Full details: [PDF_AND_R2.md](PDF_AND_R2.md).

- **Auth:** Required
- **Rate limit:** Default (60/min)
- **Body:** `multipart/form-data` with `file` (PDF, max **10 MB**)
- **Idempotency:** Header `Idempotency-Key` / `idempotency-key`, or form field `idempotency_key`: 8–128 chars, `[a-zA-Z0-9_-]` only. Object key: `cvs/idempotency/<key>.pdf`. If the object already exists → `{ url, idempotent: true }` without re-upload.
- **Success:** `200` `{ url: string, idempotent: boolean }`
- **Errors:** `400` missing/invalid file or key; `401`; `429`; `500` (R2 not configured / upload failure)

**What works**

- Auth required (dedicated check before processing).
- Rate limited.
- Restricts to PDF MIME type and **10 MB** max size.
- Idempotency key normalized and validated; HeadObject replay returns the same URL without re-upload.
- Fails clearly when R2 is not configured; logs upload/config errors server-side.

**Improvement opportunities**

- Verify PDF magic bytes (`%PDF`), not only `Content-Type`, to block disguised uploads.
- Scope idempotency keys per user (e.g. `cvs/{userId}/idempotency/<key>.pdf`) so one user cannot overwrite/replay another’s key if keys collide.
- Cap concurrent uploads per user; consider a lower rate limit than general writes.
- On idempotent hit, optionally verify the existing object size/type matches expectations.

---

### POST upload profile picture

`POST /api/upload/profile-picture`

Upload a profile image to the Supabase Storage bucket `profile-pictures` at `{user_id}/{uuid}.{ext}`. Returns a public URL; the client typically then PUTs it to `/api/profile`. See [PROFILE_PICTURE.md](PROFILE_PICTURE.md).

- **Auth:** Required
- **Rate limit:** Default (60/min)
- **Body:** `multipart/form-data` with `file` (JPEG, PNG, or WebP; max **5 MB**)
- **Success:** `200` `{ url: string }`
- **Errors:** `400` missing/invalid file; `401`; `429`; `500`

**What works**

- Auth required; object path is prefixed with the session `user_id` (matches Storage RLS expectations).
- Rate limited.
- Allows only JPEG/PNG/WebP and enforces a **5 MB** cap.
- Uses a random UUID filename to avoid predictable overwrites.
- Returns the public URL for a follow-up profile PUT.

**Improvement opportunities**

- Validate image magic bytes / decode with a safe image library, not MIME alone.
- Optionally delete previous avatar as part of this upload (today cleanup happens on profile PUT) to avoid orphan objects if the client never saves.
- Enforce a single canonical filename (e.g. `avatar.webp`) with overwrite, or a retention policy for old UUIDs.
- Fix catch-all **401** vs **500**; log Storage errors with codes.

---

## Auth

Auth handlers use `createSupabaseRouteClient` so `Set-Cookie` is applied on the JSON response. See [SUPABASE_AUTH_SETUP.md](SUPABASE_AUTH_SETUP.md).

### POST auth login

`POST /api/auth/login`

- **Auth:** Not required
- **Rate limit:** **5 / minute / IP**
- **Body:** `{ email, password }`
- **Success:** `200` `{ success: true }` (+ session cookies). Also upserts a `profiles` row from Auth `user_metadata` first/last name when present (covers users whose confirmation callback missed profile creation).
- **Errors:** `400` missing fields; `401` bad credentials; `429`; `500` no session

**What works**

- Strict per-IP rate limit (**5/min**) to blunt brute force.
- Requires both email and password before calling Supabase.
- Uses the route client so session cookies land on the response (middleware can read them next request).
- Ensures a profiles row after login when signup names exist in `user_metadata`.
- Distinguishes missing fields (**400**), auth failure (**401**), and missing session (**500**).

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

`emailRedirectTo` is set to `{origin}/auth/callback`. First/last name are stored in Auth `user_metadata` so they survive email confirmation. When confirmation is required, the response **preserves PKCE cookies** from `signUp` so `/auth/callback` can exchange the email link code.

**Side effects**

- When a session is issued immediately (Confirm email OFF), upserts a `profiles` row with `user_id`, `first_name`, and `last_name`.
- When confirmation is required (no session), profile creation is deferred to `GET /auth/callback` after the user confirms (reads names from `user_metadata`).

**What works**

- Same tight **5/min** rate limit as login.
- Requires email, password confirmation, and first/last name; uses the route client for cookies when a session exists.
- Explicit `requiresConfirmation` flag so the UI can guide email-confirm flows.
- Sets `emailRedirectTo` to `/auth/callback` on the current origin.
- Seeds the profiles table with names at signup or confirmation so new users are not blank on the profile page.

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

- `lib/types/application.ts` — `Application`, `ApplicationListItem`, `ApplicationListResponse`, `ApplicationCreateInput`, `ApplicationUpdateInput`
- `lib/types/profile.ts` — `Profile`, `ProfileUpdateInput`

Client helpers for some application calls: `lib/api/applications.ts`.
