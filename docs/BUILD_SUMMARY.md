# HireView — Build Summary

This document summarizes what was built commit-by-commit, in chronological order, to reflect the thinking process: what was created, updated, fixed, or refactored at each step.

> **Note:** This document should be updated only when explicitly requested. Do not update it automatically when new commits are made.

---

## 1. Initial commit from Create Next App

**Commit:** `19a1111`  
**Intent:** Project scaffold.

**Created:**

- **Config & tooling:** `.gitignore`, `eslint.config.mjs`, `next.config.ts`, `tsconfig.json`, `postcss.config.mjs`, `package.json`, `pnpm-lock.yaml`, `pnpm-workspace.yaml`
- **App shell:** `app/layout.tsx`, `app/page.tsx`, `app/globals.css`, `app/favicon.ico`
- **Assets:** `public/file.svg`, `public/globe.svg`, `public/next.svg`, `public/vercel.svg`, `public/window.svg`
- **Docs:** `README.md`

Standard Next.js app bootstrap; no HireView-specific logic yet.

---

## 2. first commit

**Commit:** `dcf670a`  
**Intent:** First project-specific change.

**Updated:**

- `README.md` — adjusted for the new project (content not captured in git diff; reflects initial product description).

---

## 3. create prompt

**Commit:** `9ddb9fa`  
**Intent:** Capture project context for AI assistance.

**Created:**

- `CURSOR_PROMPT.md` — project prompt / context for Cursor.

---

## 4. feat: add HireView — recruiter landing pages with auth, admin and public apply

**Commit:** `604c19d`  
**Intent:** Deliver the core product: recruiter landing pages, auth, admin dashboard, and public apply/view flow.

**Created:**

- **Cursor:** `.cursor/commands/write-a-commit-message.md`
- **Admin:** `app/admin/layout.tsx`, `app/admin/page.tsx`, `app/admin/new/page.tsx`, `app/admin/edit/[id]/page.tsx`, `app/admin/SignOutButton.tsx`, plus `loading.tsx` for admin, new, and edit
- **API:**  
  `app/api/applications/route.ts`, `app/api/applications/[slug]/route.ts`, `app/api/applications/[slug]/view/route.ts`, `app/api/applications/by-id/[id]/route.ts`,  
  `app/api/auth/login/route.ts`, `app/api/auth/logout/route.ts`, `app/api/auth/signup/route.ts`,  
  `app/api/slug/route.ts`, `app/api/upload/route.ts`
- **Public apply flow:** `app/apply/[slug]/page.tsx`, `app/apply/[slug]/loading.tsx`, `app/apply/[slug]/not-found.tsx`, `app/apply/[slug]/ViewTracker.tsx`
- **Auth:** `app/auth/callback/route.ts`, `app/login/page.tsx`, `app/signup/page.tsx`
- **Shared UI:** `app/error.tsx`, `app/not-found.tsx`
- **Components:**  
  `components/admin/ApplicationCard.tsx`, `components/admin/SearchBar.tsx`,  
  `components/forms/ApplicationForm.tsx`, `components/forms/FileUpload.tsx`, `components/forms/YouTubeUrlInput.tsx`,  
  `components/pdf/PDFViewer.tsx`, `components/public/ApplicationHeader.tsx`,  
  `components/ui/Button.tsx`, `components/ui/Input.tsx`, `components/ui/Textarea.tsx`,  
  `components/video/YouTubeEmbed.tsx`
- **Lib:** `lib/auth.ts`, `lib/supabase/client.ts`, `lib/supabase/env.ts`, `lib/supabase/middleware.ts`, `lib/supabase/route-client.ts`, `lib/supabase/server.ts`,  
  `lib/types/application.ts`, `lib/types/database.ts`,  
  `lib/utils/clipboard.ts`, `lib/utils/slug-generate.ts`, `lib/utils/slug.ts`, `lib/utils/url.ts`, `lib/utils/youtube.ts`
- **Docs:** `docs/CODE_REVIEW.md`, `docs/SUPABASE_AUTH_SETUP.md`
- **DB:** `supabase/migrations/001_initial_schema.sql`, `supabase/migrations/002_add_application_is_active.sql`
- **Dev:** `proxy.ts`

**Updated:**

- `app/layout.tsx`, `app/page.tsx` — integrated auth and landing
- `CURSOR_PROMPT.md`, `README.md`, `package.json`, `pnpm-lock.yaml` — deps and project description

Result: end-to-end flow: sign up/in, create/edit applications (slug, CV, video, description), shareable `/apply/[slug]` page with view tracking, Supabase + Vercel Blob.

---

## 5. update cursor command

**Commit:** `631252a`  
**Intent:** Improve Cursor commit-message workflow.

**Updated:**

- `.cursor/commands/write-a-commit-message.md` — refined instructions (e.g. no double quotes in messages).

---

## 6. fix(admin): normalize application to form data in edit page

**Commit:** `4005c55`  
**Intent:** Bug fix so the edit form is populated correctly from the database.

**Updated:**

- `app/admin/edit/[id]/page.tsx` — instead of passing the raw `application` from the API into the form, build an `initialData` object that normalizes the DB shape to the form shape (e.g. `null` → `undefined` for optional fields). Fixes incorrect or missing values when editing.
- `.cursor/commands/write-a-commit-message.md` — minor tweak.

**Bug fixed:** Edit form could show wrong or empty values when loading an existing application.

---

## 7. add Architecture document

**Commit:** `927f0b3`  
**Intent:** Document system design and architecture.

**Created:**

- `docs/ARCHITECTURE.md` — overview, tech stack, high-level architecture, component view, data model, auth, key flows.

**Updated:**

- `README.md` — link or reference to architecture (as appropriate).

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

**Result:** Public shareable URL is `/view/[slug]`; “Marketing” vs “Application page” headers are clearly separated.

---

## 12. chore: set app title to MyHireView in root layout

**Commit:** `3c52312`  
**Intent:** Correct browser tab title.

**Updated:**

- `app/layout.tsx` — set document title to “MyHireView” (or equivalent metadata).

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
**Intent:** Merge the “MVP Refactor and Improvements” branch into main.

**Scope:** All changes from commits 8–15 (headers, redirect on sign-out, `/view`, title, hooks/API/dashboard components, SignOutButton move, ViewTracker import fix). No new files; merge only.

---

## 17. create basic profile page

**Commit:** `f5d964a`  
**Intent:** Let users manage a recruiter-facing profile (first step toward candidate snapshot).

**Created:**

- `app/admin/profile/page.tsx` — basic profile page in admin (likely form or placeholder for name, title, etc.).

**Updated:**

- `components/admin/AdminHeader.tsx` — link to profile (e.g. “Profile” in nav).
- `README.md`, `docs/ARCHITECTURE.md` — mention profile and navigation.

---

## 18. Add profiles table and candidate snapshot on applications for recruiter view

**Commit:** `354f649`  
**Intent:** Persist profile and show a candidate snapshot on each application for recruiters.

**Created:**

- `app/api/profile/route.ts` — GET/PUT (or similar) for profile.
- `components/forms/ProfileForm.tsx` — form to edit profile (name, etc.).
- `lib/types/profile.ts` — profile type.
- `supabase/migrations/003_profiles_table.sql` — profiles table.
- `supabase/migrations/004_application_candidate_fields.sql` — candidate fields on applications (e.g. first name, last name) for recruiter view.

**Updated:**

- `app/admin/profile/page.tsx` — wired to ProfileForm and API.
- `app/api/applications/route.ts` — create/update applications with candidate fields; possibly read profile for defaults.
- `app/view/[slug]/page.tsx` — show candidate snapshot (e.g. name) for recruiter.
- `components/public/ApplicationPageHeader.tsx` — use candidate data on the public view.
- `lib/types/application.ts`, `lib/types/database.ts` — profile and candidate field types.
- `docs/ARCHITECTURE.md` — profiles table, candidate snapshot, recruiter view.

**Result:** Recruiters see who applied (candidate snapshot); candidates have a stored profile that can feed into applications and view.

---

## 19. Add candidate fields preview with toggles on new/edit, extract form components, persist show/hide and add framer-motion animation

**Commit:** `1fbf4e6`  
**Intent:** Control which candidate fields appear on the public page and improve form structure and UX.

**Created:**

- `components/forms/ApplicationFormActions.tsx` — submit/cancel (or similar) for the application form.
- `components/forms/CandidateFieldRow.tsx` — single candidate field with toggle (show/hide on public page).
- `components/forms/CandidateFieldsSection.tsx` — section that lists candidate fields and toggles; likely uses framer-motion for expand/collapse or list animation.

**Updated:**

- `app/admin/edit/[id]/page.tsx`, `app/admin/new/page.tsx` — use new form components; pass show/hide state to API.
- `app/api/applications/route.ts` — persist which candidate fields are shown/hidden (e.g. `show_first_name`, `show_last_name`).
- `components/forms/ApplicationForm.tsx` — integrate CandidateFieldsSection and toggles; preview of what recruiters will see.
- `lib/types/application.ts` — types for show/hide flags (and any new candidate fields).
- `docs/ARCHITECTURE.md` — candidate field toggles and form structure.
- `package.json`, `pnpm-lock.yaml` — added `framer-motion` (or similar) for animations.

**Result:** On new/edit, user sees a preview of candidate fields and can toggle visibility per field; choices are saved and reflected on `/view/[slug]` with smoother UI (framer-motion).

---

## 20. Add data flow diagrams doc and user guide

**Commit:** `93929d9`  
**Intent:** Document how data flows and how to use the product.

**Created:**

- `docs/DATA_FLOW.md` — data flow diagrams (e.g. Mermaid) for applications, profile, view tracking, slug, etc.
- `docs/USER_GUIDE.md` — how to use HireView (create application, edit profile, share link, etc.).

**Updated:**

- `README.md` — links or references to DATA_FLOW and USER_GUIDE.

---

## 21. feat: name in slug — choose None, At start, or At end

**Commit:** `127efe9`  
**Intent:** Let users choose whether and how the candidate name appears in the shareable URL.

**Created:**

- `supabase/migrations/005_application_include_name_in_slug.sql` — add or repurpose column for “include name in slug” (e.g. boolean or enum).
- `supabase/migrations/006_slug_name_position_text.sql` — store slug name position as text: `'start'`, `'end'`, or none.

**Updated:**

- `app/admin/edit/[id]/page.tsx` — normalize DB value (legacy boolean or `'start'|'end'|null`) to form `slugNamePosition`; when slug or name position changes, call slug API with `slugNamePosition` and optional `first_name`/`last_name`.
- `app/admin/new/page.tsx` — pass `slugNamePosition` and name to slug API when creating.
- `app/api/applications/route.ts` — read/write new slug name position; pass through to slug generation where needed.
- `app/api/slug/route.ts` — accept `slugNamePosition` and optional `first_name`/`last_name`; generate slug with name at start, end, or not at all.
- `components/forms/ApplicationForm.tsx` — add UI for “Name in slug”: None / At start / At end; include first/last name when relevant.
- `lib/types/application.ts`, `lib/types/database.ts` — `slugNamePosition` (or equivalent) and any new DB fields.
- `lib/utils/slug-generate.ts`, `lib/utils/slug.ts` — generate slug with name at start, end, or no name.
- `README.md`, `docs/ARCHITECTURE.md`, `docs/DATA_FLOW.md`, `docs/USER_GUIDE.md` — document new migrations and behavior.

**Result:** Shareable URL can be e.g. `view/jane-doe-frontend-engineer-acme` (name at start), `view/frontend-engineer-acme-jane-doe` (name at end), or without name; choice is stored and used when generating/regenerating the slug.

---

## 22. fix(docs): quote Mermaid API node labels so GitHub renders diagram

**Commit:** `21a78df`  
**Intent:** Fix Mermaid rendering on GitHub (e.g. in DATA_FLOW.md).

**Updated:**

- `docs/DATA_FLOW.md` — wrap API node labels in quotes in Mermaid so GitHub’s Mermaid renderer displays the diagram correctly.

**Bug fixed:** DATA_FLOW diagram failed to render or showed errors on GitHub due to unquoted labels.

---

## 23. fix(docs): use rectangle nodes in DATA_FLOW Mermaid diagram for GitHub

**Commit:** `151667b`  
**Intent:** Ensure DATA_FLOW diagram renders on GitHub.

**Updated:**

- `docs/DATA_FLOW.md` — change Mermaid node shapes to rectangles (or GitHub-supported syntax) so the diagram renders.

**Bug fixed:** Certain Mermaid node types were not supported by GitHub; switching to rectangle nodes fixed rendering.

---

## 24. Merge pull request #2 — create-profile-page

**Commit:** `eac7494`  
**Intent:** Merge the “Create profile page” branch (profile + candidate snapshot + toggles + docs + name-in-slug + doc fixes).

**Scope:** All changes from commits 17–23: profile page, profiles table, candidate snapshot, candidate field toggles and form components, DATA_FLOW and USER_GUIDE, name-in-slug feature, and Mermaid doc fixes. No new files; merge only.

---

## 25. docs: add BUILD_SUMMARY with commit-by-commit build history and link in README

**Commit:** `fe2826e`  
**Intent:** Add a single document that summarizes the build history commit-by-commit and link it from the README.

**Created:**

- `docs/BUILD_SUMMARY.md` — commit-by-commit build summary (scaffold through merge PR #2).

**Updated:**

- `README.md` — link to BUILD_SUMMARY.

**Result:** One place to see what was built at each step; useful for onboarding and context.

---

## 26. docs: note that BUILD_SUMMARY is updated only on request

**Commit:** `3956b3a`  
**Intent:** Clarify maintenance policy for BUILD_SUMMARY.

**Updated:**

- `docs/BUILD_SUMMARY.md` — added note that the document is updated only when explicitly requested (not automatically on every commit).

---

## 27. feat(cv): upload PDF on save, delete blob on delete/replace, optional modal cv preview

**Commit:** `c19c88e`  
**Intent:** Defer CV upload until form save, clean up old blobs on delete or replace, and add optional in-app PDF preview.

**Created:**

- `lib/utils/blob.ts` — `isVercelBlobUrl()`, `deleteBlobIfOurs()` for safe Vercel Blob URL checks and deletion.
- `docs/PDF_AND_VERCEL_BLOB.md` — documentation for PDF and Vercel Blob behavior.
- `docs/my-docs/VERCEL_BLOB.md` — Vercel Blob reference notes.

**Updated:**

- `app/api/applications/route.ts` — on create/update/delete, delete previous blob when replacing or removing CV; upload flow aligned with save.
- `components/forms/ApplicationForm.tsx` — CV file is selected in form but uploaded only on submit (pending file state).
- `components/forms/FileUpload.tsx` — optional modal CV preview for selected file before save; pending vs saved state.
- `README.md`, `docs/ARCHITECTURE.md`, `docs/DATA_FLOW.md` — references to blob lifecycle and CV flow.

**Result:** No orphaned blobs; CV upload happens on save; user can preview selected PDF in a modal before submitting.

---

## 28. fix: handle missing CV blob with existence check and retry UI

**Commit:** `a5da3f6`  
**Intent:** When the stored CV URL points to a missing Vercel Blob (e.g. deleted or expired), check existence and show appropriate UI instead of a broken viewer or link.

**Created:**

- `app/view/[slug]/ViewPageContent.tsx` — client component for the public view page; holds application state and refetch for retry.
- `components/public/CvUnavailableWithRetry.tsx` — message when CV is unavailable, with optional "Try again" that triggers a refetch.

**Updated:**

- `lib/utils/blob.ts` — added `checkBlobExists()` (HEAD request) to verify a Vercel Blob URL exists.
- `lib/types/application.ts` — optional `cv_exists` on `Application` (set by APIs when they run the check).
- `app/api/applications/[slug]/route.ts`, `app/api/applications/by-id/[id]/route.ts` — compute `cv_exists` via `checkBlobExists(cv_url)` and include in response.
- `app/view/[slug]/page.tsx` — fetches application server-side and renders `ViewPageContent`; when `cv_exists === false`, view shows unavailable message and retry instead of loading PDF.
- `components/pdf/PDFViewer.tsx` — clearer error handling for missing/unavailable PDFs (fetch/404/network).
- `components/forms/ApplicationForm.tsx` — accepts `cvUrlExists` and `onRetryCvCheck`; passes to FileUpload so edit form can hide View link when blob is missing.
- `components/forms/FileUpload.tsx` — when `cvUrlExists` is false, shows "CV file not found in storage" and optional "Check again" button calling `onRetryCvCheck`.
- `app/admin/edit/[id]/page.tsx` — fetches application with `cv_exists`, passes `cvUrlExists` and `refetchCvCheck` to ApplicationForm.

**Bug fixed:** Stale or missing CV blobs no longer show a broken PDF or misleading View link; public view and edit form show an explicit unavailable state with retry.

---

## 29. Merge pull request #3 — bug-cv-in-blob

**Commit:** `20bf0e8`  
**Intent:** Merge the "Fix Blob Storage issues" branch into main.

**Scope:** All changes from commits 27–28: defer CV upload to save, blob delete on replace/delete, optional CV preview modal, and missing-CV existence check with retry UI on view and edit. No new files; merge only.

---

## 30. docs: extend BUILD_SUMMARY with history through PR #3 bug-cv-in-blob

**Commit:** `a40e651`  
**Intent:** Bring BUILD_SUMMARY up to date with the commit history through PR #3.

**Updated:**

- `docs/BUILD_SUMMARY.md` — extended with commit-by-commit entries through merge PR #3 (bug-cv-in-blob).

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
- `docs/ARCHITECTURE.md`, `docs/DATA_FLOW.md` — document that applicant’s own view is excluded from count.

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
- `components/admin/ApplicationCard.tsx`, `components/admin/ApplicationCardInsights.tsx` — show “Last viewed” (or similar) in insights.
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
**Intent:** Merge the “Update application cards horizontal” branch into main.

**Scope:** All changes from commits 30–36: BUILD_SUMMARY doc update, horizontal ApplicationCard layout, clock/check status icons, exclude applicant from view count, CV download count tracking, last viewed tracking, and InsightItem + responsive insights grid. No new files; merge only.

---

## 38. docs: extend BUILD_SUMMARY through commit 37 and unify list formatting

**Commit:** `04822bf`  
**Intent:** Bring BUILD_SUMMARY up to date and standardise list formatting.

**Updated:**

- `docs/BUILD_SUMMARY.md` — extended with entries through commit 37; unified list formatting (e.g. bullet style) across sections.

---

## 39. fix: view count via SECURITY DEFINER RPC and service_role-only admin client

**Commit:** `1824d5e`  
**Intent:** Fix view count and last_viewed_at not updating for anonymous and non-owner viewers (RLS was blocking direct UPDATE on applications).

**Created:**

- `supabase/migrations/009_increment_view_count_security_definer.sql` — `increment_application_view_count(p_slug)` SECURITY DEFINER function; updates only `view_count` and `last_viewed_at`; EXECUTE granted to `service_role` only.
- `docs/VIEW_COUNT_FIX.md` — problem, root cause (RLS), options, and solution (SECURITY DEFINER + service-role backend).

**Updated:**

- `lib/supabase/env.ts` — `getSupabaseServiceRoleKey()` helper for server-side `SUPABASE_SERVICE_ROLE_KEY`.
- `lib/supabase/admin.ts` — `createAdminClient()` using service role key (server-side only).
- `app/api/applications/[slug]/view/route.ts` — for non-owner viewers, call `increment_application_view_count` via admin client instead of direct UPDATE.
- `docs/ARCHITECTURE.md`, `docs/DATA_FLOW.md` — document view-count RPC and admin client usage.

**Bug fixed:** View count and last viewed now update correctly when recruiters or anonymous users open the public application page; only the backend (service role) can run the RPC.

---

## 40. fix: download count via SECURITY DEFINER RPC for anon and non-owner

**Commit:** `68f019e`  
**Intent:** Apply the same pattern to CV download count so it increments for anonymous and non-owner downloaders (RLS was blocking direct UPDATE).

**Created:**

- `supabase/migrations/010_increment_download_count_security_definer.sql` — `increment_application_download_count(p_slug)` SECURITY DEFINER function; updates only `download_count`; EXECUTE granted to `service_role` only.

**Updated:**

- `app/api/applications/[slug]/download/route.ts` — for non-owner downloaders, call `increment_application_download_count` via admin client instead of direct UPDATE.
- `docs/VIEW_COUNT_FIX.md` — extended to cover download count fix (same SECURITY DEFINER pattern).

**Bug fixed:** CV download count now increments when anonymous or non-owner users download the CV; only the backend can run the RPC.

---

## 41. Merge pull request #5 — fix-view-count-does-not-update

**Commit:** `11a3a16`  
**Intent:** Merge the "Fix: View count does not get updated" branch into main.

**Scope:** All changes from commits 38–40: BUILD_SUMMARY doc update, view count via SECURITY DEFINER RPC and service_role-only admin client (migration 009, VIEW_COUNT_FIX.md, env/admin, view route), and download count via SECURITY DEFINER RPC (migration 010, download route). No new files; merge only.

---

## 42. update build summary with latest commits

**Commit:** `cd8b4b6`  
**Intent:** Bring BUILD_SUMMARY in sync with recent commits.

**Updated:**

- `docs/BUILD_SUMMARY.md` — extended with entries for recent work.

---

## 43. refactor(view): move ViewPageContent and ViewTracker into components/view

**Commit:** `72d5f57`  
**Intent:** Move view-page components into a dedicated folder for clearer structure.

**Created:**

- `components/view/ViewPageContent.tsx` — moved from `app/view/[slug]/ViewPageContent.tsx`
- `components/view/ViewTracker.tsx` — moved from `app/view/[slug]/ViewTracker.tsx`

**Updated:**

- `app/view/[slug]/page.tsx` — imports from `components/view/`
- `docs/ARCHITECTURE.md` — reflect new paths
- `docs/BUILD_SUMMARY.md` — doc update

---

## 44. increase ViewPageContent content max-w

**Commit:** `ee4019e`  
**Intent:** Widen the content area on the view page for better readability.

**Updated:**

- `components/view/ViewPageContent.tsx` — increased content max-width
- `components/public/ApplicationPageHeader.tsx` — minor alignment/layout

---

## 45. PDFViewer: add View CV button and real Download CV with count on download only

**Commit:** `e7464da`  
**Intent:** Expose “View CV” and “Download CV” in the PDF viewer and increment download count only on actual download.

**Updated:**

- `components/pdf/PDFViewer.tsx` — View CV button, Download CV with count incremented on download only

---

## 46. feat: allow choosing CV download filename for recruiter downloads

**Commit:** `21361ea`  
**Intent:** Let recruiters set a custom filename for CV downloads (e.g. `JohnDoe_CV.pdf`).

**Created:**

- `lib/utils/cv-filename.ts` — logic for CV download filename
- `supabase/migrations/011_application_cv_filename.sql` — add `cv_filename` (or equivalent) to applications

**Updated:**

- `app/admin/edit/[id]/page.tsx`, `app/api/applications/route.ts`, `components/forms/ApplicationForm.tsx` — support cv_filename in form and API
- `components/pdf/PDFViewer.tsx`, `components/view/ViewPageContent.tsx` — use chosen filename for download
- `lib/types/application.ts`, `lib/types/database.ts` — type for cv_filename
- `docs/ARCHITECTURE.md`, `docs/DATA_FLOW.md` — document cv_filename

---

## 47. Improve application view header: add profile image, ExternalLinkButton, and responsive layout

**Commit:** `a525af6`  
**Intent:** Enhance the public application view header with candidate profile image, external-link button, and responsive layout.

**Created:**

- `components/ui/ExternalLinkButton.tsx` — reusable external-link button

**Updated:**

- `components/public/ApplicationPageHeader.tsx` — profile image, ExternalLinkButton, responsive layout

---

## 48. Add profile picture feature with Supabase Storage and per-application visibility toggle

**Commit:** `5e2992b`  
**Intent:** Allow candidates to upload a profile picture (Supabase Storage) and let recruiters toggle visibility per application.

**Created:**

- **API:** `app/api/upload/profile-picture/route.ts`
- **Forms:** `components/forms/ProfilePictureField.tsx`, `components/forms/CvDownloadFilenameField.tsx`, `components/forms/NameInUrlField.tsx`
- **Lib:** `lib/utils/profile-picture-storage.ts`
- **Docs:** `docs/PROFILE_PICTURE.md`
- **DB:** `supabase/migrations/012_profile_picture_and_preference.sql`, `013_application_profile_picture_url.sql`, `014_storage_profile_pictures_policies.sql`, `015_drop_profile_picture_include_preference.sql`, `016_application_show_profile_picture.sql`

**Updated:**

- `app/admin/edit/[id]/page.tsx`, `app/admin/new/page.tsx`, `app/api/applications/route.ts`, `app/api/profile/route.ts`
- `components/forms/ApplicationForm.tsx`, `components/forms/ProfileForm.tsx`, `components/public/ApplicationPageHeader.tsx`, `components/view/ViewPageContent.tsx`
- `lib/types/application.ts`, `lib/types/database.ts`, `lib/types/profile.ts`
- `docs/ARCHITECTURE.md` — profile picture and storage

---

## 49. View page: add video pitch button in header and floating modal (Escape to close)

**Commit:** `f0cf24a`  
**Intent:** Add a “Watch Video Pitch” (or similar) button in the view page header and a floating modal for the video; Escape closes the modal.

**Updated:**

- `components/public/ApplicationPageHeader.tsx` — video pitch button
- `components/view/ViewPageContent.tsx` — modal integration

---

## 50. Support YouTube Shorts URLs and vertical embed aspect ratio

**Commit:** `0c21272`  
**Intent:** Parse YouTube Shorts URLs and render the embed with a vertical aspect ratio where appropriate.

**Updated:**

- `lib/utils/youtube.ts` — Shorts URL parsing
- `components/forms/YouTubeUrlInput.tsx`, `components/video/YouTubeEmbed.tsx` — Shorts support and vertical aspect ratio
- `components/view/ViewPageContent.tsx` — use updated embed
- `CURSOR_PROMPT.md` — context update

---

## 51. Relocate Watch Video Pitch button to job details section in ApplicationPageHeader

**Commit:** `105711a`  
**Intent:** Move the “Watch Video Pitch” button from the top-level header into the job details section for clearer hierarchy.

**Updated:**

- `components/public/ApplicationPageHeader.tsx` — button moved to job details section

---

## 52. Improve view page UI with component refactoring and enhanced styling

**Commit:** `0673bf3`  
**Intent:** Refactor view page components and improve styling (icons, layout, modals).

**Created:**

- `components/view/ApplicationPageContent.tsx` — content block for application view
- `components/view/ArchivedApplicationAlert.tsx` — alert when application is archived
- `components/view/VideoModal.tsx` — modal for video pitch

**Updated:**

- `components/admin/icons.tsx`, `components/pdf/PDFViewer.tsx`, `components/public/ApplicationPageHeader.tsx`, `components/ui/ExternalLinkButton.tsx`, `components/view/ViewPageContent.tsx` — refactor and styling

---

## 53. Remove application description field and drop DB column

**Commit:** `6036b44`  
**Intent:** Remove the application “description” field from the product and database.

**Created:**

- `supabase/migrations/017_drop_application_description.sql` — drop `description` column (or equivalent)

**Updated:**

- `app/admin/edit/[id]/page.tsx`, `app/admin/new/page.tsx`, `app/api/applications/route.ts`, `components/forms/ApplicationForm.tsx`, `components/view/ApplicationPageContent.tsx` — remove description usage
- `lib/types/application.ts`, `lib/types/database.ts` — remove description from types
- `docs/ARCHITECTURE.md`, `docs/DATA_FLOW.md`, `docs/USER_GUIDE.md`, `CURSOR_PROMPT.md` — docs and context

---

## 54. revert BUILD_SUMMARY changes

**Commit:** `3e3cbfa`  
**Intent:** Revert unintended or temporary changes to BUILD_SUMMARY.

**Updated:**

- `docs/BUILD_SUMMARY.md` — reverted to previous state.

---

## 55. revert BUILD_SUMMARY changes

**Commit:** `41d034a`  
**Intent:** Revert BUILD_SUMMARY again (second revert in sequence).

**Updated:**

- `docs/BUILD_SUMMARY.md` — reverted.

---

## 56. Add view page footer for recruiters only and viewer-status API

**Commit:** `7803a0f`  
**Intent:** Show a footer on the view page only for recruiters (e.g. signed-in viewers) and add an API to expose viewer status.

**Created:**

- `app/api/applications/[slug]/viewer-status/route.ts` — API to return whether current viewer is recruiter/owner
- `components/public/ViewPageFooter.tsx` — footer shown only for recruiters

**Updated:**

- `components/public/ApplicationPageHeader.tsx`, `components/view/ViewPageContent.tsx` — integrate footer and viewer context
- `docs/ARCHITECTURE.md` — document viewer-status and footer

---

## 57. Merge pull request #6 — improve-view-page-ui

**Commit:** `6c180ad`  
**Intent:** Merge the “Improve view page UI” branch into main.

**Scope:** All changes from commits 42–56: BUILD_SUMMARY updates, view refactor (ViewPageContent/ViewTracker in components/view), wider content, PDFViewer View/Download CV and count, CV download filename, view header (profile image, ExternalLinkButton, responsive), profile picture feature and storage, video pitch button and modal, YouTube Shorts and vertical embed, Watch Video Pitch in job details, view page UI refactor (ApplicationPageContent, ArchivedApplicationAlert, VideoModal), removal of application description and DB migration, BUILD_SUMMARY reverts, view page footer for recruiters and viewer-status API. Merge only.

---

## Summary table

| #   | Commit    | Type     | Summary                                                        |
| --- | --------- | -------- | -------------------------------------------------------------- |
| 1   | `19a1111` | scaffold | Next.js app bootstrap                                          |
| 2   | `dcf670a` | docs     | README for project                                             |
| 3   | `9ddb9fa` | tooling  | CURSOR_PROMPT.md                                               |
| 4   | `604c19d` | feature  | HireView core: auth, admin, apply/view, APIs, DB               |
| 5   | `631252a` | chore    | Cursor commit message command                                  |
| 6   | `4005c55` | fix      | Edit page: normalize DB → form data                            |
| 7   | `927f0b3` | docs     | ARCHITECTURE.md                                                |
| 8   | `44f7dd6` | UX       | Dashboard + Sign out when signed in; logo → /                  |
| 9   | `cdc267f` | fix      | Sign out redirects to homepage                                 |
| 10  | `ee741d5` | refactor | PublicSiteHeader, AdminHeader                                  |
| 11  | `e9dfaec` | refactor | MarketingHeader, ApplicationPageHeader; route /view            |
| 12  | `3c52312` | chore    | App title MyHireView                                           |
| 13  | `0dfa1e3` | refactor | Hooks, API client, dashboard/landing components                |
| 14  | `4e1486b` | refactor | SignOutButton → components/auth                                |
| 15  | `5b034bf` | fix      | ViewTracker path alias                                         |
| 16  | `89e0dcb` | merge    | PR #1 mvp-refactor                                             |
| 17  | `f5d964a` | feature  | Basic profile page                                             |
| 18  | `354f649` | feature  | Profiles table + candidate snapshot on applications            |
| 19  | `1fbf4e6` | feature  | Candidate field toggles, form components, framer-motion        |
| 20  | `93929d9` | docs     | DATA_FLOW.md, USER_GUIDE.md                                    |
| 21  | `127efe9` | feature  | Name in slug: None / At start / At end                         |
| 22  | `21a78df` | fix      | Mermaid labels quoted for GitHub                               |
| 23  | `151667b` | fix      | Mermaid rectangle nodes for GitHub                             |
| 24  | `eac7494` | merge    | PR #2 create-profile-page                                      |
| 25  | `fe2826e` | docs     | BUILD_SUMMARY + link in README                                 |
| 26  | `3956b3a` | docs     | BUILD_SUMMARY update policy                                    |
| 27  | `c19c88e` | feature  | CV upload on save, blob delete, optional preview modal         |
| 28  | `a5da3f6` | fix      | Missing CV blob: existence check and retry UI                  |
| 29  | `20bf0e8` | merge    | PR #3 bug-cv-in-blob                                           |
| 30  | `a40e651` | docs     | BUILD_SUMMARY extended through PR #3                           |
| 31  | `f8585bb` | refactor | Horizontal ApplicationCard layout                              |
| 32  | `87c80a8` | UX       | Application card status: clock (unviewed), check (viewed)      |
| 33  | `e0b9ad2` | fix      | Exclude applicant from view count when viewing own application |
| 34  | `73b87c1` | feature  | CV download count tracking, insights (owner excluded)          |
| 35  | `88d0e20` | feature  | Last viewed tracking                                           |
| 36  | `85667e7` | refactor | InsightItem + responsive grid for application card insights    |
| 37  | `a00c745` | merge    | PR #4 update-application-cards-horizontal                      |
| 38  | `04822bf` | docs     | BUILD_SUMMARY through commit 37, unify list formatting         |
| 39  | `1824d5e` | fix      | View count via SECURITY DEFINER RPC, service_role admin client |
| 40  | `68f019e` | fix      | Download count via SECURITY DEFINER RPC for anon/non-owner     |
| 41  | `11a3a16` | merge    | PR #5 fix-view-count-does-not-update                           |
| 42  | `cd8b4b6` | docs     | BUILD_SUMMARY with latest commits                              |
| 43  | `72d5f57` | refactor | ViewPageContent, ViewTracker → components/view                 |
| 44  | `ee4019e` | UX       | ViewPageContent content max-w increased                        |
| 45  | `e7464da` | feature  | PDFViewer: View CV button, Download CV with count              |
| 46  | `21361ea` | feature  | CV download filename for recruiter downloads                  |
| 47  | `a525af6` | UX       | View header: profile image, ExternalLinkButton, responsive    |
| 48  | `5e2992b` | feature  | Profile picture with Supabase Storage, per-app visibility      |
| 49  | `f0cf24a` | feature  | Video pitch button and floating modal (Escape to close)        |
| 50  | `0c21272` | feature  | YouTube Shorts URLs and vertical embed                         |
| 51  | `105711a` | UX       | Watch Video Pitch button in job details section                |
| 52  | `0673bf3` | refactor | View page UI: ApplicationPageContent, VideoModal, styling      |
| 53  | `6036b44` | refactor | Remove application description field and DB column            |
| 54  | `3e3cbfa` | chore    | Revert BUILD_SUMMARY changes                                   |
| 55  | `41d034a` | chore    | Revert BUILD_SUMMARY changes                                   |
| 56  | `7803a0f` | feature  | View page footer for recruiters, viewer-status API             |
| 57  | `6c180ad` | merge    | PR #6 improve-view-page-ui                                     |

---

_Generated from the repository’s git history; each section maps to one commit in chronological order._
