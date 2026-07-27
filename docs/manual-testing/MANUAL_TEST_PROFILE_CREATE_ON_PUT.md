# Manual test checklist — Profile create-on-first-PUT

Use this after the read-only GET profile / metadata-seeded signup flow. Prefer a **fresh email** (or delete the test user + related `profiles` row in Supabase) so “no profile yet” scenarios are real.

**Prerequisites**

- [x] `pnpm run dev` running
- [x] Supabase project reachable; Email provider enabled
- [x] Know whether **Confirm email** is ON or OFF for this project
- [x] Access to Supabase Dashboard → **Authentication → Users** and **Table Editor → profiles**

---

## 1. Signup (no profiles row yet)

- [x] Open `/signup`
- [x] Submit with first name, last name, email, password, matching confirm password
- [x] If Confirm email **ON**: see “check your email” notice; do **not** get a session into `/admin` yet
- [ ] If Confirm email **OFF**: land in `/admin` (or can open it)
- [x] In Supabase **profiles**: confirm **no new row** for this user
- [x] In Supabase **Users**: open the user → `user_metadata` contains `first_name` and `last_name`

**Negative checks**

- [x] Mismatched confirm password → client or API error; no user created (or no success)
- [x] Missing first or last name → rejected
- [x] Password shorter than 6 characters → rejected

---

## 2. Email confirmation (only if Confirm email is ON)

- [x] Click the confirmation link in email
- [x] Land in `/admin` (or `/login` then sign in successfully)
- [x] Still **no** `profiles` row in Supabase
- [x] `/login` does **not** redirect-loop

---

## 3. Login (still no profiles row)

- [x] Sign out if needed
- [x] Sign in at `/login` with the new account
- [x] Reach `/admin` successfully
- [x] **profiles** table still has **no** row for this user

---

## 4. Profile page — seed from metadata, create on first save

- [x] Open `/admin/profile`
- [x] First and last name fields show signup names (from metadata)
- [x] Banner/copy about saving profile appears (no saved profile yet)
- [ ] **Save profile** is enabled on first visit (no profiles row) when names are filled
- [ ] Clearing first or last name disables **Save profile**
- [x] In Network (or logs): no requirement that GET `/api/profile` invent a row — missing profile is OK
- [x] Change location (optional), keep names, click **Save**
- [x] Supabase **profiles**: row appears with `user_id`, first/last name, optional location
- [x] Reload `/admin/profile` — values persist from the DB row
- [x] Banner about “prefilled from signup” is gone (or no longer shown)
- [ ] With no further edits after save, **Save profile** is disabled
- [ ] Edit a field → **Save profile** enables; revert the edit → disables again

**Name sync to Auth**

- [x] Change first and/or last name on profile → Save
- [x] In Supabase **Users → user_metadata**: names match the new values
- [ ] Clearing first or last name disables **Save profile** (cannot submit empty names)

---

## 5. GET `/api/profile` is read-only

While logged in as a user **with** a profile:

- [x] `GET /api/profile` → **200** + `data`

While logged in as a user **without** a profile (new signup before first save), or after deleting their profiles row in Dashboard:

- [x] `GET /api/profile` → **404** `{ error: "Profile not found" }`
- [x] Calling GET again does **not** create a row

---

## 6. New application — metadata fallback + nudge

**Before first profile save** (no profiles row):

- [x] Open `/admin/new`
- [x] See notice recommending completing your profile (arrow icon links to `/admin/profile`)
- [x] Candidate first/last name prefilled from signup metadata
- [x] Location / portfolio / LinkedIn empty (unless you typed them)
- [x] Create a minimal application (company, role, etc.) and save
- [x] Application row stores the names you submitted from the form
- [x] Still optional: profiles row may still be absent until profile Save

**After profile save** (full profile with location/links/picture optional):

- [x] Open `/admin/new` again
- [x] Prefill comes from **profiles** (names + other saved fields)
- [ ] Profile-complete nudge is **not** shown

---

## 7. Edit application — application snapshot only

- [ ] Open edit for an existing application
- [ ] Candidate name/location/links match **that application**, not live profile/metadata alone
- [ ] Change a candidate field on the application → Save
- [ ] Re-open edit → application values persist; `/admin/profile` unchanged
- [ ] Profile picture toggle still can use current profile picture URL when a profile exists (unchanged behavior)

---

## 8. Existing user with a profiles row already

- [ ] Log in as an older account that already has a profile
- [ ] `/admin/profile` loads DB values
- [ ] Change name → Save → `user_metadata` updates
- [ ] `/admin/new` prefills from profiles (no metadata-only path needed)

---

## 9. Auth UX smoke (regressions)

- [ ] `/login` with valid session does not infinite-loop (redirects once to `/admin` if already authenticated)
- [ ] `/signup` same: authenticated user redirected to `/admin`
- [ ] Logout → login works
- [ ] Confirm-email path still exchanges code when Confirm email is ON (fresh signup)

---

## Quick Supabase SQL / UI checks (optional)

- [ ] After signup only: `profiles` count for that `user_id` = 0
- [ ] After first profile PUT: exactly one row for that `user_id`
- [ ] `auth.users.raw_user_meta_data` (or Dashboard metadata) has `first_name` / `last_name` matching latest profile save

---

## Done when

All applicable boxes above pass for your Confirm-email setting, and `pnpm test:ci` is green.
