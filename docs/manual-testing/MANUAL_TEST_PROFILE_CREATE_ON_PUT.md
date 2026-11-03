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

## 3. Picture from Profile, then New Application

- [ ] Open `/admin/new` with no picture: **Add a picture on your profile** goes to `/admin/profile`. There is no upload on the application form
- [ ] On Profile, choose JPEG/PNG/WebP, preview, **Save profile**
- [ ] Return to New Application: **Show picture** / **Hide picture** appear and the thumbnail shows when Show is selected
- [ ] Save the application with the picture shown; public view shows the avatar
- [ ] Remove the picture on Profile; New and Edit link back to Profile and do not offer Show / Hide

---

## 4. Edit Application uses the live profile

- [ ] Open `/admin/edit/[id]` for an existing application
- [ ] Name, location, and links match the profile, not an older custom value stored on the application
- [ ] A location, portfolio, or LinkedIn the saved application left empty starts Hidden
- [ ] Picture Show / Hide (Yes / No) follows the live profile picture. There is no upload on this page

---

## 5. Failure / edge cases

- [ ] Invalid file type or >5MB on Profile → error, no save
- [ ] Leave Profile without saving → no profile change
- [ ] (Optional) Temporarily break service role and sign up: Auth user exists; after fixing env and confirming email / hitting callback, profiles row appears. Or delete the profiles row while keeping Auth metadata, then Save picture from `/admin/profile` — PUT should create the row from metadata (C3-026).

---

## 6. Regression

- [ ] Login still does not create a duplicate profiles row
- [ ] GET `/api/profile` returns **200** for a fresh confirmed user
- [ ] Dashboard share links still use `public_id`
