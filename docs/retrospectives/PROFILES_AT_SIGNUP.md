# Profiles at signup (revisiting “create on first PUT”)

This retrospective explains why MyHireView initially deferred creating a `profiles` row until the first profile save, what that cost us, and why we now create a minimal row at signup (and again idempotently on the auth callback).

---

## The earlier decision

After collecting first/last name at signup, we stored them only in Auth `user_metadata`. The `profiles` table stayed empty until the user visited **Profile** and clicked **Save** (`PUT /api/profile` upsert).

### Why that felt right

| Reason | Rationale at the time |
|--------|------------------------|
| Lazy create | No empty-looking row until the user “meant” to have a profile |
| Avoid service role on signup | With email confirmation ON, `signUp` often returns **no session**, so a normal authenticated insert into `profiles` would fail under RLS |
| Metadata as seed | `/admin/profile` and `/admin/new` could prefill names from `user_metadata` without a DB row |
| Simpler signup path | Signup only talked to Auth; profile was “owned” by the profile API |

`ensureProfilePublicId` could still create a **minimal** row on first application create so share URLs worked — but a full profile (and especially `profile_picture_url`) still depended on visiting Profile.

---

## What broke down

We wanted users to **add or change their profile picture from `/admin/new` and `/admin/edit`**, not only from `/admin/profile`.

That needs a picture-only `PUT /api/profile` (`{ profile_picture_url }`). The profile API merges with the existing row and still requires non-empty first/last name after merge. Without a profiles row (or without names already stored), a picture-only update fails or forces the modal to also send names and invent a “first save” path.

Other friction from deferred create:

1. **Two sources of truth** — Names lived in metadata until first save; GET `/api/profile` returned 404 for every brand-new user.
2. **UI complexity** — “Complete your profile” / metadata seed banners, `hasExistingProfile` special cases, and “Save creates the row” copy.
3. **Public id timing** — Opaque `public_id` sat in metadata until profile save or application create, instead of landing on `profiles` immediately with the signup names.

The product need (manage avatar while composing an application) made “no row until Profile Save” the wrong invariant.

---

## What we do now

### At signup (`POST /api/auth/signup`)

After a successful `signUp`:

1. Still write `first_name`, `last_name`, and `public_id` into Auth `user_metadata`.
2. Call `createInitialProfile` (service-role client) to insert:

   - `user_id`, `public_id`, `first_name`, `last_name`
   - `location`, `portfolio_url`, `linkedin_url`, `profile_picture_url` → `null`

3. If the insert fails, **signup still succeeds** (user can confirm email / log in); we log and rely on the callback retry.

Service role is intentional: it works **with or without** a session (email confirmation ON or OFF).

### On email confirmation (`GET /auth/callback`)

After `exchangeCodeForSession`, call the same `createInitialProfile` with names/`public_id` from metadata. Insert is **idempotent** (skip if row exists; treat unique violation as success). That covers the case where signup’s insert failed or raced.

### Safety nets that remain

- `PUT /api/profile` still upserts (can create a row if somehow missing).
- `ensureProfilePublicId` still can create/fix `public_id` before application create.
- Profile / new-application UIs still seed from metadata if GET returns 404.

---

## Caveats we addressed

| Caveat | Approach |
|--------|----------|
| No session when confirmation required | Service-role insert at signup; callback retry after session exists |
| Double insert (signup + callback) | Idempotent select-then-insert; ignore unique conflicts |
| Signup succeeds but profile insert fails | Do not fail signup; log; callback retries |
| Picture-only PUT needs names | Names exist on the row from signup → merge succeeds |
| Open redirect on `next` | Callback only allows safe same-origin relative paths |

---

## Alternatives considered (again)

| Option | Why not |
|--------|---------|
| Keep deferred create; modal sends names too | Couples avatar UX to name fields; still 404 until first save |
| Create profile only on first application | Still blocks avatar on new/edit before first app; worse for “add picture then save app” |
| Client-side insert with session only | Breaks when confirmation is ON (no session at signup) |

---

## Docs / code pointers

- `lib/auth/create-initial-profile.ts`
- `app/api/auth/signup/route.ts`
- `app/auth/callback/route.ts`
- `components/forms/ProfilePictureModal.tsx` (uses picture-only PUT)
- [PROFILE_PICTURE.md](../PROFILE_PICTURE.md), [API_REFERENCE.md](../API_REFERENCE.md) (signup side effects)
