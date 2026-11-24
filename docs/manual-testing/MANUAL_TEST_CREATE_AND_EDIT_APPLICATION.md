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
- [ ] At least one primary CV in the library (and a second PDF for tailored)
- [ ] Optional: a profile picture already uploaded
- [ ] A valid YouTube watch URL and one invalid URL
- [ ] Desktop (~1280px) and one narrow width (~375px)

---

## 1. Create — page chrome (`/admin/new`)

- [ ] Title **New application** and a short description sit above the form; content is no wider than `2xl`
- [ ] Sections are **Your link**, **About you** (optional), **Résumé**, and **Pitch** — each a heading above its own card
- [ ] Inside a card, label is on the left and control on the right; on a narrow screen the label sits above the control
- [ ] **Cancel** and **Save Draft** sit at the bottom; **Publish** appears only when the full publish set is ready
- [ ] Save stays greyed out until company, role, and share link are ready (résumé / YouTube / names are not required for draft); a line above the buttons names what is missing
- [ ] Pressing **Enter** in a text field does **not** save
- [ ] There is no Preview button on create, no chapter checklist, and no wizard step rail
- [ ] When location, portfolio, LinkedIn, and picture are all empty (or there is no profile yet): a tip above the form (light blue wash background) points to Profile with an arrow. After any one of those is filled, reopen `/admin/new` — the tip is gone
- [ ] Form skeleton while profile loads, then the form

---

## 2. Create — Your link

- [ ] Rows: **Company**, **Role**, **How the link reads**, **Link ending**, **Shareable link**
- [ ] Status dots sit **before** the labels: Company / Role / Link ending grey until valid, then green; **How the link reads** is always green
- [ ] **How the link reads** is a custom dropdown: **Company + Role** (default) or **Role + Company**; info icon opens a dialog (close from the title icon, no Close button)
- [ ] **Link ending** is pre-filled; info icon explains uniqueness; **Use the suggested link** appears after a manual edit and hides when the ending matches the suggestion again
- [ ] **Checking…** (grey italic) while the ending is checked; empty / invalid / taken / failed states show on that row
- [ ] **Shareable link** is a full-width tinted result: full URL from `sm` up (wrapping so the ending stays visible); path-only on a narrow screen; copy icon copies the full URL when ready
- [ ] Changing company/role rebuilds the ending in auto mode; a manual ending is kept until Reset / Use suggested
- [ ] Save while still checking, or while unavailable, is blocked — no application row created

---

## 3. Create — About you (read-only + show/hide)

- [ ] Note under the section: from your profile; this page only chooses what recruiters see; change details on Profile
- [ ] **Edit profile** sits in the About you note under the section title (not alone at the top of the card) and opens `/admin/profile`
- [ ] Order: **First name**, **Last name**, **Picture**, then Location / LinkedIn / Portfolio
- [ ] **First name** / **Last name** are display-only (not focusable inputs); always shown when present; no eye toggle; empty says add on Profile; name fields use a slightly stronger fill than the show/hide fields below
- [ ] **Picture:** preview always shown (photo or initials). With a photo: show switch under the preview (off dims it). Without: link to Profile; no show switch
- [ ] Picture tip is green when a photo exists, grey when not
- [ ] **Location**, **LinkedIn**, **Portfolio** are read-only (LinkedIn before Portfolio); eye / eye-off when non-empty (open = show, crossed = hide); empty points to Profile
- [ ] Tips: green “From your profile” when a value exists; grey when empty (no yellow write-through tip)
- [ ] Saving the application does **not** change Profile text; `/view` shows only fields that were shown; names always appear when present

---

## 4. Create — Résumé and Pitch

- [ ] **Library** shows the selected primary (or empty copy) with **Manage**; **This role** has **Choose a PDF** / **Manage**
- [ ] Chosen source tip is green; the other is grey
- [ ] Once a file is chosen: a bottom **Recruiters download it as** row (like Shareable link) shows generated `{First}-{Last}-{Slug}.pdf` (muted `First-Last` / `Company-Role` placeholders until real values exist); **Original name** switch uses the PDF filename instead
- [ ] While the library is loading, library / tailored choices stay disabled (create only); unlock within ~12s if the request hangs
- [ ] **YouTube** tip is grey until a valid URL, then green; empty YouTube does **not** block draft Save; invalid URL still blocks Save if entered
- [ ] Draft save with only company + role (+ auto link) opens that draft’s edit page; owner preview of a draft without résumé still shows a placeholder; Publish without the full set fails with a clear required list

---

## 5. Create — save path (smoke)

- [ ] Happy path: fill draft pieces → **Save Draft** → `/admin/edit/[id]` for the new draft
- [ ] Fill the full publish set → **Publish** appears → Publish → `/view/{publicId}/{slug}` live (no draft banner)
- [ ] Owner draft preview does not increment Views; same URL in incognito is unavailable
- [ ] Failed save (e.g. offline) keeps the browser draft; successful save clears it
- [ ] Double-click submit does not create two rows

For leave-confirm, draft restore, and CV-mode edges, use [MANUAL_TEST_CREATE_APP_DRAFT_AND_CV_MODE.md](MANUAL_TEST_CREATE_APP_DRAFT_AND_CV_MODE.md).

---

## 6. Edit — page chrome (`/admin/edit/[id]`)

- [ ] Open from the dashboard ⋯ **Edit**
- [ ] Loading skeleton matches `/admin/new` (one-page form shell)
- [ ] Same one-page layout as create: title **Edit application**, sections **Your link**, **About you**, **Résumé**, **Pitch**, no wider than `2xl`
- [ ] No sticky split-edit header, no five-band guidance panels, no Review summary step
- [ ] No wizard Continue / Back, no step rail, no leave-confirm browser draft (create-only)
- [ ] Submit label is **Save Draft** for drafts and **Save application** for active apps
- [ ] With no edits since load/save, Save is disabled and the reason reads **No changes to save.**
- [ ] Draft with full publish set: **Publish** is visible even when Save is off for no changes; live apps do not show Publish
- [ ] Draft edit: Save needs company + role + share link (same as create). Live edit: Save needs the full publish set; blocked-reason line jumps to the first gap

---

## 7. Edit — About you and materials

- [ ] Form waits until the profile request finishes, then shows live profile name / location / links as read-only values (same as create)
- [ ] Note: from your profile; this page chooses what recruiters see; **Edit profile** for changes
- [ ] A field the saved application left empty starts hidden (eye crossed) even when the profile now has a value; the next save includes it only if you show it
- [ ] Names are read-only; saving does **not** PUT the profile — it only snapshots shown fields onto the application
- [ ] Changing Profile alone does **not** change a previously saved application’s public text until you edit and save here
- [ ] Profile picture: live from the profile; show switch when a picture exists; off dims the preview; missing picture links to Profile (no upload on the form)
- [ ] Changing the profile picture on Profile **does** show on `/view` when this app has show-picture on (no re-save needed for the image file)
- [ ] CV radios stay usable while the library loads; saved source is not overwritten by the fetch
- [ ] Switch primary ↔ tailored (with confirm when leaving a tailored file); `/view` matches after save
- [ ] Missing CV: **Check again** shows Checking… then clears or says the file is still missing — no full-page spinner

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
