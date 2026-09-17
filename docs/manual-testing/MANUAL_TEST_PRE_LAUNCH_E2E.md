# Manual test — pre-launch end-to-end (F32-115)

Full candidate journey before public launch: marketing and waitlist, signup through dashboard, profile / CVs / pictures, create–edit–publish–archive–delete applications, search and pagination, Getting started checklist, public `/view` pages, and recruiter insights.

Work ticket: [Backlog.md](../Backlog.md) `F32-115`. Product copy: [USER_GUIDE.md](../USER_GUIDE.md).

**How to run:** work §§0–17 in order (happy path + in-section edges), then **§18** (remaining edges). Do not skip §18.

**Feature-specific deep dives** (DB / R2 / API extras — run if you want storage-level confirmation):

- [MANUAL_TEST_PROFILE_CREATE_ON_PUT.md](MANUAL_TEST_PROFILE_CREATE_ON_PUT.md) — signup → profiles row, picture from New/Edit
- [MANUAL_TEST_ONBOARDING_CHECKLIST.md](MANUAL_TEST_ONBOARDING_CHECKLIST.md) — Getting started prefs, skip/dismiss, no extra GETs
- [MANUAL_TEST_CREATE_APP_DRAFT_AND_CV_MODE.md](MANUAL_TEST_CREATE_APP_DRAFT_AND_CV_MODE.md) — local create draft + CV radios while library loads
- [MANUAL_TEST_APPLICATION_PREVIEW_DRAFT.md](MANUAL_TEST_APPLICATION_PREVIEW_DRAFT.md) — Save & Preview → owner banner → Publish
- [MANUAL_TEST_APPLICATION_STATUS_LEGEND.md](MANUAL_TEST_APPLICATION_STATUS_LEGEND.md) — status legend modal
- [MANUAL_TEST_PRIMARY_CV_AND_STATUS.md](MANUAL_TEST_PRIMARY_CV_AND_STATUS.md) — primary library cap, tailored delete, archive timestamps

---

## Prerequisites

- [ ] `pnpm run dev` (or the target deploy) running
- [ ] Supabase + R2 + profile-picture Storage configured (uploads succeed)
- [ ] A **fresh email** for Account A (the main candidate)
- [ ] A **second email** for Account B (isolation / two-account drafts)
- [ ] A **private/incognito window** (recruiter / signed-out)
- [ ] At least two distinct PDFs (~1 page each, under **3 MB**); ideally one **multi-page** PDF
- [ ] One JPEG, one PNG, and optionally a WebP (each under **5 MB**)
- [ ] One non-PDF and one oversized PDF (> 3 MB); one oversized image (> 5 MB)
- [ ] A **fake PDF**: any file renamed to `.pdf` that is not a real PDF (e.g. a `.txt` or `.png`)
- [ ] A **fake image**: a text file renamed to `.jpg` / `.png` (wrong magic bytes)
- [ ] GIF and/or SVG (must be rejected as profile pictures)
- [ ] A valid YouTube **watch** URL, a **youtu.be** short URL, an **embed** URL, a **Shorts** URL; one invalid URL (Vimeo or plain text)
- [ ] Optional: a second browser or device for “new session” view/download counts; a second tab of the same signed-in session

**Confirm email:** If the local Supabase project has **Confirm email** ON, complete the email link (`/auth/callback`) before dashboard checks. Production will require this (`A3-015`).

---

## Recommended applications to create (Account A)

Create these as you go so later sections have the right mix. Reuse the same primary CV unless a step says otherwise. Short company/role names are fine.

| # | Company / role (example) | Status by the end | Notes |
| - | ------------------------ | ----------------- | ----- |
| 1 | Acme / Software Engineer | **active**, viewed | Full: all candidate fields on, picture shown, primary CV, YouTube, Name in URL **At start** |
| 2 | Globex / Product Manager | **active**, never viewed | Picture **off**; location + LinkedIn on; portfolio off; primary CV; **YouTube required** |
| 3 | Initech / Designer | **draft** | Tailored CV; Name in URL **None**; custom slug |
| 4 | Umbrella / Data Analyst | **archived** | Publish first, then archive; Name in URL **At end** |
| 5 | Soylent / QA Engineer | **active** | Same **primary CV** as #1 (reuse) |
| 6 | MissingCvCo / Intern | **active**, **CV missing** | Point at a primary, then delete that primary from the library |
| 7 | Café Müller / Senior Engineer | **active** | Accents / unicode in company; slug must strip special chars (`cafe-muller-…`) |
| 8 | (very long company + role, ~200 chars each) | **draft** | Hits **128-char slug clamp**; with Name in URL **At start**, the **name segment is kept** and company/role is truncated first |
| 9+ | PageFill-01 … | whatever | Extra rows so the dashboard has **more than 20** applications (page size is 20) |

---

## 0. Route and auth guards (before you have an account)

- [ ] `/admin`, `/admin/new`, `/admin/profile`, `/admin/edit/anything` redirect to **login** when signed out
- [ ] `/login` and `/signup` load
- [ ] `/view/not-a-real-id/not-a-real-slug` shows the **unavailable** empty state (not a generic 404): “This link doesn’t have an active application”, CTA to home, compact footer
- [ ] `/view/only-one-segment` (legacy slug-only path) → unavailable empty state, not a crash / other user’s app
- [ ] `/view/{publicId}/` (missing slug) and trailing slash variants do not 500
- [ ] A nonsense path (e.g. `/this-page-does-not-exist`) shows the generic **404** with **Go Home**
- [ ] `/how-it-works` and `/blog` are gone (404). How-it-works content lives on the homepage section only
- [ ] `/terms` and `/privacy` — **404 until `F20-019` ships**; still confirm footer/view links point at those paths
- [ ] `/auth/callback` with **no** `code` → `/login` (not a 500)
- [ ] `/auth/callback?next=https://evil.com` (and `//evil.com`) still lands on a **same-origin** path (default `/admin`), never the attacker URL

---

## 1. Marketing — home (`/`)

Do this signed out (incognito is fine).

### Header

- [ ] Logo / wordmark present
- [ ] Nav includes **Pricing**
- [ ] Avatar menu → **Sign In** → `/login`
- [ ] Mobile: hamburger opens menu (Pricing + Sign In); close / overlay works; header stays usable
- [ ] On home, mobile header starts transparent over the hero and becomes solid after scrolling the cover section to the top

### Hero

- [ ] Headline **Stand out. Get Seen.** and subtitle render
- [ ] Background video or fallback image loads
- [ ] **Get Early Access** scrolls to the waitlist (`#early-access`)
- [ ] **See pricing** goes to `/pricing`

### Page sections

- [ ] Problem, solution, how-it-works steps, FAQ (expand/collapse items), and final CTA render without layout collapse
- [ ] FAQ contact card / waitlist CTA (if present) still reaches the form
- [ ] Smooth-scroll / hash links do not leave a broken offset under the header
- [ ] Images and marketing video do not flash broken icons

### Footer (marketing)

- [ ] MyHireView wordmark links home; slogan present
- [ ] **Terms of Service** → `/terms`; **Privacy Policy** → `/privacy`
- [ ] Copyright year is current
- [ ] Twitter / LinkedIn icons open the intended profiles in a new tab (`rel=noopener`)

---

## 2. Marketing — pricing (`/pricing`)

- [ ] Same header as home, but **solid** (not transparent-over-hero) from the first paint
- [ ] Intro copy + **Free / Pro / Premium** cards
- [ ] **Pro** is visually highlighted
- [ ] Monthly / annual toggle: default **annual**; switching updates prices; annual savings nudge appears on monthly
- [ ] Caps / FAQ copy matches the working draft (checkout is **not** live — `E2-013`)
- [ ] Waitlist / early-access CTA on this page works (same API as home)
- [ ] Footer matches home

---

## 3. Waitlist

Use a dedicated waitlist email (not Account A) so signup later is clean.

- [ ] Required: email, first name, job-search status
- [ ] Optional: primary goal, career stage
- [ ] Job search, primary goal, and career stage are **three independent radio groups** (selecting a goal or stage does **not** clear job-search status)
- [ ] Every job-search option submits (Actively searching, Casually looking, Career planning, Other)
- [ ] Every primary-goal option submits, including **Network with recruiters** (also: Get more interviews, Track my applications, Stand out to recruiters, Other)
- [ ] Every career-stage option submits (Entry-level, Junior, Mid-level, Senior, Other)
- [ ] Success state / early-bird message after a valid submit; form does not stay in a loading spinner
- [ ] Duplicate email → error (API **409**); UI shows a clear message
- [ ] Same email with different **casing** (`You@x.com` vs `you@x.com`) is treated as a duplicate (or documented if not)
- [ ] After success, submitting a **different** email still works (form can be used again, or reload)
- [ ] Invalid email / empty first name / whitespace-only first name blocked (HTML and/or API **400**)
- [ ] Email longer than **254** chars is rejected
- [ ] Honeypot field is not visible; leaving it empty still succeeds
- [ ] Submit button disables while loading; error path re-enables it
- [ ] Double-click submit does not create two waitlist rows

---

## 4. Sign up (Account A)

From `/signup` (login page “create a new account”, or type the URL).

### Validation

- [ ] First name, last name, email, password, confirm password are required
- [ ] Whitespace-only first or last name is rejected (trim, then required)
- [ ] Names with accents / hyphenated last names (e.g. `José`, `García-López`) save and appear later in Name-in-URL
- [ ] Password hint: at least **8** characters including **one special character**
- [ ] Password shorter than 8, or letters/numbers only → client error, no account
- [ ] Password of exactly 8 with a special char succeeds; a huge password (> **72** UTF-8 bytes) is rejected
- [ ] Confirm password mismatch → “Passwords do not match”
- [ ] Show/hide password toggles work on both password fields (and do not copy the other field)
- [ ] Invalid email format is rejected

### Success

- [ ] Valid signup creates the account
- [ ] If confirm-email is **ON**: notice to check email; **no** dashboard session until the callback link; after `/auth/callback`, land on `/admin`
- [ ] If confirm-email is **ON**: logging in **before** confirming fails with a generic error (not a stack trace); `/admin` still redirects to login
- [ ] If confirm-email is **ON**: a **used/expired** confirmation link → `/login?error=confirmation` (page still usable; not a 500)
- [ ] If confirm-email is **OFF**: redirect straight to `/admin`
- [ ] Signing up again with the same email does **not** reveal “already registered”; generic unable-to-create / try-signing-in copy
- [ ] Login page link from signup works both ways

---

## 5. Sign in / sign out / session

- [ ] `/login` with **wrong** password → generic **Invalid email or password** (does not say whether the email exists)
- [ ] `/login` with an email that **has no account** → the **same** generic message
- [ ] Correct credentials → `/admin`
- [ ] Email casing: sign in with a different case than signup if the provider allows it (or a clear error — no 500)
- [ ] Show/hide password on login
- [ ] Refresh `/admin` while signed in → stay signed in
- [ ] While signed in, visiting `/login` or `/signup` **redirects to `/admin`** (no login↔admin loop)
- [ ] **Sign Out** in the admin header → `/login`; `/admin` now redirects to login
- [ ] Sign in again
- [ ] From `/` (signed in): avatar menu shows **Dashboard** and **Sign Out**; Dashboard → `/admin`; Sign Out from marketing header also clears the session
- [ ] After sign-out, browser Back does not serve a usable authenticated dashboard (must hit login)
- [ ] Two tabs signed in: Sign Out in tab 1; tab 2’s next `/admin` navigation or refresh sends you to login (no half-authenticated UI)

---

## 6. First-run dashboard (`/admin`)

With **zero** applications:

- [ ] Title **Applications**
- [ ] **Create New Application** in the header row
- [ ] Empty state: “Create your first application”, short explanation, **New application** link
- [ ] **Search bar is hidden**
- [ ] **What do these icons mean?** is hidden
- [ ] Admin header: **Dashboard** (active), **New Application**, **Profile**, user email, **Sign Out**, centered logo
- [ ] Active nav underline follows Dashboard / New Application / Profile
- [ ] Getting started checklist is visible (unless you already dismissed it on this browser — use a fresh account)

---

## 7. Getting started checklist

Checklist appears on `/admin`, `/admin/profile`, `/admin/new`, and `/admin/edit/[id]`.

- [ ] Floating panel, bottom-right; progress `N of 6 complete` while incomplete
- [ ] Six steps: **Create your profile**, **Add location or a link**, **Add a profile photo**, **Upload a primary CV**, **Create your first application draft**, **Publish & share**
- [ ] Each incomplete step has **Skip**; **Skip all** is in the footer
- [ ] **Minimize** → compact **Getting started N/6**; expand restores; choice survives refresh and admin navigation
- [ ] Step links go to the right page (profile vs new application)
- [ ] Completing a step (save profile, upload photo/CV, create app, publish) ticks it **without** a full page reload
- [ ] Completing a previously skipped step shows **completed**, not Skipped
- [ ] After skip/complete of all six: progress **All set** / minimized **Done**; footer **Dismiss** (not Skip all)
- [ ] **Dismiss** hides the panel; survives refresh; does not come back on navigation
- [ ] A completed step **stays checked** if you later remove the data (e.g. delete the only published app — Publish & share stays done for this browser + account)
- [ ] **Skip all** then complete one step via real data: that step shows completed; others stay skipped
- [ ] Completing via **LinkedIn only** (no location) ticks “Add location or a link”
- [ ] Photo uploaded from `/admin/new` ticks the photo step on `/admin` without a refresh
- [ ] First paint does not flash expanded if it was minimized/dismissed
- [ ] After **Dismiss**, saving profile/CV/apps does not bring the panel back
- [ ] Account B (or a new public id) does not inherit Account A’s completed/skipped/dismissed prefs

Optional reset: clear `localStorage` key `myhireview:onboarding-checklist`.

---

## 8. Profile (`/admin/profile`)

### Account

- [ ] Email matches signup
- [ ] **Member since** is a sensible date
- [ ] **Public id** is an opaque id (not your name); help text + example `/view/{publicId}/…` path

### Profile details

- [ ] First and last name prefilled from signup
- [ ] Save disabled until something changes; disabled reason if names are empty (“First name and last name are required”) or “No changes to save”
- [ ] Clearing a name to spaces-only cannot save
- [ ] Names at **100** chars save; the field does not accept more (or API rejects)
- [ ] Location at **200** chars; over-long location rejected
- [ ] Save location, portfolio URL, LinkedIn URL
- [ ] `http://` and `https://` URLs accepted; `javascript:`, `ftp://`, and bare `not-a-url` rejected
- [ ] Leading/trailing spaces on URLs are trimmed, not stored as-is
- [ ] Changing name updates the account name used in Name-in-URL suggestions
- [ ] Empty location / URLs are allowed (stored as empty/null)
- [ ] Completing **only LinkedIn** (no location, no portfolio) still satisfies the checklist “location or a link” step; same for portfolio-only or location-only
- [ ] Success / saving labels: **Uploading…** then **Saving…** when a picture is included

### Profile picture (on Profile)

- [ ] Choose JPEG → preview → Save → thumbnail persists after refresh
- [ ] Replace with PNG (and WebP if you have one) → new image shows (cache-bust, not a stale JPEG)
- [ ] **Remove** picture → Save → no avatar on profile; applications that **show** the picture no longer display an avatar on `/view`
- [ ] Reject GIF, SVG, BMP, non-image, and files **> 5 MB**
- [ ] A `.jpg` that is **not** a real image (wrong magic bytes) is rejected
- [ ] Cancel / don’t save a pending file → original picture unchanged
- [ ] Choosing a new file then **Remove** before Save does not upload
- [ ] Rapid double-Save does not leave two avatars / a broken URL

### Primary CV library (on Profile)

- [ ] While **Loading…**, **Upload primary CV** is disabled
- [ ] Empty library copy when none exist
- [ ] Upload PDF → listed with filename; **View** opens the PDF
- [ ] PDF whose filename has **spaces** or unicode still Views/downloads
- [ ] Reject non-PDF, files **> 3 MB**, and a renamed fake `.pdf` (not real `%PDF` bytes)
- [ ] Upload until **5** succeed; sixth is blocked (disabled and/or limit error)
- [ ] Delete an **unused** primary → gone immediately (no confirm)
- [ ] Attach a primary to 1+ applications, then Delete → confirm with **exact count** and company — role preview (and “and N more” if > 10); **Cancel** keeps it
- [ ] Confirm delete → CV gone; amber **still referenced / CV missing** warning if apps used it
- [ ] Warning **survives** the list refresh; if the refresh fails, the warning is still shown
- [ ] While an upload is in progress, Delete is disabled (and the reverse)
- [ ] After deleting one, a new upload is allowed again (still max 5)
- [ ] Two apps sharing one primary: delete that primary → **both** cards show CV missing; other primaries unchanged

### Applications summary

- [ ] Total count; breakdown **active / draft / archived** adds up to the total
- [ ] Counts update after you create, publish, archive, and delete (refresh profile)
- [ ] **View dashboard →** returns to `/admin`

---

## 9. Create application (`/admin/new`)

### Page chrome

- [ ] Title **Create New Application**
- [ ] If location, links, and picture are still empty: nudge to complete profile; arrow goes to Profile
- [ ] After profile has location/link/picture, nudge is gone
- [ ] Form skeleton/pulse while profile loads; then the form

### Info shown to recruiters

- [ ] Prefills first/last name from profile; location and URLs if set
- [ ] Count e.g. `(N/5)` for included fields
- [ ] Toggle **off** a field → it will not appear on `/view` (verify later)
- [ ] Toggle **on** a field but leave it blank → stored/shown as empty (no placeholder junk)
- [ ] Edit a value here (e.g. location) → **does not** change Profile
- [ ] Collapse / expand the section; preference remembered on the next visit (`localStorage`)
- [ ] **Profile picture:** Yes/No disabled until a picture exists; **Add / Change picture** modal uploads JPEG/PNG/WebP, preview, Save, Cancel, type/size errors
- [ ] After adding a picture from this page, Yes/No enables; **Yes** shows the avatar on `/view` after publish
- [ ] **No** (or remove picture) → no avatar on `/view` even if the account still has a picture
- [ ] Adding a picture from New Application ticks the checklist **photo** step without visiting Profile

### Company, role, slug, Name in URL

- [ ] Company and role required; Save blocked until valid
- [ ] Whitespace-only company or role cannot save (trim)
- [ ] Special characters (`Acme & Co.`, `Café`, punctuation) produce a lowercase hyphenated slug with extras stripped
- [ ] Auto slug from company + role as you type (live checking); typing faster than the debounce only checks the **final** value
- [ ] Clearing company or role hides the availability indicator (does not leave a stale green tick)
- [ ] **Name in URL: None** → slug is `company-role` style
- [ ] **At start** → slug begins with `first-last-…` (example: `john-doe-acme-software-engineer`)
- [ ] **At end** → slug ends with `…-first-last`
- [ ] Name in URL with **first name only** (clear last name on the form) omits the missing segment (`john-acme-…`, not `john--acme`)
- [ ] Name in URL with **no names at all** falls back to company-role only
- [ ] Very long company+role: slug is clamped to **128** chars (no trailing hyphen). With name in URL, **name is preserved** and company/role is truncated first
- [ ] Manual slug edit: uppercase, spaces, and trailing hyphens fail **immediately** (no network)
- [ ] Duplicate slug vs another of **your** apps → unavailable (slugs are unique **per user**, not globally — Account B may reuse the same slug)
- [ ] **Reset to suggested** restores the auto slug from current company, role, and Name in URL
- [ ] After a manual slug, toggling Name in URL or Reset exits manual mode and re-derives
- [ ] **Share link preview** shows `/view/{publicId}/{slug}` and explains Public id
- [ ] Invalid slug characters / empty slug cannot save
- [ ] Save while the slug row still says **checking** is blocked (“wait until the slug has finished updating”)
- [ ] Save while slug is **unavailable** is blocked; no row is created

### CV

- [ ] While library is loading (create only), primary / tailored radios are **disabled**
- [ ] If the library request is slow/blocked, radios unlock within ~**12s** so a tailored CV can still be chosen
- [ ] With primaries in the library: defaults to **Use a primary CV**; dropdown lists them
- [ ] **Manage library** opens the same library as Profile; upload/delete there updates the dropdown
- [ ] Uploading the first primary from the modal can switch create to primary (if you had not already chosen tailored)
- [ ] If you already chose **tailored** before adding a primary, mode stays tailored
- [ ] Close the library modal while Loading…, reopen and upload → selection still sticks (late response from the closed modal must not wipe it)
- [ ] Delete the **selected** primary in the modal → selection moves to another primary, or switches to tailored if none remain
- [ ] **Upload a different CV (tailored)**: PDF only, ≤ 3 MB; fake `.pdf` rejected; file itself is **not** restored after refresh — re-choose if you leave
- [ ] Cannot save create with neither a primary selected nor a tailored file
- [ ] Empty library: primary disabled until you upload via Manage library; tailored still works
- [ ] Restore a browser draft whose primary was **deleted** meanwhile: stale id is not saveable; falls back to another primary or tailored
- [ ] Failed Save then retry **the same** tailored file does not upload a second R2 object (idempotency); changing the file does
- [ ] Download-name control: original filename vs generated `CV-{Slug}.pdf` — verify later on `/view` Download

### YouTube

- [ ] Valid `youtube.com/watch?v=…` accepted (extra query params like `&t=30` still work)
- [ ] Valid `youtu.be/…` accepted
- [ ] Valid `youtube.com/embed/…` accepted
- [ ] Valid Shorts URL accepted
- [ ] Invalid URL (Vimeo, example.com, garbage) → “Please enter a valid YouTube URL”; Save blocked
- [ ] Empty video is **not** allowed — Save stays blocked with “YouTube URL is required” (create and edit)

### Local browser draft (create only)

- [ ] Fill fields → refresh → values restore (about **7 days** max; scoped to this signed-in user)
- [ ] Personal-only edits (e.g. location) also restore
- [ ] Tailored **file** is not restored; re-select the PDF
- [ ] Dashboard / Profile / Back with progress → confirm “Leaving this page will discard this draft…”
- [ ] **No, stay** keeps the form; **Yes, I'm sure** leaves and **clears** the draft — next New Application is empty
- [ ] After confirming leave, Back does **not** return to a filled `/admin/new`
- [ ] Untouched form (prefills only) does **not** prompt on leave
- [ ] Clearing fields back to empty: leave no longer prompts; typing again re-arms the prompt
- [ ] Manual slug edits **are** protected by the leave dialog; auto slug updates from typing company/role alone are **not**
- [ ] Opening `/admin/new` as the first history entry, then confirming Back, still leaves create (falls back to dashboard if needed)
- [ ] Leave a fully empty new form idle: no stale draft on a later visit
- [ ] Successful **Save & Preview** clears the browser draft; a **failed** save keeps it
- [ ] Account B on the same browser does **not** see Account A’s create draft

### Save & Preview

- [ ] Submit label is **Save & Preview** (not Save Application)
- [ ] Double-click submit does not create two rows
- [ ] Save with the network offline (DevTools) shows an error; **no** application row; browser draft **kept**
- [ ] Session expired mid-form (optional: delete cookies then Save): 401 surfaces in the form/alert; no half-created app; tailored file is not “lost” into an orphan row
- [ ] Success → `/view/{publicId}/{slug}` with amber **Draft preview** banner (Edit / Publish / Dashboard). If Public id were missing, fallback is `/admin` + **Preview** on the card
- [ ] Two `/admin/new` tabs: save in tab 1; tab 2 save with a **different** slug creates a second draft (or a clear collision error — not a 500 / silent overwrite)
- [ ] Owner sees full page (CV, video, candidate fields) behind the banner
- [ ] Same URL in incognito → **unavailable** empty state (recruiters cannot see drafts)
- [ ] Owner draft preview does **not** increment Views

Create applications **#1–#8** (and extras for pagination) using the matrix above. Publish #1, #2, #5, #7 now or in §12; leave #3 and #8 as drafts; publish then archive #4; use #6 for CV missing.

---

## 10. Dashboard with applications

### Chrome

- [ ] Search bar **visible**
- [ ] **What do these icons mean?** **visible**
- [ ] Cards show **company - role**
- [ ] List dims slightly while a search/refetch is in flight (`opacity`)
- [ ] Newest applications appear first

### Status legend

- [ ] Button opens modal **Status icons & draft actions**
- [ ] Lists Draft, Active (not viewed yet), Active (viewed), Archived, CV missing — icons match cards
- [ ] Explains **Publish**, **Preview**, **Publish to share**
- [ ] Close via Close, Escape, or backdrop; focus returns; heading focused on open
- [ ] Body scroll locked while open
- [ ] Hover/focus titles on card status icons match the legend

### Card actions by status

**Draft**

- [ ] Amber clock icon
- [ ] **Publish** button on the card
- [ ] **Publish to share** (not Copy Link)
- [ ] **Preview** (not View Application) opens the share URL with the banner
- [ ] 3-dot: Edit, Publish, Delete — **no Archive**

**Active, 0 views**

- [ ] Green clock
- [ ] **Copy Link** works; button shows **Copied!** briefly
- [ ] Copied URL is `…/view/{publicId}/{slug}`
- [ ] If `public_id` were missing, Copy Link / View stay **disabled** (`Publish to share` / `View unavailable`) — no `/view//slug`
- [ ] **View Application** opens a new tab (live page, no draft banner)
- [ ] 3-dot: Edit, Archive, Delete

**Active, viewed**

- [ ] Green check after a non-owner view (§14)
- [ ] Copy Link / View Application still work

**Archived**

- [ ] Grey archive icon
- [ ] **Link unavailable** (not Copy Link)
- [ ] View/Preview disabled or empty-state for everyone including owner (no draft banner)
- [ ] 3-dot: Edit, **Restore**, Delete — no Archive / no Publish

**CV missing**

- [ ] **CV missing** badge on the card
- [ ] Other actions still work; Edit can fix the CV

### View Insights

- [ ] Expand / collapse per card
- [ ] Expanding insights on **two cards** at once works independently
- [ ] **Views**, **CV downloads**, **Created** (date), **Last viewed** (date/time or —)
- [ ] Owner opening their own live page does **not** bump Views or Last viewed
- [ ] Recruiter view (incognito) increments Views by **1 per browser session**; refresh in the same session does not add another
- [ ] Recruiter **Download CV** increments CV downloads once per session; owner download does not
- [ ] Last viewed updates after a recruiter view
- [ ] Collapse hides the row without breaking the card
- [ ] Insights on a **draft** stay 0 until publish + a non-owner view

### 3-dot menu

- [ ] Opens / closes; click outside closes
- [ ] **Delete** → browser confirm; Cancel keeps the app; Confirm removes the card
- [ ] After delete, old share URL shows the **same** unavailable empty state as archive

### Search

- [ ] Placeholder: company, role, or slug
- [ ] Debounced (~300 ms); typing does not thrash
- [ ] Match by **company**, **role**, and **slug** (case-insensitive)
- [ ] Apostrophes in names still match; stray quotes / `*` do not break the query (reserved chars are stripped; empty-after-strip does not 500)
- [ ] Unicode company names (Café) are searchable
- [ ] Search that matches **only archived or only drafts** still lists those cards
- [ ] No matches → “No applications match that search” + **Clear search**; legend and search **stay visible**
- [ ] Clear search restores the full list **without** flashing the first-run empty state
- [ ] Search resets to page 1
- [ ] After opening/closing the legend, search still works
- [ ] Deleting the only match while a search is active shows the no-match empty state (not the first-run CTA)

### Pagination (need **> 20** applications)

- [ ] “Showing X–Y of Z”; **Page N of M**
- [ ] **Next** / **Previous**; disabled on first/last and while fetching
- [ ] Page 2 shows the next slice; items do not duplicate page 1
- [ ] Changing search from a later page jumps to page 1
- [ ] Create / delete / archive on a page updates the list without a full site reload
- [ ] Deleting the **last item on the last page** lands on a valid previous page (not an empty page with Next/Prev broken)
- [ ] Deleting the **last remaining application** in the account: search + legend hide; first-run empty CTA returns

---

## 11. Edit application (`/admin/edit/[id]`)

- [ ] From 3-dot **Edit**
- [ ] Snapshot notice: candidate text fields come from **this application**, not live profile; **picture is live**
- [ ] Changing Profile name/location/links does **not** change this form until you edit and save here
- [ ] Changing the profile picture **does** show on `/view` if this app has show-picture on (no need to re-save the app)
- [ ] Submit label **Save Application**
- [ ] Save a **draft** → stays draft (not auto-published)
- [ ] Save an **active** app → stays active
- [ ] Company/role change updates auto slug unless you customized it; custom slug is kept on load
- [ ] **Reset to suggested** after a custom slug
- [ ] Switch primary A → primary B → public PDF changes; library still has both
- [ ] Switch primary → tailored (upload) → save → tailored PDF on `/view`; old primary remains in library
- [ ] Switch tailored → primary → confirm that the tailored file will be deleted → after save, tailored R2 object is gone; public view uses the primary
- [ ] **Cancel** that confirm → stays on tailored; tailored file still there after save
- [ ] Toggle candidate fields and picture Yes/No; `/view` matches
- [ ] Change/remove picture from the modal; Profile library/picture stays in sync
- [ ] Invalid / foreign / Account B’s edit id → redirected to dashboard (no crash, no leak)
- [ ] **Check again** on a missing CV retries existence without a full-page spinner
- [ ] No leave-confirm browser draft on edit (create-only feature)
- [ ] Edit radios stay **usable** while the primary library loads (saved source is not overwritten)
- [ ] Two tabs editing the **same** app: last save wins; no 500; reload shows one consistent row

---

## 12. Publish, archive, restore

- [ ] Publish from **draft banner** → banner gone; page is the live public view; dashboard card becomes active; Copy Link enabled
- [ ] Publish from **card button** and from **3-dot** both work
- [ ] Publishing twice (button mash / two tabs) does not error; stays active once
- [ ] Archive only for **active** apps → public URL unavailable for everyone (including owner)
- [ ] Restore → live again with the **same slug, CV, video**, and **insights counts preserved**
- [ ] Re-archive resets the archive clock (new `archived_at` if you check the DB)
- [ ] Cannot archive a draft (menu shows Publish, not Archive)
- [ ] Cannot publish an already-active or archived app from the card (no Publish)
- [ ] Delete a tailored-CV app → tailored file removed from storage; primaries untouched
- [ ] Delete a primary-CV app → primary **stays** in the library and on other apps
- [ ] Confirm dialogs: Cancel does not mutate; Confirm does
- [ ] Edit an **archived** app, save, stay archived (save does not silently restore or publish)
- [ ] After delete, dashboard list updates immediately (no ghost card)

---

## 13. Public view (`/view/{publicId}/{slug}`) — recruiter

Use incognito / signed-out (and owner, where noted).

### Live active application (full — app #1)

- [ ] MyHireView wordmark → home
- [ ] Company and role
- [ ] Candidate name, location, Portfolio and LinkedIn buttons only for **included** fields
- [ ] Profile picture when show-picture is on
- [ ] **Watch Video Pitch** opens the YouTube modal; video plays; close via X, backdrop, and **Escape**
- [ ] Opening/closing the video modal does **not** increment Views
- [ ] PDF viewer loads all pages (multi-page PDF if you have one)
- [ ] **View CV** / open-in-tab works
- [ ] **Download CV** downloads; filename is original **or** `CV-{Slug}.pdf` per the toggle
- [ ] Download failure (block the PDF URL once) does not crash the page
- [ ] Compact footer: MyHireView, Terms, Privacy, © — present for owners and recruiters
- [ ] Page is `noindex` / does not invite indexing (optional: view source / head)

### Variants

- [ ] Picture off / no picture → no avatar; layout still balanced
- [ ] All candidate toggles off → header still shows company/role; no name/location/links
- [ ] Name in URL at start / at end / none → URL shape matches; page still resolves
- [ ] Custom slug resolves; a typo slug → unavailable empty state (not another user’s app)
- [ ] Wrong **publicId** with a valid-looking slug → unavailable (no leak of another account)
- [ ] Extra query string or hash on the share URL still resolves (`?utm=…`, `#section`)
- [ ] Slug is **case-sensitive** as stored (wrong case → unavailable, not a silent remap) — confirm actual behaviour
- [ ] Primary vs tailored PDF is the file you attached to **that** app
- [ ] CV missing / deleted object → “CV is not available” + **Try again**; retry does not crash
- [ ] Unavailable empty state: home CTA **See how candidates stand out**; dark compact footer
- [ ] Owner signed in on the public URL, then **Sign Out** in another tab and refresh the view tab → live apps still show (public); drafts become unavailable

### Owner vs recruiter

- [ ] Owner, **draft**: banner + full content; recruiter: unavailable
- [ ] Owner, **active**: same content as recruiter, **no** banner
- [ ] Owner, **archived**: unavailable (no banner)
- [ ] Draft banner **Edit** → edit form; **Dashboard** → `/admin`; **Publish** as in §12

---

## 14. Recruiter insights (end-to-end)

On a published app with 0 views:

1. Owner opens View Application → insights stay **0** / Last viewed **—**
2. Incognito opens the link → Views **1**, Last viewed set
3. Refresh incognito → still **1**
4. New private session (or another browser) → Views **2**
5. Incognito Download CV → CV downloads **1**; owner download does not add
6. Same incognito session Download again → still **1**
7. **Account B signed in** opens Account A’s published URL → counts as a recruiter view (B is not the owner)
8. Close incognito and reopen **immediately** (new sessionStorage, cookie may still apply ~24h) — count must **not** jump twice from cookie+storage disagreement; note what you see

- [ ] Steps 1–7 pass
- [ ] Step 8 noted (cookie vs sessionStorage); file a ticket only if counts go wild
- [ ] Counts on the card match after a dashboard refresh
- [ ] View/download on **draft / archived / deleted** URLs do not increment (404/unavailable; insights unchanged)

---

## 15. Cross-account isolation (Account B)

- [ ] Sign up / sign in as B (same browser after A signs out, or another profile)
- [ ] B’s dashboard does not list A’s applications
- [ ] B can reuse a slug A already used (per-user uniqueness)
- [ ] B cannot open `/admin/edit/{A's application id}` (404 / redirect to B’s dashboard)
- [ ] B cannot copy-link or guess A’s **publicId** from B’s own profile
- [ ] B’s public URLs use **B’s** public id
- [ ] Opening A’s share link while signed in as B shows A’s **public** content only (no draft banner, no edit)
- [ ] B’s onboarding checklist starts fresh
- [ ] B’s create-form draft does not restore A’s fields
- [ ] A’s primary CVs / picture are not in B’s library
- [ ] B uploading a primary does not appear in A’s library after switching back

---

## 16. Navigation, loading, and errors

- [ ] Admin pages show loading skeletons (dashboard, new, edit) on slow networks (optional throttle)
- [ ] Dashboard fetch error shows the dashboard error state (optional: block `/api/applications` once)
- [ ] Logo in admin header does not navigate away unexpectedly
- [ ] Deep-link `/admin/new` and `/admin/profile` while signed in works
- [ ] After login, landing on `/admin` (not a blank page)
- [ ] Public view loading state (`app/view/.../loading`) appears on a slow load (optional)
- [ ] `/?` and `/#early-access` (direct load) still render home and scroll to waitlist
- [ ] Browser Back/Forward between `/` ↔ `/pricing` ↔ `/login` does not duplicate headers or leave a stuck mobile menu
- [ ] Confirm dialogs (leave create, delete primary, switch CV): **Escape** and backdrop/cancel are equivalent; they do not submit the parent form

---

## 17. Responsive smoke

Repeat a short path (dashboard cards, create form, public view, marketing header) at:

- [ ] Desktop (≥ 1024)
- [ ] Tablet (~ 768)
- [ ] Mobile (~ 390)
- [ ] Optional: zoom 200% on desktop — form and cards remain usable (no overlapping 3-dot menus)

Check: card actions wrap instead of overflowing; 3-dot menu is not clipped; create form fields usable; public header/CV/video usable; marketing mobile menu works.

---

## 18. Remaining edge cases

These are easy to skip on the happy path. Do them once you have applications in place.

### Stored HTML / special characters

- [ ] Create (or edit) an app with company `Acme <script>alert(1)</script>` and role `Engineer & QA` — dashboard and `/view` show the **text**, never execute script
- [ ] Location / first name with `<img onerror>` or quotes do not break attributes on `/view`
- [ ] Search for `Acme` still finds that card; search for `<script>` does not 500

### Two tabs / concurrency

- [ ] Dashboard open in two tabs: publish/archive/delete in tab 1; tab 2 refresh shows the new status (no duplicate cards)
- [ ] Profile picture: start Save in tab 1 and tab 2 with different files — one URL wins; `/view` and Profile show the **same** picture after refresh (no mix of old/new)
- [ ] Manage-library modal: upload in one tab while deleting in another — list stays at most 5; no orphan “ghost” filename

### Uploads & retries

- [ ] Fail a tailored upload (offline), then go online and Save again **without** re-picking the file — succeeds or asks to re-choose; does not create an application with a broken `cv_url`
- [ ] **409** on tailored reuse: two apps must not share one tailored R2 object (re-upload the same PDF for a second app → distinct object, both views work)
- [ ] Upload progress / **Uploading…** copy appears; **429** (if you hit a rate limit) shows a retryable message, not a raw stack

### Session & clipboard

- [ ] Copy Link with clipboard permission **denied** does not crash; you can still View Application and copy from the address bar
- [ ] Idle until the session is stale, then click Save on edit — sign-in error, application not partially updated
- [ ] After that 401, signing in again and retrying Save works

### Marketing / pricing leftovers

- [ ] Signed-in user can still submit the waitlist (or sees a sensible state — not a 500)
- [ ] Pricing monthly ↔ annual toggle several times does not glitch prices or highlight the wrong tier
- [ ] Home hero **Get Early Access** from a scrolled page still hits `#early-access`

### Keyboard / focus

- [ ] Tab through login, create form, and dashboard cards; focus rings visible
- [ ] Enter in the search bar does not navigate away
- [ ] Legend modal and video modal trap/restore focus reasonably (Escape closes)

### Rate limits (optional — don’t lock yourself out)

- [ ] Rapid waitlist or login attempts eventually return **429** with a retry message (stop as soon as you see it)
- [ ] After waiting, a normal request succeeds again

---

## 19. Known not shipped — do **not** fail the pass for these

Tracked in [Backlog.md](../Backlog.md):

| Item | Ticket |
| ---- | ------ |
| Terms / Privacy / Cookies pages | `F20-019` |
| Delete account from profile | `F21-020` |
| In-app forgot password | `L4-098` |
| Stripe / plan gates | `E1-012`, `E2-013` |
| `/admin` + `/view` + auth visual rebrand | `F17-017`, `F17-018` |
| 90-day archive purge, retention tooltip, emails | After launch G* |
| In-app video recording / teleprompter | `H1-065`, `H2-066` |
| Dashboard stats above search | `L7-080` |
| Product tour | `F31-105` |

If any of these have shipped by the time you run this pass, add a short note in the ticket and test them.

---

## Done when

- [ ] Account A completed the journey: signup → profile (picture + ≥1 primary CV) → several applications covering the matrix in the table → search, pagination, legend, insights
- [ ] Recruiter (signed-out) path verified for live, draft, archived, deleted, and mistyped URLs
- [ ] Account B isolation checked
- [ ] Checklist / picture / CV add-and-delete paths checked
- [ ] **§18 remaining edge cases** (HTML escaping, two tabs, fake files, session, analytics) checked
- [ ] Failures filed as new backlog tickets (do not silently skip)

Optional: `pnpm test:ci` green on the same commit you intend to launch.
