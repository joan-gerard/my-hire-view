# MyHireView — API Reference

Standalone catalog of Next.js App Router API routes under `app/api/`. For architecture, data model, and request flows, see [ARCHITECTURE.md](ARCHITECTURE.md) and [DATA_FLOW.md](DATA_FLOW.md).

---

## Conventions

| Topic | Behaviour |
| ----- | ---------- |
| **Base path** | All routes are under `/api/…` on the same origin as the app. |
| **Auth** | Session cookies (Supabase SSR). Handlers that need a user call `requireAuth()` from `lib/auth.ts` and return **401** `{ error: "Unauthorized" }` when there is no session. |
| **Content type** | JSON bodies unless noted (`multipart/form-data` for uploads). |
| **Success shape** | Often `{ data }` or `{ success: true }`. Endpoint sections below list specifics. |
| **Error shape** | `{ error: string }` (some endpoints also return `{ ok: false, error }`). |
| **Rate limiting** | Per IP via `lib/rate-limit.ts`. Exceeded limit → **429** with `Retry-After` and `{ error: "Too many requests. Please try again later." }`. |
| **Default write limit** | `DEFAULT_API_RATE_LIMIT`: **60 requests / minute / IP** (used by most write routes unless noted). |

Related deep-dives: [PDF_AND_R2.md](PDF_AND_R2.md) (CV upload), [PROFILE_PICTURE.md](PROFILE_PICTURE.md), [VIEW_COUNT_FIX.md](VIEW_COUNT_FIX.md).

---

## Endpoint index

| Endpoint | Methods | Auth | Rate limit | Purpose |
| -------- | ------- | ---- | ---------- | ------- |
| [`/api/applications`](#apiaapplications) | GET, POST, PUT, DELETE | Required | Default (writes) | List / create / update / delete own applications |
| [`/api/applications/[slug]`](#apiaapplicationsslug) | GET | No | 120/min | Public fetch by slug (+ `cv_exists`) |
| [`/api/applications/by-id/[id]`](#apiaapplicationsby-idid) | GET | Required | — | Owner fetch by id (+ `cv_exists`) |
| [`/api/applications/[slug]/view`](#apiaapplicationsslugview) | POST | No | Default | Increment view count (non-owners) |
| [`/api/applications/[slug]/download`](#apiaapplicationsslugdownload) | POST | No | Default | Increment download count (non-owners) |
| [`/api/applications/[slug]/viewer-status`](#apiaapplicationsslugviewer-status) | GET | No | — | `{ isOwner }` for current viewer |
| [`/api/profile`](#apiprofile) | GET, PUT | Required | Default (PUT) | Get / upsert user profile |
| [`/api/slug`](#apislug) | POST | **No** | Default | Derive slug from company/role; 409 if taken |
| [`/api/slug/validate`](#apislugvalidate) | POST | Required | Default | Format + uniqueness check for a proposed slug |
| [`/api/upload`](#apiupload) | POST | Required | Default | Upload CV PDF to Cloudflare R2 |
| [`/api/upload/profile-picture`](#apiuploadprofile-picture) | POST | Required | Default | Upload profile image to Supabase Storage |
| [`/api/auth/login`](#apiauthlogin) | POST | No | 5/min | Sign in; set session cookies |
| [`/api/auth/signup`](#apiauthsignup) | POST | No | 5/min | Sign up; set session cookies when confirmation not required |
| [`/api/auth/logout`](#apiauthlogout) | POST | No | 20/min | Sign out; clear session |
| [`/api/waitlist`](#apiwaitlist) | POST | No | 5/min | Pre-launch waitlist signup |

---

## Applications

### `GET /api/applications`

List the authenticated user’s applications (newest first).

| | |
| - | - |
| **Auth** | Required |
| **Rate limit** | None |
| **Success** | `200` `{ data: Application[] }` |

---

### `POST /api/applications`

Create an application. Candidate fields fall back to the user’s profile when omitted. When `show_profile_picture` is true, `profile_picture_url` is copied from the profile (otherwise null).

| | |
| - | - |
| **Auth** | Required |
| **Rate limit** | Default (60/min) |
| **Body** (`ApplicationCreateInput`) | `company`, `role`, `slug`, `cv_url`, `video_url` (required); optional `first_name`, `last_name`, `location`, `portfolio_url`, `linkedin_url`, `slugNamePosition` (`"start"` \| `"end"` \| `null` → stored as `include_name_in_slug`), `cv_filename`, `use_original_cv_filename` (default `true`), `show_profile_picture` |
| **Success** | `201` `{ data: Application }` |
| **Errors** | `400` insert/validation; `401`; `429` |

---

### `PUT /api/applications`

Update an application owned by the current user. Replacing `cv_url` deletes the previous R2 object when it belongs to this app. `profile_picture_url` is re-resolved from the profile using `show_profile_picture`.

| | |
| - | - |
| **Auth** | Required |
| **Rate limit** | Default (60/min) |
| **Body** | `id` (required) plus partial `ApplicationUpdateInput` (`company`, `role`, `slug`, `cv_url`, `video_url`, `is_active`, candidate fields, `slugNamePosition`, `cv_filename`, `use_original_cv_filename`, `show_profile_picture`) |
| **Success** | `200` `{ data: Application }` |
| **Errors** | `400`; `401`; `404` if missing or not owned; `429` |

Note: `description` in the body is ignored (column removed in migration 017).

---

### `DELETE /api/applications`

Hard-delete an application and its CV object in R2 (when the URL is ours).

| | |
| - | - |
| **Auth** | Required |
| **Rate limit** | Default (60/min) |
| **Query** | `id` (required) |
| **Success** | `200` `{ success: true }` |
| **Errors** | `400` missing id / DB error; `401`; `404` if missing or not owned; `429` |

---

### `GET /api/applications/[slug]`

Public fetch of one application by slug. Adds `cv_exists` when `cv_url` is set (R2 `HeadObject` check).

| | |
| - | - |
| **Auth** | Not required |
| **Rate limit** | **120 requests / minute / IP** |
| **Success** | `200` `{ data: Application & { cv_exists?: boolean } }` |
| **Errors** | `404`; `429`; `500` |

---

### `GET /api/applications/by-id/[id]`

Owner-only fetch for the edit page. Same `cv_exists` behaviour as the public slug GET.

| | |
| - | - |
| **Auth** | Required |
| **Rate limit** | None |
| **Success** | `200` `{ data: Application & { cv_exists?: boolean } }` |
| **Errors** | `401`; `404` if missing or not owned |

---

### `POST /api/applications/[slug]/view`

Record a page view. Owner views are acknowledged but **not** counted. Non-owner increments use the `increment_application_view_count` SECURITY DEFINER RPC via the service-role admin client (updates `view_count` and `last_viewed_at`). See [VIEW_COUNT_FIX.md](VIEW_COUNT_FIX.md).

| | |
| - | - |
| **Auth** | Not required (session used only to detect owner) |
| **Rate limit** | Default (60/min) |
| **Success** | `200` `{ success: true }` |
| **Errors** | `404`; `429`; `500` |

---

### `POST /api/applications/[slug]/download`

Record a CV download. Same owner-exclusion and RPC pattern as view (`increment_application_download_count`).

| | |
| - | - |
| **Auth** | Not required (session used only to detect owner) |
| **Rate limit** | Default (60/min) |
| **Success** | `200` `{ success: true }` |
| **Errors** | `404`; `429`; `500` |

---

### `GET /api/applications/[slug]/viewer-status`

Whether the current viewer owns the application (used to show the public-view footer only to non-owners). Unauthenticated viewers get `isOwner: false`.

| | |
| - | - |
| **Auth** | Not required |
| **Rate limit** | None |
| **Success** | `200` `{ isOwner: boolean }` |
| **Errors** | `404`; `500` |

---

## Profile

### `GET /api/profile`

Return the current user’s profile. If no row exists (`PGRST116`), inserts an empty profile and returns it.

| | |
| - | - |
| **Auth** | Required |
| **Rate limit** | None |
| **Success** | `200` `{ data: Profile }` |
| **Errors** | `400` insert failed; `401`; `500` |

---

### `PUT /api/profile`

Upsert profile fields. Validates `portfolio_url` and `linkedin_url` (http/https only). When `profile_picture_url` changes, deletes the previous Supabase Storage object (if ours) and syncs `applications.profile_picture_url` for rows where `show_profile_picture` is true. See [PROFILE_PICTURE.md](PROFILE_PICTURE.md).

| | |
| - | - |
| **Auth** | Required |
| **Rate limit** | Default (60/min) |
| **Body** (`ProfileUpdateInput`) | Optional: `first_name`, `last_name`, `location`, `portfolio_url`, `linkedin_url`, `profile_picture_url` |
| **Success** | `200` `{ data: Profile }` |
| **Errors** | `400` invalid URL / upsert error; `401`; `429` |

---

## Slugs

### `POST /api/slug`

Derive a slug from company/role (and optional name-in-URL rules) via `reserveBaseSlug`. Returns **409** if that exact slug is already taken (no numeric suffix). Optional `excludeId` ignores the current row when editing.

| | |
| - | - |
| **Auth** | **Not required** (consider tightening for production) |
| **Rate limit** | Default (60/min) |
| **Body** | `company`, `role` (required); optional `excludeId`, `first_name`, `last_name`, `slugNamePosition` (`"start"` \| `"end"`) |
| **Success** | `200` `{ slug: string }` |
| **Errors** | `400` missing company/role; `409` collision; `429`; `500` |

---

### `POST /api/slug/validate`

Check format and uniqueness of a proposed slug (used when the user edits the slug field manually). Invalid or taken slugs return **200** with `{ ok: false, error }` (not 4xx), so the client can show inline feedback.

| | |
| - | - |
| **Auth** | Required |
| **Rate limit** | Default (60/min) |
| **Body** | `slug` (string); optional `excludeId` (string, max 64 chars) |
| **Success** | `200` `{ ok: true }` or `200` `{ ok: false, error: string }` |
| **Errors** | `401`; `429`; `500` `{ ok: false, error }` |

---

## Uploads

### `POST /api/upload`

Upload a CV PDF to Cloudflare R2. Requires an idempotency key so retries reuse the same object. Full details: [PDF_AND_R2.md](PDF_AND_R2.md).

| | |
| - | - |
| **Auth** | Required |
| **Rate limit** | Default (60/min) |
| **Body** | `multipart/form-data` with `file` (PDF, max **10 MB**) |
| **Idempotency** | Header `Idempotency-Key` / `idempotency-key`, or form field `idempotency_key`: 8–128 chars, `[a-zA-Z0-9_-]` only. Object key: `cvs/idempotency/<key>.pdf`. If the object already exists → `{ url, idempotent: true }` without re-upload. |
| **Success** | `200` `{ url: string, idempotent: boolean }` |
| **Errors** | `400` missing/invalid file or key; `401`; `429`; `500` (R2 not configured / upload failure) |

---

### `POST /api/upload/profile-picture`

Upload a profile image to the Supabase Storage bucket `profile-pictures` at `{user_id}/{uuid}.{ext}`. Returns a public URL; the client typically then PUTs it to `/api/profile`. See [PROFILE_PICTURE.md](PROFILE_PICTURE.md).

| | |
| - | - |
| **Auth** | Required |
| **Rate limit** | Default (60/min) |
| **Body** | `multipart/form-data` with `file` (JPEG, PNG, or WebP; max **5 MB**) |
| **Success** | `200` `{ url: string }` |
| **Errors** | `400` missing/invalid file; `401`; `429`; `500` |

---

## Auth

Auth handlers use `createSupabaseRouteClient` so `Set-Cookie` is applied on the JSON response. See [SUPABASE_AUTH_SETUP.md](SUPABASE_AUTH_SETUP.md).

### `POST /api/auth/login`

| | |
| - | - |
| **Auth** | Not required |
| **Rate limit** | **5 / minute / IP** |
| **Body** | `{ email, password }` |
| **Success** | `200` `{ success: true }` (+ session cookies) |
| **Errors** | `400` missing fields; `401` bad credentials; `429`; `500` no session |

---

### `POST /api/auth/signup`

| | |
| - | - |
| **Auth** | Not required |
| **Rate limit** | **5 / minute / IP** |
| **Body** | `{ email, password }` |
| **Success** | `200` `{ success: true, requiresConfirmation: false }` with cookies when a session is created immediately; or `200` `{ success: true, requiresConfirmation: true }` when email confirmation is required |
| **Errors** | `400`; `429` |

`emailRedirectTo` is set to `{origin}/auth/callback`.

---

### `POST /api/auth/logout`

| | |
| - | - |
| **Auth** | Not required |
| **Rate limit** | **20 / minute / IP** |
| **Body** | None |
| **Success** | `200` `{ success: true }` (session cleared) |
| **Errors** | `429` |

---

## Waitlist

### `POST /api/waitlist`

Pre-launch landing-page signup. Inserts into `waitlist_signups` via the service-role admin client.

| | |
| - | - |
| **Auth** | Not required |
| **Rate limit** | **5 / minute / IP** |
| **Body** | **Required:** `email`, `first_name`, `job_search_status` (`Actively searching` \| `Casually looking` \| `Career planning` \| `Other`). **Optional:** `primary_goal` (`Get more interviews` \| `Track my applications` \| `Stand out to recruiters` \| `Network with recruiters` \| `Other`), `career_stage` (`Entry-level` \| `Junior (1–3 years)` \| `Mid-level (3–7 years)` \| `Senior (7+ years)` \| `Other`) |
| **Success** | `200` `{ success: true }` |
| **Errors** | `400` validation; `409` duplicate email; `429`; `500` |

---

## Types

Canonical TypeScript shapes live in:

- `lib/types/application.ts` — `Application`, `ApplicationCreateInput`, `ApplicationUpdateInput`
- `lib/types/profile.ts` — `Profile`, `ProfileUpdateInput`

Client helpers for some application calls: `lib/api/applications.ts`.
