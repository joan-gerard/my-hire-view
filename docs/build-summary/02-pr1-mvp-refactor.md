# PR #1 — MVP refactor

Commit-by-commit detail for PR #1 (mvp-refactor): commits `44f7dd6` through `5b034bf`, plus merge. See [BUILD_SUMMARY.md](../BUILD_SUMMARY.md) for the full index.

---

## 8. Show Dashboard + Sign out when signed in, logo links to / everywhere

**Commit:** `44f7dd6`  
**Intent:** UX: signed-in users see Dashboard + Sign out; logo always goes to home.

**Updated:**

- `app/admin/layout.tsx` — show Dashboard and Sign out when signed in.
- `app/page.tsx` — same for landing (Dashboard + Sign out; logo to `/`).
- `docs/ARCHITECTURE.md` — kept in sync with UI/navigation.

---

## 9. signing out redirects to the homepage

**Commit:** `cdc267f`  
**Intent:** After sign-out, send user to homepage instead of staying on admin.

**Updated:**

- `app/admin/SignOutButton.tsx` — after logout, redirect to `/` (homepage).

**Bug fixed:** Signing out from admin no longer left the user on a protected or stale admin URL.

---

## 10. refactor: extract PublicSiteHeader and AdminHeader from home and admin layout

**Commit:** `ee741d5`  
**Intent:** Reusable headers and clearer separation between public and admin UI.

**Created:**

- `components/public/PublicSiteHeader.tsx` — header for public/landing pages.
- `components/admin/AdminHeader.tsx` — header for admin (Dashboard, Sign out, logo).

**Updated:**

- `app/admin/SignOutButton.tsx`, `app/admin/layout.tsx`, `app/page.tsx` — use the new header components.
- `docs/ARCHITECTURE.md` — updated to reflect new components.

---

## 11. refactor: MarketingHeader and ApplicationPageHeader, public route /view instead of /apply

**Commit:** `e9dfaec`  
**Intent:** Clearer naming and a more neutral public URL.

**Renamed / moved:**

- `app/apply/[slug]/*` → `app/view/[slug]/*` (page, loading, not-found, ViewTracker).
- `components/public/ApplicationHeader.tsx` → `components/public/ApplicationPageHeader.tsx`.
- `components/public/PublicSiteHeader.tsx` → `components/public/MarketingHeader.tsx`.

**Updated:**

- `app/page.tsx`, `CURSOR_PROMPT.md`, `docs/ARCHITECTURE.md`, `docs/CODE_REVIEW.md`, `lib/utils/url.ts` — references to `/apply` and header names; URL helpers now use `/view`.

**Result:** Public shareable URL is `/view/[slug]`; "Marketing" vs "Application page" headers are clearly separated.

---

## 12. chore: set app title to MyHireView in root layout

**Commit:** `3c52312`  
**Intent:** Correct browser tab title.

**Updated:**

- `app/layout.tsx` — set document title to "MyHireView" (or equivalent metadata).

---

## 13. refactor: extract landing and admin logic into hooks, API client, and components

**Commit:** `0dfa1e3`  
**Intent:** Cleaner separation of data, API, and UI for landing and admin.

**Created:**

- `hooks/useApplications.ts` — fetch applications for admin (and reuse where needed).
- `lib/api/applications.ts` — API client for applications.
- `components/admin/AdminDashboardEmpty.tsx`, `AdminDashboardError.tsx`, `AdminDashboardSkeleton.tsx` — admin dashboard states.
- `components/public/MarketingHero.tsx`, `MarketingFeatures.tsx` — landing content blocks.

**Updated:**

- `app/admin/page.tsx`, `app/page.tsx` — use the new hooks, API client, and components; simpler page components.

**Result:** Landing and admin pages are easier to maintain and test; loading/error/empty states are explicit.

---

## 14. Move SignOutButton to components/auth folder

**Commit:** `4e1486b`  
**Intent:** Put auth UI in a dedicated place.

**Created:**

- `components/auth/SignOutButton.tsx` — moved from `app/admin/SignOutButton.tsx`.

**Updated:**

- `components/admin/AdminHeader.tsx`, `components/public/MarketingHeader.tsx` — import `SignOutButton` from `components/auth/SignOutButton`.
- `docs/ARCHITECTURE.md` — reflect new location.

**Deleted (conceptually):** `app/admin/SignOutButton.tsx` (replaced by the component in `components/auth`).

---

## 15. fix: use path alias for ViewTracker import in view page

**Commit:** `5b034bf`  
**Intent:** Use project path alias instead of relative path.

**Updated:**

- `app/view/[slug]/page.tsx` — import `ViewTracker` via `@/` path alias (e.g. `@/app/view/[slug]/ViewTracker`) for consistency and to avoid brittle relative paths.

**Bug fixed:** ViewTracker import could break on refactors; path alias keeps imports stable.

---

## 16. Merge pull request #1 — mvp-refactor

**Commit:** `89e0dcb`  
**Intent:** Merge the "MVP Refactor and Improvements" branch into main.

**Scope:** All changes from commits 8–15 (headers, redirect on sign-out, `/view`, title, hooks/API/dashboard components, SignOutButton move, ViewTracker import fix). No new files; merge only.

---
