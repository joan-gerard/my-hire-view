# Manual test checklist — Primary CVs, tailored CVs, and application status

Use this after applying migrations **`021_application_status_and_archived_at.sql`**, **`022_master_cvs.sql`**, **`024_primary_cvs_rename.sql`**, and **`027_applications_primary_cv_same_user.sql`**. Prefer a test account with R2 env vars configured (`.env.local`). See [CV_REUSE_AND_STORAGE.md](../retrospectives/CV_REUSE_AND_STORAGE.md).

**Prerequisites**

- [ ] `pnpm run dev` running
- [ ] Migrations `021`–`027` applied in Supabase
- [ ] R2 configured (`R2_*` in `.env.local`); uploads succeed
- [ ] Logged in as a user who can open `/admin`, `/admin/profile`, `/admin/new`
- [ ] Access to Supabase **Table Editor** → `applications`, `primary_cvs` (and R2 dashboard optional)
- [ ] One small PDF (~1 page) for reuse; ideally a second PDF for tailored tests

---

## 1. Application status (replaces `is_active`)

- [ ] Create (or use) an application → row has `status = active`, `archived_at` is null
- [ ] Dashboard card shows **active** status icon (not archived)
- [ ] From the card menu → **Archive**
- [ ] Card shows archived state; Supabase: `status = archived`, `archived_at` is set (recent timestamp)
- [ ] Open the public view URL → “doesn’t have an active application” empty state; no CV/video/header candidate details; public GET returns `{ status: "unavailable" }`
- [ ] From the card menu → **Restore**
- [ ] Card active again; Supabase: `status = active`, `archived_at` is **null**
- [ ] Archive again → `archived_at` is a **new** timestamp (clock reset)

**Negative / smoke**

- [ ] `is_active` column is **gone** from `applications` (migration applied)
- [ ] Profile page application counts still make sense (active vs archived)

---

## 2. Primary CV library (max 5)

**On profile**

- [ ] Open `/admin/profile`
- [ ] See **Primary CVs** section
- [ ] With empty library: message that none exist yet
- [ ] **Upload primary CV** → choose PDF → appears in the list with filename
- [ ] Supabase `primary_cvs`: one row (`user_id`, `url`, `filename`)
- [ ] R2 (optional): object under `cvs/{userId}/primary/…`
- [ ] **View** link opens the PDF
- [ ] Upload until **5** primaries succeed
- [ ] Sixth upload is blocked (button disabled and/or API error about limit 5)
- [ ] Delete one primary → upload again works

**Delete primary (profile or Manage library modal)**

- [ ] Delete a primary **not** used by any application → removed immediately (no confirm modal)
- [ ] Attach a primary to 1+ applications, then Delete → confirm shows the **exact count** and a preview list (company — role, status; links to edit)
- [ ] If more than 10 apps use it, preview shows the first 10 plus “and N more”
- [ ] Cancel → CV still in list and in R2
- [ ] Confirm (**I Understand — Delete**) → removed from list; R2 object gone (optional check)
- [ ] Affected apps: status/message about “CV missing” (see §5)

**From New / Edit application (same library)**

- [ ] Open `/admin/new` (or edit) → CV section shows **Manage library**
- [ ] With empty library: **Upload one to your library** / **Upload primary CV** opens the modal
- [ ] Upload a PDF in the modal → list updates; create form switches to **primary** and selects the new file
- [ ] Close modal (**Done**) → dropdown includes the new primary
- [ ] Delete a selected primary in the modal → if unused, gone immediately; if used, inline confirm with count → selection moves to another primary (or switches to tailored if none left)
- [ ] Library on `/admin/profile` matches what you changed from New/Edit

---

## 3. Create application — default primary, optional tailored

**With at least one primary CV**

- [ ] Open `/admin/new`
- [ ] CV section defaults to **Primary CV**
- [ ] Dropdown lists primaries; first (or a chosen) primary is selectable
- [ ] Save application with a primary selected (no tailored file upload required)
- [ ] Supabase application: `cv_type = primary`, `primary_cv_id` set, `cv_url` matches that primary
- [ ] Public view loads the PDF

**Tailored override**

- [ ] New application → switch to **Tailored CV for this application**
- [ ] Select a PDF → Save
- [ ] Application: `cv_type = tailored`, `primary_cv_id` null, new `cv_url`
- [ ] R2 has a tailored object for that upload (`cvs/{userId}/tailored/…`)

**No primaries yet**

- [ ] (Optional) Delete all primaries (or use a fresh user)
- [ ] `/admin/new` → Primary option disabled until you upload via **Manage library**; can use **Tailored** instead
- [ ] Creating with tailored still works

---

## 4. Edit application — show mode, switch primary ↔ tailored

- [ ] Open edit for an app that uses a **primary** CV
- [ ] Form shows **Primary CV** selected and the CV name / selection
- [ ] Switch to **Tailored**, upload a different PDF → Save
- [ ] Application: `cv_type = tailored`; primary library unchanged; old primary file still in library
- [ ] Open edit for that **tailored** app
- [ ] Form shows **Tailored CV** and filename / View as expected
- [ ] Switch to **Primary CV** → confirm modal: tailored file will be deleted; click **I Understand**
- [ ] Pick a primary → Save
- [ ] Application: `cv_type = primary`, `primary_cv_id` set
- [ ] Previous tailored R2 object is gone (optional: HeadObject / R2 UI); primary still exists

**Switch primary A → primary B**

- [ ] Edit → choose a different primary → Save
- [ ] `primary_cv_id` / `cv_url` update; neither primary deleted from library

---

## 5. Delete rules (application vs primary)

**Delete application that uses tailored CV**

- [ ] Note `cv_url` / R2 key
- [ ] Delete application from dashboard
- [ ] Tailored object removed from R2
- [ ] Primary library (if any) unchanged

**Delete application that uses primary CV**

- [ ] Note primary still listed on profile
- [ ] Delete application
- [ ] Primary CV still on profile and still in R2
- [ ] `primary_cvs` row still present

**Delete primary while apps still reference it**

- [ ] Create two apps pointing at the same primary
- [ ] Delete that primary from profile (confirm)
- [ ] Both apps still exist; dashboard shows **CV missing** on those cards
- [ ] Public/edit may show missing CV / retry behaviour
- [ ] Edit an affected app → pick another primary or tailored → Save → badge clears after refresh

---

## 6. Dashboard missing-CV signal

- [ ] With a healthy CV: card does **not** show “CV missing”
- [ ] After primary delete (or broken URL): card shows **CV missing** badge / warning
- [ ] Fix CV on edit → return to `/admin` → badge gone (may need refresh)

---

## 7. Archive + CV interaction smoke

- [ ] Archive an app that uses a primary CV → public page inactive-link empty state; primary file still in library
- [ ] Restore → view works again with same primary PDF
- [ ] Archive a tailored-CV app → restore → tailored PDF still loads (unless you deleted it elsewhere)
- [ ] Delete an application → old public URL shows the same inactive-link empty state

---

## 8. API smoke (optional Network tab)

- [ ] `GET /api/profile/primary-cvs` → list for current user; each row includes `applications_count` and `used_by` (preview apps)
- [ ] `POST /api/profile/primary-cvs` (multipart PDF) → **201** with `applications_count: 0`, `used_by: []`
- [ ] `DELETE /api/profile/primary-cvs?id=…` → `{ success: true, applications_affected: N }`
- [ ] `GET /api/applications` → items include `status`, `archived_at`, `cv_url`, `cv_exists`
- [ ] Archive via `PUT /api/applications` `{ id, status: "archived" }` → response has `archived_at`
- [ ] Restore via `PUT` `{ id, status: "active" }` → `archived_at` null

---

## 9. Regressions

- [ ] Profile picture upload / show-on-application still works
- [ ] Slug generation / Name in URL still works on create and edit
- [ ] Copy link / View Application from dashboard still works (`/view/{publicId}/{slug}`)
- [ ] View and download counts still increment for non-owners
- [ ] `pnpm test:ci` green

---

## Quick Supabase checks (optional)

- [ ] `applications` has `status`, `archived_at`, `cv_type`, `primary_cv_id`; no `is_active`
- [ ] `primary_cvs` rows only for the owning `user_id`
- [ ] Deleting a primary sets `applications.primary_cv_id` to null where FK `ON DELETE SET NULL` applied (URL may still point at deleted object until edited); `applications.user_id` must remain set
- [ ] (B3-042) In SQL Editor as a privileged role, an `UPDATE` that sets `primary_cv_id` to another user’s library id is rejected by trigger `applications_primary_cv_same_user`
- [ ] (B3-042) In SQL Editor, changing `primary_cvs.user_id` on a referenced (or any) row is rejected by trigger `primary_cvs_user_id_immutable`
- [ ] (B3-042) No live apps should still point at another user’s primary URL: `SELECT id, slug, status, cv_url FROM applications WHERE cv_url LIKE 'https://invalid.local/quarantined-cross-user-cv/%'` (quarantined rows are draft; URL includes the application id); foreign library URLs must not appear on `status = active` rows

---

## Explicitly out of scope (after launch)

Do **not** expect yet:

- Auto-purge of archived apps after 90 days
- Dashboard 90-day retention tooltip / countdown
- Retention emails
- Feature flag for purge

Those are tracked in [Backlog.md](../Backlog.md) (After launch).

---

## Done when

All applicable boxes pass with migrations `021`–`027` applied, and `pnpm test:ci` is green.
