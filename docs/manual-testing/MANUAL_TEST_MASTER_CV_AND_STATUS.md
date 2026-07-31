# Manual test checklist — Master CVs, custom CVs, and application status

Use this after applying migrations **`021_application_status_and_archived_at.sql`** and **`022_master_cvs.sql`**. Prefer a test account with R2 env vars configured (`.env.local`). See [CV_REUSE_AND_STORAGE.md](../CV_REUSE_AND_STORAGE.md).

**Prerequisites**

- [ ] `pnpm run dev` running
- [ ] Migrations `021` and `022` applied in Supabase
- [ ] R2 configured (`R2_*` in `.env.local`); uploads succeed
- [ ] Logged in as a user who can open `/admin`, `/admin/profile`, `/admin/new`
- [ ] Access to Supabase **Table Editor** → `applications`, `master_cvs` (and R2 dashboard optional)
- [ ] One small PDF (~1 page) for reuse; ideally a second PDF for “custom” tests

---

## 1. Application status (replaces `is_active`)

- [ ] Create (or use) an application → row has `status = active`, `archived_at` is null
- [ ] Dashboard card shows **active** status icon (not archived)
- [ ] From the card menu → **Archive**
- [ ] Card shows archived state; Supabase: `status = archived`, `archived_at` is set (recent timestamp)
- [ ] Open the public view URL → archived warning; CV/video not shown to recruiters
- [ ] From the card menu → **Restore**
- [ ] Card active again; Supabase: `status = active`, `archived_at` is **null**
- [ ] Archive again → `archived_at` is a **new** timestamp (clock reset)

**Negative / smoke**

- [ ] `is_active` column is **gone** from `applications` (migration applied)
- [ ] Profile page application counts still make sense (active vs archived)

---

## 2. Master CV library (max 5)

**On profile**

- [ ] Open `/admin/profile`
- [ ] See **Master CVs** section
- [ ] With empty library: message that none exist yet
- [ ] **Upload master CV** → choose PDF → appears in the list with filename
- [ ] Supabase `master_cvs`: one row (`user_id`, `url`, `filename`)
- [ ] R2 (optional): object under `cvs/masters/{userId}/…`
- [ ] **View** link opens the PDF
- [ ] Upload until **5** masters succeed
- [ ] Sixth upload is blocked (button disabled and/or API error about limit 5)
- [ ] Delete one master → upload again works

**Delete master (profile or Manage library modal)**

- [ ] Delete a master **not** used by any application → removed immediately (no confirm modal)
- [ ] Attach a master to 1+ applications, then Delete → confirm shows the **exact count** and a preview list (company — role, status; links to edit)
- [ ] If more than 10 apps use it, preview shows the first 10 plus “and N more”
- [ ] Cancel → CV still in list and in R2
- [ ] Confirm (**I Understand — Delete**) → removed from list; R2 object gone (optional check)
- [ ] Affected apps: status/message about “CV missing” (see §5)

**From New / Edit application (same library)**

- [ ] Open `/admin/new` (or edit) → CV section shows **Manage library**
- [ ] With empty library: **Upload one to your library** / **Upload master CV** opens the modal
- [ ] Upload a PDF in the modal → list updates; create form switches to **master** and selects the new file
- [ ] Close modal (**Done**) → dropdown includes the new master
- [ ] Delete a selected master in the modal → if unused, gone immediately; if used, inline confirm with count → selection moves to another master (or switches to custom if none left)
- [ ] Library on `/admin/profile` matches what you changed from New/Edit

---

## 3. Create application — default master, optional custom

**With at least one master CV**

- [ ] Open `/admin/new`
- [ ] CV section defaults to **Master CV**
- [ ] Dropdown lists masters; first (or a chosen) master is selectable
- [ ] Save application with a master selected (no custom file upload required)
- [ ] Supabase application: `cv_kind = master`, `master_cv_id` set, `cv_url` matches that master
- [ ] Public view loads the PDF

**Custom override**

- [ ] New application → switch to **Custom CV for this application**
- [ ] Select a PDF → Save
- [ ] Application: `cv_kind = custom`, `master_cv_id` null, new `cv_url`
- [ ] R2 has a custom/idempotency object for that upload

**No masters yet**

- [ ] (Optional) Delete all masters (or use a fresh user)
- [ ] `/admin/new` → Master option disabled until you upload via **Manage library**; can use **Custom** instead
- [ ] Creating with custom still works

---
## 4. Edit application — show mode, switch master ↔ custom

- [ ] Open edit for an app that uses a **master** CV
- [ ] Form shows **Master CV** selected and the CV name / selection
- [ ] Switch to **Custom**, upload a different PDF → Save
- [ ] Application: `cv_kind = custom`; master library unchanged; old master file still in library
- [ ] Open edit for that **custom** app
- [ ] Form shows **Custom CV** and filename / View as expected
- [ ] Switch to **Master CV** → confirm modal: custom will be deleted; click **I Understand**
- [ ] Pick a master → Save
- [ ] Application: `cv_kind = master`, `master_cv_id` set
- [ ] Previous custom R2 object is gone (optional: HeadObject / R2 UI); master still exists

**Switch master A → master B**

- [ ] Edit → choose a different master → Save
- [ ] `master_cv_id` / `cv_url` update; neither master deleted from library

---

## 5. Delete rules (application vs master)

**Delete application that uses custom CV**

- [ ] Note `cv_url` / R2 key
- [ ] Delete application from dashboard
- [ ] Custom object removed from R2
- [ ] Master library (if any) unchanged

**Delete application that uses master CV**

- [ ] Note master still listed on profile
- [ ] Delete application
- [ ] Master CV still on profile and still in R2
- [ ] `master_cvs` row still present

**Delete master while apps still reference it**

- [ ] Create two apps pointing at the same master
- [ ] Delete that master from profile (confirm)
- [ ] Both apps still exist; dashboard shows **CV missing** on those cards
- [ ] Public/edit may show missing CV / retry behaviour
- [ ] Edit an affected app → pick another master or custom → Save → badge clears after refresh

---

## 6. Dashboard missing-CV signal

- [ ] With a healthy CV: card does **not** show “CV missing”
- [ ] After master delete (or broken URL): card shows **CV missing** badge / warning
- [ ] Fix CV on edit → return to `/admin` → badge gone (may need refresh)

---

## 7. Archive + CV interaction smoke

- [ ] Archive an app that uses a master CV → public page archived; master file still in library
- [ ] Restore → view works again with same master PDF
- [ ] Archive a custom-CV app → restore → custom PDF still loads (unless you deleted it elsewhere)

---

## 8. API smoke (optional Network tab)

- [ ] `GET /api/profile/master-cvs` → list for current user; each row includes `applications_count` and `used_by` (preview apps)
- [ ] `POST /api/profile/master-cvs` (multipart PDF) → **201** with `applications_count: 0`, `used_by: []`
- [ ] `DELETE /api/profile/master-cvs?id=…` → `{ success: true, applications_affected: N }`
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

- [ ] `applications` has `status`, `archived_at`, `cv_kind`, `master_cv_id`; no `is_active`
- [ ] `master_cvs` rows only for the owning `user_id`
- [ ] Deleting a master sets `applications.master_cv_id` to null where FK `ON DELETE SET NULL` applied (URL may still point at deleted object until edited)

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

All applicable boxes pass with migrations `021`–`022` applied, and `pnpm test:ci` is green.
