# PR #4 — Update application cards horizontal

Commit-by-commit detail for PR #4 (update-application-cards-horizontal): commits `f8585bb` through `85667e7`, plus merge. See [BUILD_SUMMARY.md](../BUILD_SUMMARY.md) for the full index.

---

## 31. refactor(admin): horizontal ApplicationCard layout

**Commit:** `f8585bb`  
**Intent:** Improve admin dashboard layout by showing application cards in a horizontal arrangement.

**Updated:**

- `app/admin/page.tsx` — layout for application cards (horizontal grid or list).
- `components/admin/AdminDashboardSkeleton.tsx` — skeleton aligned with new layout.
- `components/admin/ApplicationCard.tsx` — horizontal layout (e.g. main content and meta side-by-side).
- `components/admin/ApplicationCardDropdown.tsx` — dropdown actions for the card.
- `components/admin/ApplicationCardInsights.tsx` — insights section within the card.
- `components/admin/icons.tsx` — icons used in cards (e.g. actions, status).
- `docs/USER_GUIDE.md` — reflect admin dashboard changes.

**Result:** Admin dashboard application cards use a horizontal layout for better scanability.

---

## 32. Application card status: clock for active/unviewed, check for viewed; add ClockIcon

**Commit:** `87c80a8`  
**Intent:** Visual status on application cards: clock icon for active/unviewed, check for viewed.

**Updated:**

- `components/admin/ApplicationCard.tsx` — show clock icon when application is active/unviewed, check icon when viewed.
- `components/admin/icons.tsx` — add `ClockIcon` (and check icon if not already present).

**Result:** Candidates can quickly see which applications are new (unviewed) vs already viewed.

---

## 33. Exclude applicant from view count when viewing own application

**Commit:** `e0b9ad2`  
**Intent:** When the applicant views their own application page, do not increment the view count.

**Updated:**

- `app/api/applications/[slug]/view/route.ts` — when recording a view, exclude the count increment (or skip recording) when the viewer is the applicant (e.g. by comparing viewer to application owner or by token/session).
- `docs/ARCHITECTURE.md`, `docs/DATA_FLOW.md` — document that applicant's own view is excluded from count.

**Bug fixed:** View count no longer inflates when candidates check their own submission link.

---

## 34. Add CV download count tracking and show in application insights (owner excluded)

**Commit:** `73b87c1`  
**Intent:** Track how many times the CV is downloaded and show it in admin application insights; exclude owner downloads from the count.

**Created:**

- `app/api/applications/[slug]/download/route.ts` — download endpoint that increments a download counter (and excludes owner).
- `supabase/migrations/007_application_download_count.sql` — add `cv_download_count` (or equivalent) to applications.

**Updated:**

- `app/view/[slug]/ViewPageContent.tsx` — link or action to download CV that hits the download API.
- `components/admin/ApplicationCard.tsx`, `components/admin/ApplicationCardInsights.tsx` — show CV download count in insights (owner excluded in API).
- `components/pdf/PDFViewer.tsx` — ensure download flow goes through the tracked endpoint where appropriate.
- `lib/types/application.ts`, `lib/types/database.ts` — add `cv_download_count` (and any owner-exclusion fields).
- `docs/ARCHITECTURE.md`, `docs/DATA_FLOW.md` — document download tracking and owner exclusion.

**Result:** Candidates see how many times the CV was downloaded; owner downloads do not count.

---

## 35. Add last viewed tracking

**Commit:** `88d0e20`  
**Intent:** Store and display when an application was last viewed by a recruiter.

**Created:**

- `supabase/migrations/008_application_last_viewed_at.sql` — add `last_viewed_at` (or equivalent) to applications.

**Updated:**

- `app/api/applications/[slug]/view/route.ts` — when a view is recorded (and counted), update `last_viewed_at` on the application.
- `components/admin/ApplicationCard.tsx`, `components/admin/ApplicationCardInsights.tsx` — show "Last viewed" (or similar) in insights.
- `lib/types/application.ts`, `lib/types/database.ts` — add `last_viewed_at`.
- `docs/ARCHITECTURE.md`, `docs/DATA_FLOW.md`, `docs/USER_GUIDE.md` — document last-viewed behavior.

**Result:** Admin can see when each application was last viewed.

---

## 36. Add InsightItem component and responsive grid to application card insights

**Commit:** `85667e7`  
**Intent:** Reusable insight row and responsive grid layout for application card insights.

**Created:**

- `components/admin/InsightItem.tsx` — single insight row (e.g. label + value, icon).

**Updated:**

- `components/admin/ApplicationCardInsights.tsx` — use `InsightItem` for each metric; layout as a responsive grid (views, downloads, last viewed, etc.).

**Result:** Application insights are consistent and scale well on different screen sizes.

---

## 37. Merge pull request #4 — update-application-cards-horizontal

**Commit:** `a00c745`  
**Intent:** Merge the "Update application cards horizontal" branch into main.

**Scope:** All changes from commits 30–36: BUILD_SUMMARY doc update, horizontal ApplicationCard layout, clock/check status icons, exclude applicant from view count, CV download count tracking, last viewed tracking, and InsightItem + responsive insights grid. No new files; merge only.

---
