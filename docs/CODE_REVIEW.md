# Code Review – Refactoring & Best Practices

This document summarizes the code review performed on the HireView codebase, including refactors already applied and remaining recommendations.

---

## 1. Refactors Applied

### 1.1 DRY: Supabase route client (auth API)

**Before:** Login, signup, and logout API routes each duplicated the same Supabase server client setup (cookie get/set/remove and `CookieOptions` type).

**After:** A shared module `lib/supabase/route-client.ts` was added:

- `createSupabaseRouteClient({ request, response })` – single place for route-handler client creation
- `CookieOptions` type exported for reuse

**Files changed:**  
`app/api/auth/login/route.ts`, `app/api/auth/signup/route.ts`, `app/api/auth/logout/route.ts` now use `createSupabaseRouteClient`. Duplicated cookie handling and type definitions were removed.

---

### 1.2 DRY: Shareable application URL

**Before:** The shareable application URL (`baseUrl + '/view/' + slug`) was built in three places with slight variations (`NEXT_PUBLIC_SITE_URL`, `window.location.origin`, etc.).

**After:** A small util in `lib/utils/url.ts`:

- `getBaseUrl()` – safe for server and client
- `getApplicationUrl(slug)` – full URL for the public application page

**Files changed:**  
`app/view/[slug]/page.tsx`, `components/admin/ApplicationCard.tsx`, `components/forms/ApplicationForm.tsx` now use these helpers.

---

### 1.3 Auth callback: Next.js 15 `cookies()` API

**Before:** `app/auth/callback/route.ts` used `cookies()` without `await`. In Next.js 15+, `cookies()` from `next/headers` is async.

**After:** `const cookieStore = await cookies();` so the callback works correctly with the current Next.js API.

---

### 1.4 ApplicationCard: Reuse UI and clipboard util

**Before:** ApplicationCard used raw `<button>` elements with inline styles and its own `navigator.clipboard.writeText` logic.

**After:**

- Uses shared `Button` component with appropriate variants.
- Uses `copyToClipboard()` from `lib/utils/clipboard.ts` (includes fallback for older environments).

---

### 1.5 Edit page: Fetch single application by ID

**Before:** The edit page fetched the full list from `GET /api/applications` and then found the application by `id` in the client. Inefficient and unnecessary data transfer.

**After:**

- New endpoint: `GET /api/applications/by-id/[id]` (auth required, returns one application).
- Edit page calls this endpoint instead of listing all applications.

**Files added:** `app/api/applications/by-id/[id]/route.ts`  
**Files changed:** `app/admin/edit/[id]/page.tsx` now fetches by id.

---

## 2. Further Recommendations

### 2.1 Login / Signup page duplication (DRY)

**Issue:** `app/login/page.tsx` and `app/signup/page.tsx` share a lot of structure: layout, session check in `useEffect`, form fields (email/password), error/loading state, and submit flow.

**Recommendation:** Extract shared pieces:

- A reusable **auth layout** component (centered card, title, link to the other auth page).
- Optional: shared **email/password fields** and a small hook (e.g. `useAuthSubmit`) for the fetch + redirect + error handling pattern.

This would reduce duplication and keep login/signup behavior consistent.

---

### 2.2 API route auth pattern (DRY)

**Issue:** In `app/api/applications/route.ts`, every handler uses the same pattern:

```ts
try {
  const user = await requireAuth();
  const supabase = await createClient();
  // ...
} catch {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}
```

**Recommendation:** Introduce a small wrapper, e.g. `withAuth(handler)`, that:

1. Calls `requireAuth()` (or equivalent).
2. On success, calls the handler with `(request, { user, supabase })`.
3. On auth failure, returns a consistent 401 JSON response.

Then each route only contains the business logic. Same idea can be applied to other authenticated API routes if you add more.

---

### 2.3 Protect upload and slug APIs

**Issue:**

- `POST /api/upload` – no auth; any client can upload files.
- `POST /api/slug` – no auth; any client can request slug generation.

**Recommendation:** Require authentication for both (e.g. call `requireAuth()` at the start of each handler). This avoids abuse (e.g. anonymous uploads or slug probing) and aligns with the fact that only logged-in admins create applications.

---

### 2.4 Input validation on API routes

**Issue:** Some routes parse JSON and use properties without validating shape (e.g. login/signup now use `body?.email` and `body?.password`; slug route uses `company`, `role`, `excludeId`). Invalid or missing body can lead to unclear errors.

**Recommendation:** Validate and narrow types at the boundary, e.g. with a small schema (Zod, or a minimal manual check). Return 400 with a clear message when the body is invalid. This improves security and debuggability.

---

### 2.5 Middleware entry point

**Issue:** Session update logic lives in `lib/supabase/middleware.ts`, but the file that exports the Next.js middleware and `config` is `proxy.ts` at the root. Next.js normally expects a root `middleware.ts` (or `middleware.js`) that exports the middleware as default.

**Recommendation:** If you intend to use the built-in middleware pipeline, add a root `middleware.ts` that re-exports the middleware (e.g. `export { proxy as default, config } from './proxy'` or move the logic into `middleware.ts` and import `updateSession` there). Ensure the file is named so Next.js picks it up.

---

### 2.6 Types: Single source of truth for DB shape

**Current state:** `lib/types/application.ts` and `lib/types/database.ts` both define the application row shape. They stay in sync manually.

**Recommendation:** Prefer a single source of truth. For example, derive the public `Application` type from the database type (e.g. `Database['public']['Tables']['applications']['Row']`) or generate types from the DB schema. This reduces drift and duplication.

---

### 2.7 Error handling in API routes

**Issue:** Some routes use a broad `catch` and return a generic 500 or 401 without logging. That can make production debugging harder.

**Recommendation:** In development, log the error (e.g. `console.error`) before returning. In production, avoid exposing internal details in the response but still log server-side. You can centralize this in a small `handleApiError` helper if you want consistent behavior.

---

### 2.8 FileUpload: Unused state and error display

**Issue:** `components/forms/FileUpload.tsx` has `uploadProgress` state that is set but never reflects real progress (the upload request doesn’t report progress). The UI shows “Uploading... 0%”.

**Recommendation:** Either remove `uploadProgress` and show a simple “Uploading...” label, or implement real progress (e.g. `XMLHttpRequest` with `upload.onprogress` or a library that supports it) so the percentage is meaningful.

---

### 2.9 Centralize API base URL / fetch options

**Issue:** Client-side code calls `fetch('/api/...')` in many places. If you later need a different base URL or default headers (e.g. `credentials: 'include'` everywhere), you’d touch many files.

**Recommendation:** Introduce a small API client (e.g. `lib/api/client.ts`) that wraps `fetch` with a base URL and default options. Use it for all API calls from the client. This also makes it easier to add interceptors (e.g. auth refresh or error handling) later.

---

## 3. Summary

| Area              | Status / Action                                      |
|-------------------|------------------------------------------------------|
| Auth API DRY      | Done – shared route client in `lib/supabase/route-client.ts` |
| Shareable URL     | Done – `lib/utils/url.ts`                            |
| Auth callback     | Done – `await cookies()`                             |
| ApplicationCard   | Done – Button + clipboard util                        |
| Edit page fetch   | Done – GET by-id + edit page uses it                  |
| Login/Signup DRY  | Recommended – extract layout/fields/hook              |
| API auth wrapper  | Recommended – e.g. `withAuth`                         |
| Upload/Slug auth  | Recommended – require auth                           |
| API validation    | Recommended – validate body (e.g. Zod)                |
| Middleware file   | Recommended – ensure root `middleware.ts`            |
| DB/App types      | Recommended – single source of truth                   |
| Error logging     | Recommended – log in API routes                       |
| FileUpload UX     | Recommended – fix or remove progress                  |
| API client        | Optional – centralize fetch for future flexibility    |

If you want to tackle more refactors, a good order is: **protect upload/slug APIs**, then **login/signup DRY**, then **API validation and auth wrapper**.
