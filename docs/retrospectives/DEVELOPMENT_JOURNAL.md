# Development journal

A running diary of how the product is evolving — what we chose, what we deferred, and how the work felt. Write so a future read (months later) can reconstruct the story without needing the code open. **Append new entries after the latest one** (oldest → newest). Treat past entries as a record: do not rewrite them unless you need to clarify, fix an error, or lightly reorganise for readability. Implementation detail, checklists, and open questions belong in topic retrospectives (for example [APPLICATION_FORM_STEPS_F35.md](APPLICATION_FORM_STEPS_F35.md) or [CREATE_APP_DRAFT_AND_LEAVE.md](CREATE_APP_DRAFT_AND_LEAVE.md)); this file stays the narrative spine.

---

## 19 October 2026

Picked up the before-launch sequence after F34. Next on the board: F35 (rethink create/edit) and F38 (polish the public view page). Both cards went to In Progress; the day belonged to F35.

The create/edit form has been a long scroll for a while — company, role, candidate bits, media, share URL, tips. F35’s point was to stop arguing in the abstract and try two patterns for real: a wizard (one job per screen) and a single page of collapsible sections. Same field map and save behaviour underneath; two shells on top so we are comparing layout, not two half-finished forms. Steps roughly: Role & share URL → About you → CV & video → Review & save. Working notes live in [APPLICATION_FORM_STEPS_F35.md](APPLICATION_FORM_STEPS_F35.md).

Once both shells existed, the day shifted to shaking them down — saving too early from the middle of the form, focus and keyboard rough edges, sections that felt too rigid. The fixes are logged in the F35 retrospective; the lesson for later is that trying both patterns only helps if the shared form stays boring and we find the sharp edges before picking a winner.

Along the way we talked through forks we are _not_ shipping yet. Letting candidates pick wizard vs sections in Profile feels like a last resort — only if people ask after launch. Wizard on create and sections on edit is more interesting, because create and edit are different jobs. Splitting by viewport (mobile wizard / desktop sections) is a useful test lens but a shaky default, especially stacked with other hybrids. Stances are in the F35 doc so we do not re-litigate them cold.

Late in the day: should people save a real draft on the server even when required fields are empty, while still blocking go-live until everything is complete? Right instinct — browser drafts are not dashboard applications, and Publish today is basically a status flip — but the wrong change to land inside F35. Form layout and Save/publish rules are different risks. Parked as F40 ([INCOMPLETE_DRAFT_SAVES.md](../product/INCOMPLETE_DRAFT_SAVES.md)) for after we pick a layout. A leave-dialog “save draft and leave” idea is mostly a wording trap: the browser draft already keeps work; the missing choice would be leave-but-keep versus discard, and that stays out of F40 for now.

Competitive comparison notes (live edit vs Reslink, PDF badge gap) came up separately; they should not hitch a ride on the F35 layout commits.

Tomorrow’s path: finish F35 manual testing, choose a layout (or a deliberate hybrid); then F38 when ready; then F40 once Save meaning is stable.

---

## 20 October 2026

Stepped away from F35 shells long enough to turn the Reslink notes into a real product decision.

[COMPETITIVE_COMPARISON.md](../product/COMPETITIVE_COMPARISON.md) is now the living vs-Reslink list: wins and gaps, High/Medium/Low impact with an evaluation, and a short **Decision** on each item. Early entries covered Getting started, quarterly billing, live edit (Reslink only edits drafts), the CV PDF badge, cover photo, and username-in-URL.

The username thread mattered most. Reslink calls it a **username** (handle), auto-generates at signup, lets you edit, and blocks signup until the handle is free. We had planned opaque public ids everywhere and vanity only on Premium (`J1-079`). That looks weak next to Reslink’s Free branded links — and worse: someone could pay for Premium, fail to get `joan-gerard`, and feel cheated. Claiming once at signup for every tier is also simpler than opaque-now / vanity-later migrations.

**Decision:** copy Reslink-style username for **all tiers at signup**, not Premium-only vanity. Keep opaque as internal/canonical if useful; privacy as an optional private-link mode later, not the default. Premium branding should ride durable unlocks (personalization, analytics, caps), not a scarce name string.

Backlog caught up: cancelled Premium vanity `J1-079`; new before-launch Should `J1-126` (implement username) + `J4-125` (pricing docs first); `E1` / Epic J / [BEFORE_LAUNCH_PR_ORDER.md](../product/BEFORE_LAUNCH_PR_ORDER.md) nudged so we do not lock Premium vanity into E1. Trello Pre Launch cards match. Order when we act: **J4 → J1 → E1**.

F35 path for the rest of the week is unchanged — this was a packaging/identity fork, not a create-form commit.

---

## 23 October 2026

The layout experiment ends on one shell. Create and edit both use the wizard: left step rail on a wide screen, sticky progress strip on a smaller one, Continue until Review, then save. The collapsible sections layout and the title-row switch are gone, including the query param and env flag that existed only to flip between them.

We looked at keeping sections for edit, or swapping by viewport, and left both out. Edit already opens every step, so “change the CV” does not need a second interaction model. One responsive wizard is easier to explain and to test than two forms that share a brain.

Working notes: [APPLICATION_FORM_STEPS_F35.md](APPLICATION_FORM_STEPS_F35.md). Incomplete server drafts (`F40`) and publish-from-review (`F41`) stay separate.

---

## 2 November 2026

The long create page and the parked wizard were both still too much form at once. A demo beside them — one chapter open, the rest a single line, and a Getting started-style checklist for what is ready — is now the create page. Edit stays the scrolling bands. The wizard stays parked for comparison.

Save, the browser draft, and the leave prompt did not change. The share link stays tucked behind Edit link so company and role are the first thing you see. Notes: [APPLICATION_FORM_WORKFLOW.md](../product/APPLICATION_FORM_WORKFLOW.md).

---

## 3 November 2026

The checklist won for create, so the comparison surfaces came down. `/admin/wizard` and the application-form demo are gone. Edit stays the scrolling page. The wizard layout code is still in the form, unused by a route.

Later the same day the checklist itself felt like too many doors for a short form. Create is one card again: every field on the page, the name beside the control, Save at the bottom. The width stays tight (`2xl`) so it reads as a form, not a dashboard. Edit is unchanged. What you fill in, and what blocks a save, did not change.

The same pass cut the identity editors. A name, a location, a portfolio, and a LinkedIn belong on the profile, not on every application. Create and edit show those values and only choose what this page includes: the name is always on, and location, portfolio, and LinkedIn can be hidden when the profile has them. A missing picture or link points at Profile instead of a second field. Saving still copies the current profile onto the application, so a public page does not follow a later profile edit until the next save. The résumé download name is the generated one; the original-filename switch is gone. The inventory and the calls are in [CREATE_FORM_FIELD_TRIM.md](../product/CREATE_FORM_FIELD_TRIM.md).

A missing portfolio or LinkedIn should not send someone away from a half-finished application. Those two open a small dialog, save onto the profile, and come back as Show / Hidden. Location still sends you to Profile. The profile remains the only copy of the URL.

Link order and the ending no longer hide behind a toggle. They stay on the share-link row, and the read-only URL with the copy button sits under them.

---

## 4 November 2026

About you kept shifting under our feet, so the day is worth keeping as one thread.

We started from the trim: identity lives on the profile; create only chooses what this page shows. Empty portfolio and LinkedIn briefly used a dialog so people did not have to leave a half-finished application. Location followed. Then the dialogs felt wrong next to Your link — so name, location, portfolio, and LinkedIn became dense fields like Company and Role, with a show switch under each optional value. The picture stayed a preview. Saving the application writes those text fields to the profile first, then snapshots what this page shows. Soft warnings catch a LinkedIn URL in portfolio and the reverse.

That write-through raised the honesty problem. Editable account fields make people think the profile already changed. We debated a dedicated About you Save (section or per row) versus one form Save. Dedicated Save would match “update my account now,” but it splits the form into two commit models and invites partial profile saves before an application exists. We chose one Save: the bottom create or edit button. Transparency has to carry the timing. The About you note now says those details update the profile when you save this application — not if you cancel or leave — and that this page only chooses what recruiters see. Edit and the split recommendations say the same. Revisit a section Save only if people still edit About you and leave without saving. Inventory and calls: [CREATE_FORM_FIELD_TRIM.md](../product/CREATE_FORM_FIELD_TRIM.md).

---

## 18 November 2026

Came back to the create-form spike after a break and closed the layout fork. The one-page create form stays; edit keeps the scrolling bands. The parked wizard shell is gone from the codebase — no second presentation mode to maintain, and the page components left the `admin/wizard` folder for ordinary create/edit names. The F35 notes keep the experiment history; live behavior is [APPLICATION_FORM_WORKFLOW.md](../product/APPLICATION_FORM_WORKFLOW.md).

---

## 24 November 2026

Locked the incomplete-draft decision that had been parked as F40. Feedback was that drafts asked for too much — especially YouTube — before the first real save. The rule we kept: a **draft** can persist once company and role are in (the link ending and shareable link come along because they are auto-built from those). Résumé, pitch, and names wait for **publish** (and for saving an already-live app). Publish is no longer a bare status flip; the server lists what is still missing. Owner preview shows a résumé placeholder when none is attached yet. Details: [INCOMPLETE_DRAFT_SAVES.md](../product/INCOMPLETE_DRAFT_SAVES.md).

Same day we locked the create layout onto edit. The scrolling split bands on `/admin/edit/[id]` are gone; edit uses the same one-page section cards as `/admin/new`. One form shell to maintain, and F35 is closed as shipped rather than “create one way, edit another.”

Create’s primary action is now **Save Draft** only: it persists the draft and lands on that application’s edit page, not the owner preview. On edit, **Save Draft** stays off until something changes since the last save, and a successful save stays on the edit page instead of bouncing to the dashboard. When the full publish set is ready on create or a draft edit, **Publish** appears beside Save and goes live to the share page (F41 partial). Dashboard draft cards follow the same gate: **Publish** only when complete; incomplete drafts use a distinct status color instead of a **Finish to publish** chip.

Feedback that About you “says one thing and does another” landed: editable identity fields with profile write-through contradicted “this page only chooses what recruiters see.” About you is now read-only values from the profile, with show/hide and an **Edit profile** link. Saving the application only snapshots what this page shows.

Leave confirm now only fires when there is real progress, and covers Cancel, Edit profile, admin links, and Back on create and dirty edit. The dialog can save a draft when company, role, and the link are ready, then continues to the page you were heading to.

Contact was the next honesty gap. The product promises recruiters a page they can act on, but About you only offered presence — name, location, links — not email or phone. Feedback asked for contact that is visible and controllable on the form. We kept the profile-owned pattern: email is a normal editable profile field (prefilled from the account email, changeable like a name), plus an optional phone. Default show/hide for email, phone, picture, location, LinkedIn, and portfolio lives on the profile so new applications start from a preference, not a guess. Create and edit still only choose what this page includes; `/view` shows what was snapshotted. Field inventory: [CREATE_FORM_FIELD_TRIM.md](../product/CREATE_FORM_FIELD_TRIM.md).
