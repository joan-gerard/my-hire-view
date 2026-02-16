# PR #2 — Create profile page

Commit-by-commit detail for PR #2 (create-profile-page): commits `f5d964a` through `151667b`, plus merge. See [BUILD_SUMMARY.md](../BUILD_SUMMARY.md) for the full index.

---

## 17. create basic profile page

**Commit:** `f5d964a`  
**Intent:** Let users manage a recruiter-facing profile (first step toward candidate snapshot).

**Created:**

- `app/admin/profile/page.tsx` — basic profile page in admin (likely form or placeholder for name, title, etc.).

**Updated:**

- `components/admin/AdminHeader.tsx` — link to profile (e.g. "Profile" in nav).
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
- `docs/USER_GUIDE.md` — how to use MyHireView (create application, edit profile, share link, etc.).

**Updated:**

- `README.md` — links or references to DATA_FLOW and USER_GUIDE.

---

## 21. feat: name in slug — choose None, At start, or At end

**Commit:** `127efe9`  
**Intent:** Let users choose whether and how the candidate name appears in the shareable URL.

**Created:**

- `supabase/migrations/005_application_include_name_in_slug.sql` — add or repurpose column for "include name in slug" (e.g. boolean or enum).
- `supabase/migrations/006_slug_name_position_text.sql` — store slug name position as text: `'start'`, `'end'`, or none.

**Updated:**

- `app/admin/edit/[id]/page.tsx` — normalize DB value (legacy boolean or `'start'|'end'|null`) to form `slugNamePosition`; when slug or name position changes, call slug API with `slugNamePosition` and optional `first_name`/`last_name`.
- `app/admin/new/page.tsx` — pass `slugNamePosition` and name to slug API when creating.
- `app/api/applications/route.ts` — read/write new slug name position; pass through to slug generation where needed.
- `app/api/slug/route.ts` — accept `slugNamePosition` and optional `first_name`/`last_name`; generate slug with name at start, end, or not at all.
- `components/forms/ApplicationForm.tsx` — add UI for "Name in slug": None / At start / At end; include first/last name when relevant.
- `lib/types/application.ts`, `lib/types/database.ts` — `slugNamePosition` (or equivalent) and any new DB fields.
- `lib/utils/slug-generate.ts`, `lib/utils/slug.ts` — generate slug with name at start, end, or no name.
- `README.md`, `docs/ARCHITECTURE.md`, `docs/DATA_FLOW.md`, `docs/USER_GUIDE.md` — document new migrations and behavior.

**Result:** Shareable URL can be e.g. `view/jane-doe-frontend-engineer-acme` (name at start), `view/frontend-engineer-acme-jane-doe` (name at end), or without name; choice is stored and used when generating/regenerating the slug.

---

## 22. fix(docs): quote Mermaid API node labels so GitHub renders diagram

**Commit:** `21a78df`  
**Intent:** Fix Mermaid rendering on GitHub (e.g. in DATA_FLOW.md).

**Updated:**

- `docs/DATA_FLOW.md` — wrap API node labels in quotes in Mermaid so GitHub's Mermaid renderer displays the diagram correctly.

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
**Intent:** Merge the "Create profile page" branch (profile + candidate snapshot + toggles + docs + name-in-slug + doc fixes).

**Scope:** All changes from commits 17–23: profile page, profiles table, candidate snapshot, candidate field toggles and form components, DATA_FLOW and USER_GUIDE, name-in-slug feature, and Mermaid doc fixes. No new files; merge only.

---
