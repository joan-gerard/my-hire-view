# PR #3 — Bug: CV in blob

Commit-by-commit detail for PR #3 (bug-cv-in-blob): commits `c19c88e` and `a5da3f6`, plus merge. See [BUILD_SUMMARY.md](../BUILD_SUMMARY.md) for the full index.

---

## 27. feat(cv): upload PDF on save, delete blob on delete/replace, optional modal cv preview

**Commit:** `c19c88e`  
**Intent:** Defer CV upload until form save, clean up old blobs on delete or replace, and add optional in-app PDF preview.

**Created:**

- `lib/utils/cv-storage.ts` — URL checks and `deleteCvIfOurs()` for safe CV storage deletion (Cloudflare R2 — see `docs/PDF_AND_R2.md`).
- `docs/PDF_AND_R2.md` — CV PDF storage.

**Updated:**

- `app/api/applications/route.ts` — on create/update/delete, delete previous blob when replacing or removing CV; upload flow aligned with save.
- `components/forms/ApplicationForm.tsx` — CV file is selected in form but uploaded only on submit (pending file state).
- `components/forms/FileUpload.tsx` — optional modal CV preview for selected file before save; pending vs saved state.
- `README.md`, `docs/ARCHITECTURE.md`, `docs/DATA_FLOW.md` — references to blob lifecycle and CV flow.

**Result:** No orphaned blobs; CV upload happens on save; user can preview selected PDF in a modal before submitting.

---

## 28. fix: handle missing CV blob with existence check and retry UI

**Commit:** `a5da3f6`  
**Intent:** When the stored CV URL points to missing storage (e.g. deleted object), check existence and show appropriate UI instead of a broken viewer or link.

**Created:**

- `app/view/[slug]/ViewPageContent.tsx` — client component for the public view page; holds application state and refetch for retry.
- `components/public/CvUnavailableWithRetry.tsx` — message when CV is unavailable, with optional "Try again" that triggers a refetch.

**Updated:**

- `lib/utils/cv-storage.ts` — added existence check (`checkCvObjectExists`) to verify the CV object exists (HEAD / HeadObject).
- `lib/types/application.ts` — optional `cv_exists` on `Application` (set by APIs when they run the check).
- `app/api/applications/[slug]/route.ts`, `app/api/applications/by-id/[id]/route.ts` — compute `cv_exists` via storage head check on `cv_url` and include in response.
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
