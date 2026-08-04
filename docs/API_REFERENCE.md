# MyHireView — API Reference

Standalone catalog of Next.js App Router API routes under `app/api/`. For architecture, data model, and request flows, see [ARCHITECTURE.md](ARCHITECTURE.md) and [DATA_FLOW.md](DATA_FLOW.md).

Each endpoint lists **What works** (practices already in place) and either **Improvement opportunities** (follow-ups still to implement) or **Deferred priorities** (accepted polish, often as a priority table). When an item ships, move it into **What works** so this doc stays a living checklist.

In the table of contents, endpoint status is marked with a colored dot:

- 🟢 — no open improvement opportunities
- 🟠 — remaining items are deferred / not planned for now (known limitations accepted)
- 🔴 — one or more improvements still to implement

---

## Table of contents

- [Conventions](#conventions)
- [Applications](#applications)
  - 🟠 [GET applications](#get-applications) — `GET /api/applications`
  - 🟠 [POST applications](#post-applications) — `POST /api/applications`
  - 🟠 [PUT applications](#put-applications) — `PUT /api/applications`
  - 🟢 [DELETE applications](#delete-applications) — `DELETE /api/applications`
  - 🟢 [GET application by public path](#get-application-by-public-path) — `GET /api/applications/[publicId]/[slug]`
  - 🟢 [GET application by id](#get-application-by-id) — `GET /api/applications/by-id/[id]`
  - 🟠 [POST application view](#post-application-view) — `POST /api/applications/[publicId]/[slug]/view`
  - 🟠 [POST application download](#post-application-download) — `POST /api/applications/[publicId]/[slug]/download`
- [Profile](#profile)
  - 🟢 [GET profile](#get-profile) — `GET /api/profile`
  - 🟠 [PUT profile](#put-profile) — `PUT /api/profile`
  - 🟢 [GET profile primary CVs](#get-profile-primary-cvs) — `GET /api/profile/primary-cvs`
  - 🟢 [POST profile primary CV](#post-profile-primary-cv) — `POST /api/profile/primary-cvs`
  - 🟠 [DELETE profile primary CV](#delete-profile-primary-cv) — `DELETE /api/profile/primary-cvs`
- [Slugs](#slugs)
  - 🟢 [POST slug](#post-slug) — `POST /api/slug`
  - 🟠 [POST slug validate](#post-slug-validate) — `POST /api/slug/validate`
- [Uploads](#uploads)
  - 🟠 [POST upload CV](#post-upload-cv) — `POST /api/upload`
  - 🟠 [POST upload profile picture](#post-upload-profile-picture) — `POST /api/upload/profile-picture`
- [Auth](#auth)
  - 🔴 [POST auth login](#post-auth-login) — `POST /api/auth/login`
  - 🔴 [POST auth signup](#post-auth-signup) — `POST /api/auth/signup`
  - 🔴 [POST auth logout](#post-auth-logout) — `POST /api/auth/logout`
- [Waitlist](#waitlist)
  - 🔴 [POST waitlist](#post-waitlist) — `POST /api/waitlist`
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

Cross-cutting: schema validation at the boundary (e.g. Zod); `handleApiError` in `lib/api/handle-api-error.ts` logs unexpected failures server-side (optional log-only `meta` for ops fields like slug / error code) and returns a generic JSON error (used on public application routes and by-id GET); a shared `withAuth` wrapper is still open so auth failures are not confused with other errors. See also [CODE_REVIEW.md](CODE_REVIEW.md).

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
| `data[].cv_exists`      | `boolean`                               | Dashboard “CV missing” badge when **false**. URLs outside our R2 public base default to **true** (unchecked). |
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
- `normalizeListSearchQuery` caps length and strips common PostgREST/`ilike` metacharacters (`%`, `_`, commas, parens, etc.) before building the `or` filter.

**Deferred priorities**

| Priority | Area | Item | Notes |
| -------- | ---- | ---- | ----- |
| Medium | Correctness | Escape `q` quotes for PostgREST | `normalizeListSearchQuery` does not strip `"`, but the filter wraps the pattern in double quotes (`company.ilike."%…%"`). A search containing `"` can break the filter and yield **500** instead of matches. Escape or remove quotes (and any other reserved filter chars) before interpolating `q`. |
| Medium | Correctness | Distinguish missing CV vs HeadObject failure | `checkCvObjectExists` returns `false` for any R2/credentials/`HeadObject` error, so a transient outage surfaces as `cv_exists: false` (dashboard “CV missing” badge). Return `false` only for not-found; treat other failures as unchecked (`undefined` / omit / keep present) so the badge retains its meaning. Same helper on by-id and public GETs. |

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

**Deferred priorities**

| Priority | Area | Item | Notes |
| -------- | ---- | ---- | ----- |
| High | Correctness | Canonical tailored URL / object-key uniqueness | `isTailoredCvUrlInUse` compares raw `cv_url` strings. Equivalent percent-encoded R2 URLs can attach one object to multiple applications; deleting/replacing one then breaks the other. Canonicalize to the object key (or a normalized URL) before compare/store. |
| High | Correctness | Atomic tailored-URL uniqueness | Check-then-insert is not atomic: concurrent creates can both pass `isTailoredCvUrlInUse` and insert. Enforce per-user uniqueness for the canonical tailored object key at the DB/transaction boundary (like slug’s `UNIQUE (user_id, slug)` race backstop). |
| High | Security | Same-user ownership for `primary_cv_id` at DB | API resolves via `resolvePrimaryCvForUser` (`id` + `user_id`), but `applications.primary_cv_id` only FKs `primary_cvs(id)`. Owner UPDATE RLS still allows attaching another user’s primary UUID if known. New migration: composite ownership FK (or trigger) on `(primary_cv_id, user_id)` → `primary_cvs(id, user_id)`, keeping `ON DELETE SET NULL`. Same gap on PUT. |

---

### PUT applications

`PUT /api/applications`

Update an application owned by the current user. Replacing a tailored `cv_url` deletes the previous tailored R2 object when it belongs to the caller (`deleteApplicationCvIfTailored` / `deleteCvIfOurs`). Primary library objects are never deleted here. Updates `show_profile_picture` when provided (avatar still comes from the profile at view time).

- **Auth:** Required
- **Rate limit:** Default (60/min)
- **Body** (`ApplicationUpdateInput`, Zod `applicationUpdateSchema`): `id` (UUID, required) plus optional partial fields (`company`, `role`, `slug`, `cv_url`, `video_url`, `status`, `cv_type`, `primary_cv_id`, candidate fields, `slugNamePosition`, `cv_filename`, `use_original_cv_filename`, `show_profile_picture`). Unexpected keys → **400**. Setting `status` to `archived` sets `archived_at` (resets clock); `active`/`draft` clears `archived_at`.
- **Success:** `200` `{ data: Application }`
- **Errors:** `400` schema / insert-style validation / primary CV missing; `401`; `404` if missing or not owned; `409` slug collision or tailored `cv_url` already used; `429`; `500` unexpected failures

**What works**

- Auth required; dedicated auth try/catch → **401**; unexpected failures → **500** with server log (not mislabeled as unauthorized).
- Rate limited.
- **Schema validation** (`applicationUpdateSchema`): UUID `id`; optional trimmed fields / http(s) URLs / slug format; enums; rejects unexpected keys (blocks mass-assignment of `user_id`, counters, etc.).
- Ownership check before update; **404** when missing or not owned.
- When `slug` is provided, re-checks uniqueness via `validateSlugForApplication` (exclude current id); Postgres `23505` → **409** with `SLUG_COLLISION_USER_MESSAGE`.
- On tailored `cv_url` change: persists the new URL first, then deletes the previous R2 object only after a successful update (`deleteApplicationCvIfTailored`). Primary library objects are never deleted here.
- Rejects a new tailored `cv_url` that is not a caller-owned tailored upload (**400**), or that is already used by another of the caller’s applications (**409**). Keeping the same `cv_url` on the current row is allowed. Switching to **primary** resolves URL from the caller’s `primary_cvs` library via `primary_cv_id`.
- Persists `show_profile_picture` when provided (public view uses live profile picture).
- Maps `slugNamePosition` → `include_name_in_slug` instead of exposing the DB column name as the only contract.

**Deferred priorities**

| Priority | Area | Item | Notes |
| -------- | ---- | ---- | ----- |
| High | Correctness | Filename-only edit on primary CV | `cvFieldsTouched` includes `cv_filename`. For an existing primary app, the primary branch requires `body.primary_cv_id` and does not fall back to the row’s current id (select also omits `primary_cv_id`). A filename-only PUT → **400**. Preserve existing `primary_cv_id`, or handle filename-only updates without requiring a new primary selection (and without blindly overwriting a custom `cv_filename` with the library filename when that is not intended). |
| High | Correctness | Canonical / atomic tailored URL uniqueness | Same gaps as create: string `.eq("cv_url")` uniqueness and check-then-update races. Align with POST deferred items (canonical key + DB constraint). |
| High | Correctness | Allow-list tailored CV deletes only | `deleteApplicationCvIfTailored` skips only when `cvType === "primary"`, then calls `deleteCvIfOurs` (any owned primary or tailored key). Absent/`null` metadata or a tailored-typed row pointing at a primary library URL can delete a shared library PDF and break other apps. Restrict to `cvType === "tailored"` and/or delete only `cvs/{userId}/tailored/…` keys. Same helper on application DELETE. |
| High | Security | Same-user ownership for `primary_cv_id` at DB | Same as POST: API ownership check is solid; FK + owner UPDATE RLS do not enforce same-user. Ship composite FK / trigger in a forward migration (do not rewrite `022`/`024`). |
| Medium | Correctness | Enforce `status` ↔ `archived_at` in the database | This route sets/clears `archived_at` with `status`, but there is no CHECK or transition trigger. Direct PostgREST updates can archive without a timestamp (or set `archived_at` while `active`). Add a CHECK (archived iff `archived_at` IS NOT NULL) and/or a trigger that sets/clears on status transitions — **before** the 90-day purge cron relies on both columns ([Backlog](Backlog.md)). |

---

### DELETE applications

`DELETE /api/applications`

Hard-delete an application and its tailored CV object in R2 (when the URL belongs to the caller).

- **Auth:** Required
- **Rate limit:** Default (60/min)
- **Query:** `id` (UUID, required)
- **Success:** `200` `{ success: true }`
- **Errors:** `400` missing/invalid id / DB error; `401`; `404` if missing or not owned; `429`; `500` R2 cleanup failure or unexpected errors

**What works**

- Auth required; dedicated auth try/catch → **401**; unexpected failures → **500** with server log (not mislabeled as unauthorized).
- Rate limited.
- Validates `id` as a UUID before querying (**400** if missing or malformed).
- Ownership check before delete; **404** when missing or not owned.
- **Fail-closed R2 cleanup:** for tailored CVs, deletes the R2 object first (`deleteApplicationCvIfTailored` → `deleteCvIfOurs`). If R2 delete fails → **500** and the DB row is **not** removed (no orphaned “deleted” apps with leftover PDFs). Primary library objects are never deleted here.
- Only then deletes the applications row.
- Archive (`PUT` `status: archived`) remains the reversible soft-hide; hard `DELETE` is intentional and irreversible. A possible later alternative (middle-ground delete + orphan tailored-CV cron) is noted in [PDF_AND_R2.md](PDF_AND_R2.md).

**Deferred priorities**

| Priority | Area | Item | Notes |
| -------- | ---- | ---- | ----- |
| High | Correctness | Allow-list tailored CV deletes only | Same as PUT: `deleteApplicationCvIfTailored` is deny-list on `"primary"` and then deletes any owned R2 key. Missing metadata or a primary-path URL under non-primary `cv_type` can remove a library PDF used by other applications. Require `cvType === "tailored"` and/or tailored-prefix keys only. |
| High | Correctness | Fail closed when R2 public base is unset | `getCvObjectKeyFromPublicUrl` catches a missing `R2_PUBLIC_BASE_URL` and returns `null`, so `deleteCvIfOurs` no-ops and the applications row is still deleted — leaving the PDF in R2 and breaking the documented fail-closed cleanup. Propagate storage configuration errors on the delete path so the handler can return **500** and skip the DB delete. |

---

### GET application by public path

`GET /api/applications/[publicId]/[slug]`

Public fetch of one application by the owner’s opaque `public_id` and per-user `slug`. Adds `cv_exists` when `cv_url` is an R2 public URL (`HeadObject`). URLs outside our R2 public base omit `cv_exists` so the UI does not treat them as missing. See [PUBLIC_URL_OPTION_B.md](PUBLIC_URL_OPTION_B.md).

- **Auth:** Not required
- **Rate limit:** **120 requests / minute / IP**
- **Success:** `200` `{ data: PublicApplicationResponse }` — either the full recruiter DTO (`PublicApplication`, `status: "active"`) or `{ status: "unavailable" }` when the row exists but must not expose content (`archived` or `draft`). Omits `user_id`, analytics, storage FKs, and other owner-only fields.
- **Errors:** `404` when the public id + slug pair does not resolve (e.g. deleted or never existed); `429`; `500`

**What works**

- Public by design for shareable recruiter links; no login required.
- Per-IP rate limit (120/min) tuned for viewing while limiting scraping.
- Active apps return a **public DTO** (`toPublicApplication`): company/role, candidate identity & links, avatar, CV/video media, `status: "active"`, and optional `cv_exists` — not the full applications row.
- **Unavailable stub:** archived and draft apps return `{ status: "unavailable" }` only (no PII or media). Skips R2 `HeadObject`. The public view page shows one empty state for unavailable **and** for **404** (deleted / unknown URL).
- `cv_exists` helps the UI avoid broken “View CV” links when an **R2** object is missing (active apps only). Omitted for non-R2 URLs.
- Clear **404** when the public id + slug pair does not resolve.
- Invalid `publicId` or slug format is rejected in `resolvePublicApplication` before any DB query (same helper as view / download).

**Deferred priorities**

| Priority | Area | Item | Notes |
| -------- | ---- | ---- | ----- |
| High | Correctness | SSR public view vs per-IP rate limit | `/view/[publicId]/[slug]` loads this route via server `fetch` (`getBaseUrl()` + `/api/…`) without forwarding the visitor’s IP. `getClientIdentifier` then buckets those requests under the server IP or `"unknown"`, so traffic across visitors shares one **120/min** window and can return **429** → page error. Prefer calling `resolvePublicApplication` (and the same DTO/`cv_exists` path) directly from the RSC, or otherwise exempt/internal-tag this server-side load so the public-IP limiter only applies to real client hits. |
| High | Observability | Propagate resolve DB errors as 5xx | `resolvePublicApplication` returns `null` when `profileError` or `appError` is set (same as missing row). Callers map `null` → **404** “not found”, so a transient Supabase outage looks like a missing application. Keep missing-row → `null` / **404**; rethrow or surface query errors so `handleApiError` can return **500**. Shared by view and download POSTs. |
| Medium | Correctness | Distinguish missing CV vs HeadObject failure | Same as list GET: `checkCvObjectExists` maps any HeadObject failure to `cv_exists: false`. Prefer not-found → `false`, other failures → omit / unchecked. |
| Medium | Security | `toPublicApplication` status footgun | This route correctly uses `toPublicApplicationResponse` (archived/draft → `{ status: "unavailable" }`). The lower-level `toPublicApplication` always emits a full DTO with `status: "active"` and its JSDoc incorrectly claims it returns the unavailable stub for non-active rows. If called directly later, candidate PII/media leak. Enforce the status check in the helper (or change return type to `PublicApplicationResponse`), or narrow the input to active-only and fix the docs. |

---

### GET application by id

`GET /api/applications/by-id/[id]`

Owner-only fetch for the edit page. Same `cv_exists` behaviour as the public slug GET.

- **Auth:** Required
- **Rate limit:** Default (60/min)
- **Success:** `200` `{ data: Application & { cv_exists?: boolean } }`
- **Errors:** `400` invalid UUID; `401`; `404` if missing or not owned; `429`; `500` `{ error: "Failed to fetch application" }`

**What works**

- Auth required; filters by both `id` and `user_id` so owners cannot load another user’s row.
- Dedicated by-id endpoint avoids fetching the full list just to edit one application.
- Same `cv_exists` enrichment as the public slug GET for consistent edit UX.
- Rate limited (default 60/min) before auth/query work — same as other authenticated application/profile reads.
- Validates `id` as a UUID (**400** when malformed) before querying.
- Auth failures stay **401**; unexpected errors are logged via `handleApiError` and return **500**.

**Deferred priorities**

| Priority | Area | Item | Notes |
| -------- | ---- | ---- | ----- |
| Medium | Correctness | Distinguish missing CV vs HeadObject failure | Same as list / public GET (`checkCvObjectExists`). |

---

### POST application view

`POST /api/applications/[publicId]/[slug]/view`

Record a page view. Owner views are acknowledged but **not** counted. Non-owner increments use the `increment_application_view_count(p_public_id, p_slug)` SECURITY DEFINER RPC via the service-role admin client (updates `view_count` and `last_viewed_at`). See [VIEW_COUNT_FIX.md](VIEW_COUNT_FIX.md).

- **Auth:** Not required (session used only to detect owner)
- **Rate limit:** Default (60/min) per IP, plus **10/min per IP per application path**
- **Success:** `200` `{ success: true }`
- **Errors:** `403` (missing/foreign origin signal); `404`; `429`; `500`

**What works**

- Owner self-views are detected via session and excluded from the count.
- Increments go through a SECURITY DEFINER RPC with the service-role client (avoids RLS update issues for anonymous viewers).
- Rate limited (per IP and stricter per IP+`publicId`/`slug`); returns a simple `{ success: true }` contract.
- Also updates `last_viewed_at` for non-owner views.
- Archived / draft apps return **404** (same as missing) and are **not** counted when the request reaches resolve / visibility checks.
- Invalid `publicId` or slug format returns **404** without querying the database (`resolvePublicApplication` + `validateSlugFormat`).
- **Server-side dedupe:** after a successful ack (owner skip or RPC), sets an httpOnly cookie (`mhv_view_{publicId}_{slug}`, 24h). Repeat POSTs with that cookie return **200** without resolving or incrementing. Client `sessionStorage` remains a UX optimization only.
- RPC failures log `publicId` / `slug` / PostgREST `code` via `handleApiError` `meta` (server-only); the client still sees a generic message.
- **Same-origin gate:** requires matching `Origin`, allowed `Referer` origin, or `Sec-Fetch-Site: same-origin` (**403** otherwise). Defense in depth only — forgeable with crafted clients.

**Deferred / known limitations**

- Cookie dedupe is best-effort (cleared cookies / other browsers still count); Redis-backed tokens would harden multi-instance enforcement alongside the in-memory rate limiter. **Not planned for now.**
- **Dedupe before visibility:** if a prior view cookie is present, the handler returns **200** without resolving the app — so a path that was active when the cookie was set can still ack after the app becomes archived / draft (or is deleted), instead of **404**. Resolve and validate public visibility before the short-circuit (or re-check status on the repeat path). **Not planned for now.**
- **Per-path rate-limit map growth (Medium / Security):** `checkPerSlugRateLimit` runs before format validation and keys the process-wide Map as `${ip}:${publicId}:${slug}`. `prune` only deletes the key being checked, so unique invalid paths are never revisited and entries accumulate until process restart (attacker-controlled high cardinality). The default per-IP limit slows one client (~60 new keys/min) but does not bound growth. Interim: validate/normalize `publicId` + slug (`isValidPublicId` / `validateSlugFormat`) before constructing the key, and/or add global TTL / capacity sweep on the store. Long-term: durable limiter in [Backlog](Backlog.md). Same on download.

---

### POST application download

`POST /api/applications/[publicId]/[slug]/download`

Record a CV download. Same owner-exclusion and RPC pattern as view (`increment_application_download_count(p_public_id, p_slug)`).

- **Auth:** Not required (session used only to detect owner)
- **Rate limit:** Default (60/min) per IP, plus **10/min per IP per application path**
- **Success:** `200` `{ success: true }`
- **Errors:** `403` (missing/foreign origin signal); `404`; `429`; `500`

**What works**

- Mirrors the view-count pattern: owner excluded, SECURITY DEFINER RPC, service-role client.
- Rate limited (per IP and per IP+path); consistent `{ success: true }` response.
- Keeps download analytics aligned with view analytics for the dashboard.
- Archived / draft apps return **404** and are **not** counted when the request reaches resolve / visibility checks.
- Invalid `publicId` or slug format returns **404** without querying the database (same early check as view).
- Same **httpOnly dedupe cookie** pattern as view (`mhv_download_{publicId}_{slug}`, 24h).
- RPC failures log path + `code` via `handleApiError` `meta` (same as view); client message stays generic.
- Same **same-origin gate** as view (`Origin` / `Referer` / `Sec-Fetch-Site`) → **403** when absent or foreign.

**Deferred / known limitations**

- Same cookie / in-memory rate-limit caveats as view. **Not planned for now.**
- **Dedupe before visibility:** if a prior download cookie is present, the handler returns **200** without resolving the app — so a path that was active when the cookie was set can still ack after the app becomes archived / draft (or is deleted), instead of **404**. Resolve and validate public visibility before the short-circuit (or re-check status on the repeat path). Does not increment counts and does not serve the CV; still a contract mismatch with the documented unavailable → **404** behavior. **Not planned for now.**
- **Per-path rate-limit map growth:** Same as view — `checkPerSlugRateLimit` before path validation + prune-only-on-access allows unbounded Map growth from unique invalid paths.

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
- Syncs Auth `user_metadata` (`first_name`, `last_name`, `public_id`) when DB names change or Auth `public_id` is out of sync; sync failures become `warnings` while still returning **200** + `data`.

**Deferred priorities**

| Priority | Area | Item | Notes |
| -------- | ---- | ---- | ----- |
| High | Correctness | Picture-only first save without profiles row | `/admin/new` exposes **Add profile picture** when no `profiles` row exists (signup insert failure / immediate-session gap — see signup Deferred). `ProfilePictureModal` PUTs only `{ profile_picture_url }`; with no existing row, merge leaves `first_name`/`last_name` empty → **400**. Bootstrap names (and `public_id`) from Auth `user_metadata` on create-on-first-save, or require the modal/client to send names so the upsert can succeed. |
| Medium | Correctness | Repairable Auth name sync | Metadata sync runs only when DB `first_name`/`last_name` change (or Auth `public_id` ≠ profile `public_id`). After a failed `updateUser`, the profiles row already has the new names, so retrying the same unchanged PUT skips sync and leaves Auth metadata stale. Also compare normalized Auth `user_metadata` names (same idea as `public_id`) so a no-op profile save can still repair metadata. |
| High | Security | Validate profile-picture URL origin | `isOwnedProfilePictureUrl` / `getProfilePictureStoragePath` accept any HTTPS host whose pathname matches `/storage/v1/object/public/profile-pictures/{userId}/…`. An authenticated user can save an external URL that still looks “owned,” so public application pages load that host’s image for viewers. Require the parsed URL origin to match `NEXT_PUBLIC_SUPABASE_URL` (in addition to the user-folder path) before accepting. |

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

**Deferred priorities**

| Priority | Area | Item | Notes |
| -------- | ---- | ---- | ----- |
| Medium | Correctness | Atomic primary-library cap | Count-then-insert is not atomic: concurrent `POST`s can both pass the `PRIMARY_CV_MAX_PER_USER` check and exceed five rows. Enforce with a DB trigger / advisory lock (or equivalent serialised insert). Prefer not hard-coding `5` in the schema if Premium will raise the limit ([PRICING_AND_MEMBERSHIP.md](PRICING_AND_MEMBERSHIP.md)). |

---

### DELETE profile primary CV

`DELETE /api/profile/primary-cvs?id=…`

Remove a primary CV from the library and delete its R2 object. Applications that still reference it keep the URL but show **CV missing** on the dashboard until edited.

- **Auth:** Required
- **Rate limit:** Default (60/min)
- **Query:** `id` (required, primary CV UUID)
- **Success:** `200` `{ success: true, applications_affected: number }`
- **Errors:** `400` missing id / DB error; `401`; `404` not found or not owned; `429`; `500` if R2 cleanup fails

**What works**

- Auth + ownership check before delete.
- **Fail closed:** deletes the R2 object first (`deleteCvIfOurs`); on R2 failure → **500** and the library row is left intact. Then deletes the `primary_cvs` row.
- Returns `applications_affected` count for confirm UX (client may show this before calling DELETE).

**Deferred priorities** (fail-closed R2-first is intentional to avoid orphan PDFs; remaining gap is the inverse failure mode — see [PDF_AND_R2.md](PDF_AND_R2.md))

| Priority | Area | Item | Notes |
| -------- | ---- | ---- | ----- |
| Medium | Correctness | Durable two-step delete | R2 is deleted before the `primary_cvs` row. If the DB delete then fails, the library entry still points at a permanently missing file (client sees **400** while storage is already gone). Prefer a consistent strategy: e.g. soft-delete / tombstone the row, retryable R2 cleanup, then hard-delete — or DB-first + orphan cleanup cron (middle-ground path in [PDF_AND_R2.md](PDF_AND_R2.md)). |

---

## Slugs

### POST slug

`POST /api/slug`

Derive a slug from company/role (and optional name-in-URL rules) via `reserveBaseSlug`. Generated slugs are clamped to **128** characters (same limit as `validateSlugFormat`). Returns **409** if that exact slug is already taken **for the current user** (no numeric suffix). Optional `excludeId` ignores the current row when editing. Slugs are unique per user (`UNIQUE (user_id, slug)`), not globally.

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

**Deferred priorities**

| Priority | Area | Item | Notes |
| -------- | ---- | ---- | ----- |
| Medium | Correctness | Preserve name when clamping long slugs | `generateSlug` clamps company+role to 128 before `buildSlug` appends/prepends the name, then clamps again. With `slugNamePosition: "end"`, a long company/role base can consume the full budget so the candidate name is truncated away. Keep the untruncated base until after combining with the name, then clamp the final slug while retaining the requested name segment where possible. Same helpers power the create/edit form live preview. |

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

**Deferred priorities**

| Priority | Area | Item | Notes |
| -------- | ---- | ---- | ----- |
| Medium | Rate limit | Route-scoped limiter key | `checkRateLimit` stores by client IP only, so `SLUG_VALIDATE_RATE_LIMIT` (**30/min**) shares the same counter as other routes that call `checkRateLimit` (e.g. default **60/min** APIs). Unrelated traffic can exhaust the bucket and **429** the first slug-validate call. Use a namespaced key (e.g. `slug-validate:${clientIp}` via `rateLimit`, like CV upload’s `cv-upload:${userId}`) so the advertised validate budget is independent. |

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

**Deferred priorities** (route contract is solid; polish when upload UX / ops become a pain — see [Backlog](Backlog.md) / [CODE_REVIEW.md](CODE_REVIEW.md); plus accepted auth-order and idempotency-identity edge cases)

| Priority | Area | Item | Notes |
| -------- | ---- | ---- | ----- |
| High | UX | Friendly status → form copy | Map **400** / **409** / **429** / **500** to clear field messages on Save (today `ApplicationForm` often surfaces raw `error` strings). |
| High | UX | Save-time busy feedback | While `POST /api/upload` runs inside submit, show explicit “Uploading CV…” (spinner / disabled Save). Fake “0%” progress was removed with upload-on-save; real % is optional. |
| High | Correctness | Auth before R2 config probe | R2 env probe runs before `requireAuth`. Unauthenticated callers get **500** “File upload is not configured” instead of **401** when config is missing, and learn that upload is misconfigured. Check auth first (same pattern as other protected routes). |
| High | Correctness | Stronger idempotent replay identity | HeadObject replay treats size + PDF MIME as identity via `existingObjectMatchesUpload` and skips magic-byte validation. Same key + same size/`application/pdf` can return the previous object even when bytes differ or the body is not a PDF. Prefer a content digest (e.g. compare request hash to stored metadata) and validate the body before accepting replay. |
| Medium | Observability | `handleApiError` + `meta` | Align R2/config failures with shared logging (`userId`, bytes, contentType, S3 status) — log-only; keep client messages generic. |
| Medium | UX | Retry after failure | On network/500, reuse the same idempotency key; generate a new key only when the file changes (form keeps key + client URL cache across identical reselection via file signature). |
| Lower | UX | Real upload progress % | `XMLHttpRequest` / streaming progress for large PDFs on slow networks. Prefer simple busy state first. |
| Lower | Observability | Metrics / correlation | Duration, size, `idempotent` rate, 409/429/5xx counts; optional request id in logs. Post-launch if support volume warrants. |

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

**Deferred priorities** (contract is fine; remaining work is UX / ops polish plus accepted storage-ordering edge cases)

| Priority | Area | Item | Notes |
| -------- | ---- | ---- | ----- |
| High | UX | Friendly status → form copy | Map **400** / **429** / **500** on profile Save to clear messages (size/type vs rate limit vs storage down). |
| High | UX | Surface upload `{ warning }` | API may return `{ warning }` when folder purge fails; `ProfileForm` today mainly surfaces **PUT** `/api/profile` `warnings`, not the upload warning. |
| High | Correctness | Defer folder purge until after profile URL commit | Upload runs `removeOtherProfilePicturesInFolder` before `PUT /api/profile`. If the extension/path changes and the PUT fails, the profile can still point at an object the upload already deleted. Prefer cleaning up the previous object only after the profile URL update succeeds (PUT already deletes the old path post-upsert when the URL changes). |
| Medium | Correctness | Serialize / gate concurrent replacements | Two concurrent uploads with different MIME/ext each write `avatar.<ext>`, list the folder, and purge the other’s path — both returned URLs can end up deleted. Mitigate with per-user serialization or purge only the previously committed profile path. |
| Medium | UX | Save-time busy feedback | Explicit “Uploading picture…” while `POST /api/upload/profile-picture` runs (form already has a loading flag — make copy/stage clear). |
| Medium | Observability | `handleApiError` + `meta` | Fold Storage failures into shared helper with `userId`, mime, bytes, `status`/`statusCode` in log-only `meta`. |
| Lower | Rate limit | Tighter picture upload cap | Optional: profile-picture-specific limit (closer to CV’s **10/min**) if abuse appears; default **60/min** is fine for now. |
| Lower | Observability | Metrics / correlation | Same as CV: duration, size, purge-warning rate, 5xx — post-launch if needed. |

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

`emailRedirectTo` is set to `{origin}/auth/callback`. First/last name and `public_id` are stored in Auth `user_metadata` and a `profiles` row is created via the service-role helper (`createInitialProfile`) — works with or without an immediate session. When confirmation is required, the response **preserves PKCE cookies** from `signUp` so `/auth/callback` can exchange the email link code. The callback also retries `createInitialProfile` idempotently (**confirmation path only**).

**Side effects**

- Creates a `profiles` row (`user_id`, `public_id`, `first_name`, `last_name`; other columns null). Failures are logged; signup still succeeds. When email confirmation is required, `/auth/callback` retries `createInitialProfile`. Immediate-session signups do not hit that callback (see Deferred).

**What works**

- Tight **5/min** rate limit (stricter than login’s **15/min**).
- Requires email, password confirmation, and first/last name; uses the route client for cookies when a session exists.
- Explicit `requiresConfirmation` flag so the UI can guide email-confirm flows.
- Sets `emailRedirectTo` to `/auth/callback` on the current origin.
- Seeds Auth `user_metadata` and inserts the initial profiles row (service role; idempotent).

**Deferred priorities**

| Priority | Area | Item | Notes |
| -------- | ---- | ---- | ----- |
| High | Correctness | Retry profile create for immediate sessions | On `createInitialProfile` failure, signup still returns success and the code comment assumes `/auth/callback` will retry. That retry only runs on the email-confirmation path. Immediate-session signups (`requiresConfirmation: false`) never hit the callback, so a failed insert can leave the user without a `profiles` row until an incidental path (e.g. `PUT /api/profile`, `ensureProfilePublicId` on app create). Add a post-signup/login bootstrap (or another explicit retry) so the signup profile invariant holds for both flows. |
| High | Correctness | Distinguish `user_id` vs `public_id` unique violations | `createInitialProfile` treats any Postgres `23505` as success (assumed signup/callback race on `user_id`). `profiles` also has `UNIQUE (public_id)`, so a rare opaque-id collision returns success with **no** row for the new user. Signup still proceeds and the callback only logs errors → later profile/application paths can fail. On `23505`, re-select by `input.userId` and return success only if that row exists; otherwise surface an error (and optionally regenerate `public_id` + retry). |
| Medium | Correctness | Validate Auth metadata `public_id` format | `publicIdFromUserMetadata` returns any non-empty trimmed string. Auth callback, `PUT /api/profile`, and `ensureProfilePublicId` (application create) will persist it, while public resolution rejects IDs outside `isValidPublicId` (`^[a-z0-9]{6,12}$`) — share URLs never resolve. Normal signup uses `generatePublicId()` (always valid); malformed metadata (manual edits, bugs) still slips through. Validate with `isValidPublicId` and generate a replacement when invalid before insert/upsert/return. |

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

- `lib/types/application.ts` — `Application`, `PublicApplication` / `UnavailablePublicApplication` / `PublicApplicationResponse`, `toPublicApplication` / `toPublicApplicationResponse`, `ApplicationListItem`, `ApplicationListResponse`, `ApplicationCreateInput`, `ApplicationUpdateInput`, `ApplicationCvType` (`"primary"` | `"tailored"`)
- `lib/validation/application.ts` — `applicationCreateSchema` / `formatApplicationCreateZodError` for `POST /api/applications`; `applicationUpdateSchema` / `formatApplicationUpdateZodError` for `PUT /api/applications`
- `lib/validation/slug.ts` — `slugReserveSchema` / `formatSlugReserveZodError` for `POST /api/slug`; `slugValidateSchema` / `formatSlugValidateZodError` for `POST /api/slug/validate`
- `lib/types/profile.ts` — `Profile`, `ProfileUpdateInput`
- `lib/types/primary-cv.ts` — `PrimaryCv`, `PrimaryCvApplicationPreview`, `PRIMARY_CV_MAX_PER_USER`

Client helpers for some application calls: `lib/api/applications.ts`.
