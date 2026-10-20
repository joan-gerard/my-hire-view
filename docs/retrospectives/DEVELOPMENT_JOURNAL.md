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
