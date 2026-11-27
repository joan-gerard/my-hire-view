# Manual test — create and edit application forms

Focused QA for the live create and edit surfaces after F35: the same one-page layout on `/admin/new` and `/admin/edit/[id]`. Wizard and split-edit shells are gone.

Behavior reference: [APPLICATION_FORM_WORKFLOW.md](../product/APPLICATION_FORM_WORKFLOW.md). Field trim: [CREATE_FORM_FIELD_TRIM.md](../product/CREATE_FORM_FIELD_TRIM.md). Decision record: [APPLICATION_FORM_STEPS_F35.md](../retrospectives/APPLICATION_FORM_STEPS_F35.md).

**Deep dives** (run when you need storage / draft / preview detail):

- [MANUAL_TEST_CREATE_APP_DRAFT_AND_CV_MODE.md](MANUAL_TEST_CREATE_APP_DRAFT_AND_CV_MODE.md) — browser draft + CV source while library loads
- [MANUAL_TEST_APPLICATION_PREVIEW_DRAFT.md](MANUAL_TEST_APPLICATION_PREVIEW_DRAFT.md) — Save & Preview → owner banner → Publish
- [MANUAL_TEST_PROFILE_CREATE_ON_PUT.md](MANUAL_TEST_PROFILE_CREATE_ON_PUT.md) — picture / profile row from New and Edit
- [MANUAL_TEST_PRE_LAUNCH_E2E.md](MANUAL_TEST_PRE_LAUNCH_E2E.md) §§9 and 11 — full pre-launch create/edit matrix

## Setup

- [ ] Signed in with a profile that has first and last name
- [ ] At least one library résumé (and a second PDF for tailored)
- [ ] Optional: a profile picture already uploaded
- [ ] A valid YouTube watch URL and one invalid URL
- [ ] Desktop (~1280px) and one narrow width (~375px)

---

## 1. Create — page chrome (`/admin/new`)

- [ ] Title **New application** and a short description sit above the form; content is no wider than `2xl`
- [ ] Sections are **Your link**, **About you**, **Your résumé**, and **Your pitch** — each a heading above its own card
- [ ] Intro: company and role to save a draft; résumé and video to publish
- [ ] Red asterisk only on Company and Role (save-required); Résumé / YouTube / names are not starred
- [ ] Inside a card, label is on the left and control on the right; on a narrow screen the label sits above the control
- [ ] **Cancel** and **Save Draft** stay fixed at the bottom while scrolling; **Publish** is always visible (disabled until ready); **Preview** appears when the full publish set is ready
- [ ] Save stays greyed out until company, role, and share link are ready; draft line names what is missing; **To publish, add…** lists first name, last name, a résumé, a video (each scrolls)
- [ ] Pressing **Enter** in a text field does **not** save
- [ ] No chapter checklist and no wizard step rail
- [ ] When location, portfolio, LinkedIn, and picture are all empty (or there is no profile yet): a tip above the form (light blue wash background) points to Profile with an arrow. After any one of those is filled, reopen `/admin/new` — the tip is gone
- [ ] Form skeleton while profile loads, then the form

---

## 2. Create — Your link

- [ ] Default rows: **Company**, **Role**, **Your application link**, then **Customize link** (order/ending hidden)
- [ ] Create: Company is autofocused; placeholders **e.g. Spotify** / **e.g. Software Engineer**
- [ ] Status dots sit **before** the labels: Company / Role grey until valid, then green; when Customize is open, Link ending grey until valid then green; **How the link reads** is always green
- [ ] **Customize link** expands **How the link reads** and **Link ending**; label becomes **Hide link options**
- [ ] **How the link reads** is a custom dropdown: **Company + Role** (default) or **Role + Company**; info icon opens a dialog (close from the title icon, no Close button)
- [ ] **Link ending** is pre-filled; info icon explains uniqueness; **Use the suggested link** appears after a manual edit and hides when the ending matches the suggestion again
- [ ] While checking, the result field’s end control is a spinner (not Copy); when invalid/taken it is a danger icon with tooltip; ready state shows Copy
- [ ] Invalid / taken / failed states do **not** auto-expand Customize; danger icons show on the result end control and after **Customize link** / **Hide link options** (label stays normal ink color); opening Customize shows detail / **Checking…** on the ending row
- [ ] **Your application link** is a full-width tinted result under Company/Role: full URL from `sm` up (wrapping so the ending stays visible); path-only on a narrow screen; updates live while typing Company/Role
- [ ] On create / draft edit, a broken-link icon replaces Copy when the URL looks ready; tooltip **Publish before sharing this link** when Publish is available, otherwise **Finish required fields before publishing and sharing** (earlier tip if profile id or ending is missing)
- [ ] On a live edit, Copy is enabled and copies the full URL when the link is ready
- [ ] Changing company/role rebuilds the ending in auto mode; a manual ending is kept until Reset / Use suggested
- [ ] Edit (or restored draft) with a custom ending or Role+Company order opens Customize by default
- [ ] Save while still checking, or while unavailable, is blocked — no application row created

---

## 3. Create — About you (read-only + show/hide)

- [ ] **No live apps yet** (including draft-only): About you is fully expanded on create and draft edit
- [ ] **After at least one live app** (Profile collapse preference on, default): About you collapses to one line like **Showing photo, name, portfolio** with **Edit**; **Edit** expands; **Hide details** collapses again
- [ ] Account settings → Preferences → turn off **Collapse About you after your first live application** → create/edit keep About you fully expanded even with live apps
- [ ] When expanded: short note **Choose what this page shows from your profile**; **Edit profile** (and **Hide details** when collapse applies) sit on the right
- [ ] **Edit profile** opens `/admin/profile`
- [ ] Order when expanded: **First name**, **Last name**, **Picture**, then Location / LinkedIn / Portfolio
- [ ] **First name** / **Last name** are display-only (not focusable inputs); always shown when present; no visibility toggle; empty says add on Profile; name fields use a slightly stronger fill than the show/hide fields below
- [ ] **Picture:** preview always shown (photo or initials). With a photo: **Visible** / **Hidden** label + switch under the preview (Hidden dims it, neutral grey). Without: link to Profile; no visibility toggle
- [ ] Picture tip is green when a photo exists, grey when not
- [ ] **Email**, **Phone**, **Location**, **LinkedIn**, **Portfolio** are read-only (LinkedIn before Portfolio); **Visible** / **Hidden** switch under the value when non-empty (same pattern as Picture; Hidden uses muted strikethrough, not pink); empty points to Profile
- [ ] Tips: green “From your profile” when a value exists; grey when empty (no yellow write-through tip)
- [ ] Saving the application does **not** change Profile text; `/view` shows only fields that were shown; names always appear when present

---

## 4. Create — Résumé and Pitch

- [ ] One **File** row under Your résumé with radios **Use library résumé** / **Upload one for this role** (**Pro**); one helper that the upload replaces the library résumé on this application only (not repeated in the row hint)
- [ ] Empty library: **No résumés in your library yet** + **Manage library** under the library option (visible even when tailored is selected)
- [ ] Selected filename truncates with an ellipsis (does not wrap mid-extension) and shows a **Preview** link when a URL/file is available
- [ ] Selecting **Upload one for this role** switches mode only (shows **No file chosen** / **Choose a PDF**); the PDF dialog opens only from **Choose a PDF** or **Manage**, not from the radio
- [ ] **Manage library** / **Choose a PDF** (or **Manage**) open the existing modals
- [ ] Chosen source tip is green; the other is grey
- [ ] Once a file is chosen: a bottom **Recruiters download it as** row (like Your application link) shows generated `{First}-{Last}-{Slug}.pdf` (muted `First-Last` / `Company-Role` placeholders until real values exist); **Original name** switch uses the PDF filename instead
- [ ] While the library is loading, library / tailored choices stay disabled (create only); unlock within ~12s if the request hangs
- [ ] **YouTube** tip is grey until a usable (embeddable) URL is confirmed, then green; empty YouTube does **not** block draft Save; invalid URL still blocks Save if entered
- [ ] Pasting a valid public/unlisted URL shows a playable full-width preview (thumbnail → play) + title; private / embedding-disabled shows an error; a one-line note says unlisted videos work
- [ ] With a prior application that has a YouTube URL, **Reuse a video from an earlier application** fills the field
- [ ] Draft save with only company + role (+ auto link) opens that draft’s edit page; owner preview of a draft without résumé still shows a placeholder; Publish without the full set fails with a clear required list

---

## 5. Create — save path (smoke)

- [ ] Happy path: fill draft pieces → **Save Draft** → `/admin/edit/[id]` for the new draft
- [ ] Fill the full publish set → Publish enables and **Preview** appears → **Preview** opens the recruiter dialog (look-only; close with X); footer **Publish** goes live to `/view/{publicId}/{slug}` (no draft banner)
- [ ] Owner draft preview does not increment Views; same URL in incognito is unavailable
- [ ] Failed save (e.g. offline) keeps the browser draft; successful save clears it
- [ ] Double-click submit does not create two rows

For leave-confirm, draft restore, and CV-mode edges, use [MANUAL_TEST_CREATE_APP_DRAFT_AND_CV_MODE.md](MANUAL_TEST_CREATE_APP_DRAFT_AND_CV_MODE.md).

---

## 6. Edit — page chrome (`/admin/edit/[id]`)

- [ ] Open from the dashboard ⋯ **Edit**
- [ ] Loading skeleton matches `/admin/new` (one-page form shell)
- [ ] Same one-page layout as create: title **Edit application**, sections **Your link**, **About you**, **Your résumé**, **Your pitch**, no wider than `2xl`
- [ ] No sticky split-edit header, no five-band guidance panels, no Review summary step
- [ ] No wizard Continue / Back, no step rail, no leave-confirm browser draft (create-only)
- [ ] Submit label is **Save Draft** for drafts and **Save application** for active apps
- [ ] With no edits since load/save, Save is disabled and the reason reads **No changes to save.**
- [ ] Draft incomplete: **Publish** visible but disabled with **To publish, add…**; draft with full set: **Preview** + enabled **Publish** even when Save is off for no changes; footer **Publish** goes live; live apps do not show Preview/Publish; live edit stars the full save set
- [ ] Draft edit: Save needs company + role + share link (same as create). Live edit: Save needs the full publish set; each blocked-reason item scrolls to its field
- [ ] Cancel / Save bar stays fixed at the bottom while scrolling the form

---

## 7. Edit — About you and materials

- [ ] If you already have a live app: About you starts collapsed on a one-line summary with **Edit**; expand to change visibility. Draft-only accounts stay expanded
- [ ] Form waits until the profile request finishes, then shows live profile name / location / links as read-only values (same as create)
- [ ] Note: from your profile; this page chooses what recruiters see; **Edit profile** for changes
- [ ] A field the saved application left empty starts **Hidden** even when the profile now has a value; the next save includes it only if you set it to **Visible**
- [ ] Names are read-only; saving does **not** PUT the profile — it only snapshots shown fields onto the application
- [ ] Changing Profile alone does **not** change a previously saved application’s public text until you edit and save here
- [ ] Profile picture: live from the profile; **Visible** / **Hidden** switch when a picture exists; Hidden dims the preview; missing picture links to Profile (no upload on the form)
- [ ] Changing the profile picture on Profile **does** show on `/view` when this app has show-picture on (no re-save needed for the image file)
- [ ] Résumé radios stay usable while the library loads; saved source is not overwritten by the fetch
- [ ] Switch primary ↔ tailored (with confirm when leaving a tailored file); `/view` matches after save
- [ ] Missing résumé: **Check again** shows Checking… then clears or says the file is still missing — no full-page spinner

---

## 8. Edit — save

- [ ] Blocked-reason line names the first gap and focuses that row
- [ ] Save a draft → stays draft and stays on `/admin/edit/[id]` (not the dashboard); Save disables again until the next change
- [ ] Publish a complete draft → `/view/{publicId}/{slug}` live (no draft banner)
- [ ] Save an active app → stays active and stays on the edit page
- [ ] Saved share link stays put when company/role change until you edit the ending or use Reset / suggested
- [ ] Invalid / foreign / another account’s edit id → redirect to dashboard (no crash, no leak)
- [ ] Two tabs on the same app: last save wins; reload shows one consistent row

---

## 9. Narrow viewport (both surfaces)

- [ ] Create: no horizontal overflow; labels stack above controls; Save reachable; share link path readable
- [ ] Edit: same stacking as create; Save reachable

---

## Done when

Checks above pass for create and edit on desktop and one phone width. Run the linked deep dives if draft, CV library, or publish behavior is in doubt. `pnpm test:ci` green when code changed with this pass.
