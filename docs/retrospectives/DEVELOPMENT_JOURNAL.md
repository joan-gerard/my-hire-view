# Development journal

A running diary of how the product and codebase are evolving — decisions, doubts, feedback, and what we actually shipped. Newest entries go at the top. When a thread gets big enough to deserve its own home, spin it into a topic retrospective (for example [APPLICATION_FORM_STEPS_F35.md](APPLICATION_FORM_STEPS_F35.md) or [CREATE_APP_DRAFT_AND_LEAVE.md](CREATE_APP_DRAFT_AND_LEAVE.md)); this file stays the narrative spine.

---

## 19 October 2026

Picked up the before-launch sequence after F34. The plan says the next user-facing work is F35 (rethink create/edit) and F38 (polish the public `/view` page), so both Trello cards went to In Progress and we focused the day on F35.

The create/edit form has been a long scroll for a while — company, role, candidate fields, picture, CV, video, slug, actions, tips. F35’s ask was to stop guessing which pattern is better and try two for real: a wizard (one job per screen) and a one-page accordion of sections. We kept a single shared step map and the same form “brain,” then built two shells around it so draft leave, CV library, and slug preview would not diverge. To flip between them while testing we added a small flag-like switch — query param, then localStorage, then env — rather than two long-lived branches or a Preferences setting candidates would see. Default is sections. The steps themselves are Role → About you → CV & video → Share URL → Review & save. The working notes and checklist live in [APPLICATION_FORM_STEPS_F35.md](APPLICATION_FORM_STEPS_F35.md) on the F35 branch until that PR lands.

Once the shells were up, the day became a lot of “what will hurt in manual QA?” We tightened the switch into a real radio group, stopped re-clicking the active option from resetting the form, fixed focus rings, wired accordion `aria-controls`, and made blocked Continue buttons focusable so the reason is not trapped behind `disabled`. A nasty one: notifying the layout store with a fake `popstate` made the create leave-confirm think you hit Back — so style changes now use their own event. Enter in the YouTube field could submit from an intermediate step if everything happened to be valid, so save is limited to Review; when save-time errors fire for fields that are not mounted, we jump to the step that owns them (and we fixed the ordering so earlier steps win). Sections can now collapse entirely, not only swap which one is open.

Along the way we talked through product forks we are *not* shipping yet. A Profile preference for wizard vs sections feels like a last resort — only if people ask after launch. Using wizard on create and sections on edit is a more interesting hybrid, because it maps to different jobs; viewport-based splitting (mobile wizard / desktop sections) is useful as a test lens but a shaky default, especially if stacked with other hybrids. Those stances are recorded in the F35 retrospective so we do not re-litigate them cold.

Late in the day: should users save a server draft even when required fields are empty, while still blocking go-live until everything is complete? That is the right product instinct — localStorage drafts are not dashboard applications, and Publish today is basically a status flip with no completeness check — but it is the wrong change to land inside F35. Layout A/B and Save/publish rules are different risks. We parked the plan as F40 ([INCOMPLETE_DRAFT_SAVES.md](../product/INCOMPLETE_DRAFT_SAVES.md)) for a separate PR after the layout pick. A related leave-dialog idea (“save draft and leave”) is mostly a wording trap: the browser draft already autosaves; the missing option would be leave-but-keep versus discard, and that stays out of F40 for now.

Competitive comparison notes (live edit vs Reslink, PDF badge gap) came up separately; they should not hitch a ride on the F35 layout commits.

Tomorrow’s path is clear enough: finish F35 manual testing, choose a layout (or a deliberate hybrid), remove the test switch; then F38 when ready; then revisit F40 once Save meaning is stable.
