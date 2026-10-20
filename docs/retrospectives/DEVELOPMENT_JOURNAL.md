# Development journal

A running diary of how the product is evolving — what we chose, what we deferred, and how the work felt. Write so a future read (months later) can reconstruct the story without needing the code open. **Append new entries after the latest one** (oldest → newest). Treat past entries as a record: do not rewrite them unless you need to clarify, fix an error, or lightly reorganise for readability. Implementation detail, checklists, and open questions belong in topic retrospectives (for example [APPLICATION_FORM_STEPS_F35.md](APPLICATION_FORM_STEPS_F35.md) or [CREATE_APP_DRAFT_AND_LEAVE.md](CREATE_APP_DRAFT_AND_LEAVE.md)); this file stays the narrative spine.

---

## 19 October 2026

Picked up the before-launch sequence after F34. Next on the board: F35 (rethink create/edit) and F38 (polish the public view page). Both cards went to In Progress; the day belonged to F35.

The create/edit form has been a long scroll for a while — company, role, candidate bits, media, share URL, tips. F35’s point was to stop arguing in the abstract and try two patterns for real: a wizard (one job per screen) and a single page of collapsible sections. Same field map and save behaviour underneath; two shells on top so we are comparing layout, not two half-finished forms. Steps roughly: Role & share URL → About you → CV & video → Review & save. Working notes live in [APPLICATION_FORM_STEPS_F35.md](APPLICATION_FORM_STEPS_F35.md).

Once both shells existed, the day shifted to shaking them down — saving too early from the middle of the form, focus and keyboard rough edges, sections that felt too rigid. The fixes are logged in the F35 retrospective; the lesson for later is that trying both patterns only helps if the shared form stays boring and we find the sharp edges before picking a winner.

Along the way we talked through forks we are *not* shipping yet. Letting candidates pick wizard vs sections in Profile feels like a last resort — only if people ask after launch. Wizard on create and sections on edit is more interesting, because create and edit are different jobs. Splitting by viewport (mobile wizard / desktop sections) is a useful test lens but a shaky default, especially stacked with other hybrids. Stances are in the F35 doc so we do not re-litigate them cold.

Late in the day: should people save a real draft on the server even when required fields are empty, while still blocking go-live until everything is complete? Right instinct — browser drafts are not dashboard applications, and Publish today is basically a status flip — but the wrong change to land inside F35. Form layout and Save/publish rules are different risks. Parked as F40 ([INCOMPLETE_DRAFT_SAVES.md](../product/INCOMPLETE_DRAFT_SAVES.md)) for after we pick a layout. A leave-dialog “save draft and leave” idea is mostly a wording trap: the browser draft already keeps work; the missing choice would be leave-but-keep versus discard, and that stays out of F40 for now.

Competitive comparison notes (live edit vs Reslink, PDF badge gap) came up separately; they should not hitch a ride on the F35 layout commits.

Tomorrow’s path: finish F35 manual testing, choose a layout (or a deliberate hybrid); then F38 when ready; then F40 once Save meaning is stable.

---

## 20 October 2026

Stepped away from F35 shells long enough to turn the Reslink notes into a real product decision.

[COMPETITIVE_COMPARISON.md](../product/COMPETITIVE_COMPARISON.md) is now the living vs-Reslink list: wins and gaps, High/Medium/Low impact with an evaluation, and a short **Decision** on each item. Early entries covered Getting started, quarterly billing, live edit (Reslink only edits drafts), the CV PDF badge, cover photo, and username-in-URL.

The username thread mattered most. Reslink calls it a **username** (handle), auto-generates at signup, lets you edit, and blocks signup until the handle is free. We had planned opaque public ids everywhere and vanity only on Premium (`J1-079`). That looks weak next to Reslink’s Free branded links — and worse: someone could pay for Premium, fail to get `joan-gerard`, and feel cheated. Claiming once at signup for every tier is also simpler than opaque-now / vanity-later migrations.

**Decision:** copy Reslink-style username for **all tiers at signup**, not Premium-only vanity. Keep opaque as internal/canonical if useful; privacy as an optional private-link mode later, not the default. Premium branding should ride durable unlocks (personalization, analytics, caps), not a scarce name string.

Backlog caught up: `J1-079` rewritten and pulled to before-launch Should; new `J4-125` to fix pricing docs/copy first; `E1` / Epic J / [BEFORE_LAUNCH_PR_ORDER.md](../product/BEFORE_LAUNCH_PR_ORDER.md) nudged so we do not lock Premium vanity into E1. Trello Pre Launch cards match. Order when we act: **J4 → J1 → E1**.

F35 path for the rest of the week is unchanged — this was a packaging/identity fork, not a create-form commit.
