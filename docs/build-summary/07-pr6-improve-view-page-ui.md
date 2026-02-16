# PR #6 — Improve view page UI

Commit-by-commit detail for PR #6 (improve-view-page-ui): commits `72d5f57` through `7803a0f`, plus merge. Doc-only commits (e.g. BUILD_SUMMARY updates, reverts) are omitted. See [BUILD_SUMMARY.md](../BUILD_SUMMARY.md) for the full index.

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
**Intent:** Expose "View CV" and "Download CV" in the PDF viewer and increment download count only on actual download.

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
**Intent:** Add a "Watch Video Pitch" (or similar) button in the view page header and a floating modal for the video; Escape closes the modal.

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
**Intent:** Move the "Watch Video Pitch" button from the top-level header into the job details section for clearer hierarchy.

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
**Intent:** Remove the application "description" field from the product and database.

**Created:**

- `supabase/migrations/017_drop_application_description.sql` — drop `description` column (or equivalent)

**Updated:**

- `app/admin/edit/[id]/page.tsx`, `app/admin/new/page.tsx`, `app/api/applications/route.ts`, `components/forms/ApplicationForm.tsx`, `components/view/ApplicationPageContent.tsx` — remove description usage
- `lib/types/application.ts`, `lib/types/database.ts` — remove description from types
- `docs/ARCHITECTURE.md`, `docs/DATA_FLOW.md`, `docs/USER_GUIDE.md`, `CURSOR_PROMPT.md` — docs and context

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
**Intent:** Merge the "Improve view page UI" branch into main.

**Scope:** All changes from commits 42–56: BUILD_SUMMARY updates, view refactor (ViewPageContent/ViewTracker in components/view), wider content, PDFViewer View/Download CV and count, CV download filename, view header (profile image, ExternalLinkButton, responsive), profile picture feature and storage, video pitch button and modal, YouTube Shorts and vertical embed, Watch Video Pitch in job details, view page UI refactor (ApplicationPageContent, ArchivedApplicationAlert, VideoModal), removal of application description and DB migration, BUILD_SUMMARY reverts, view page footer for recruiters and viewer-status API. Merge only.

---
