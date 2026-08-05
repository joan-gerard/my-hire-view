# Code Review – Refactoring & Best Practices

Historical record of refactors already applied to the MyHireView codebase. Open follow-ups and recommendations are tracked only in **[Backlog.md](Backlog.md)**.

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

## 2. Open recommendations

Open follow-ups from this review (login/signup DRY, `withAuth`, API validation, middleware entry, DB/app types, upload error/`handleApiError` adoption, upload UX, central API client, etc.) live in **[Backlog.md](Backlog.md)**. Do not re-list them here.

---

## 3. Summary of applied refactors

| Area             | Status                                                                 |
| ---------------- | ---------------------------------------------------------------------- |
| Auth API DRY     | Done – shared route client in `lib/supabase/route-client.ts`           |
| Shareable URL    | Done – `lib/utils/url.ts`                                              |
| Auth callback    | Done – `await cookies()`                                               |
| ApplicationCard  | Done – Button + clipboard util                                         |
| Edit page fetch  | Done – GET by-id + edit page uses it                                   |
| Upload/Slug auth | Done – both require auth                                               |
