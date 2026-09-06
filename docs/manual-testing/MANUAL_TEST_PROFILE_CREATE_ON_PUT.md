# Manual test: profiles at signup + picture from applications

Use a **fresh email** (or delete the test user + related `profiles` row in Supabase) so signup scenarios are real.

Requires `SUPABASE_SERVICE_ROLE_KEY` in the server env (signup profile insert).

---

## 1. Signup creates a profiles row

- [ ] Sign up with first name, last name, email, password
- [ ] In Supabase Table Editor → `profiles`: one row for that `user_id` with `first_name`, `last_name`, `public_id` set; other columns null
- [ ] Auth user → `user_metadata` also has `first_name`, `last_name`, `public_id`

### If email confirmation is ON

- [ ] Signup response / UI indicates confirmation required
- [ ] Profiles row still exists **before** clicking the email link (service-role insert at signup)
- [ ] After confirming via `/auth/callback`, still exactly one profiles row (idempotent)

---

## 2. Profile page

- [ ] Open `/admin/profile` — names are filled from the profiles row (not only metadata seed)
- [ ] Save location / links / picture works as before
- [ ] Picture-only change on Profile still works

---

## 3. Add / change picture from New Application

- [ ] Open `/admin/new`
- [ ] Under Profile picture, click **Add profile picture** (or **Change picture** if one exists)
- [ ] Modal: choose JPEG/PNG/WebP, preview, **Save picture**
- [ ] Thumbnail appears; Yes/No toggle enables; Yes can be selected
- [ ] Save the application with “show picture” on; public view shows the avatar
- [ ] Replace and remove from the modal; confirm Storage / profile URL update

---

## 4. Same modal on Edit Application

- [ ] Open `/admin/edit/[id]` for an existing application
- [ ] Change picture via the modal; application form preview updates without leaving the page
- [ ] Candidate text fields still do **not** update from live profile (snapshot notice remains true for name/location/links); picture remains live when shown

---

## 5. Failure / edge cases

- [ ] Invalid file type or >5MB in modal → error, no save
- [ ] Cancel modal → no profile change
- [ ] (Optional) Temporarily break service role and sign up: Auth user exists; after fixing env and confirming email / hitting callback, profiles row appears. Or delete the profiles row while keeping Auth metadata, then Save picture from `/admin/new` — PUT should create the row from metadata (C3-026).

---

## 6. Regression

- [ ] Login still does not create a duplicate profiles row
- [ ] GET `/api/profile` returns **200** for a fresh confirmed user
- [ ] Dashboard share links still use `public_id`
