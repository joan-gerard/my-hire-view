# Manual test — create-application draft + CV source (F15)

Covers **F15-045** (local form draft) and **F15-049** (CV source while library loads) on `/admin/new`.

## Setup

- Signed in as a user with at least one **primary CV** in the library (for most CV checks).
- Optional: a second account on the same browser to confirm drafts are scoped by auth `user.id` (not a shared `local` key).

## F15-049 — CV source while library loads

- [ ] Open `/admin/new`. While “Loading your CV library…” is visible, both **Use a primary CV** and **Upload a different CV** radios are disabled (**create only**).
- [ ] On **Edit**, radios stay usable while the library loads (saved CV source is not overwritten by the fetch).
- [ ] After load finishes with primaries present, **Use a primary CV** is selected by default and a library CV is chosen.
- [ ] Switch to **Upload a different CV**, choose a PDF — mode must stay tailored after refresh (draft) and must not flip back when the library finishes loading.
- [ ] With an empty primary library: after load, mode defaults to tailored. After uploading the first primary via the modal **without** having chosen tailored first, create can prefer primary. If you already chose tailored before adding a primary, mode stays tailored.
- [ ] (Optional) Throttle / block `/api/profile/primary-cvs`: within ~12s radios unlock so a tailored CV can still be chosen.

## F15-045 — Persist create draft

- [ ] On `/admin/new`, edit only candidate fields (e.g. location) then refresh — those edits restore (personal-only progress is kept).
- [ ] Fill **Company**, **Role**, **YouTube URL**, Name in URL, and CV mode / primary selection; refresh — fields restore. Profile prefills do not wipe restored values.
- [ ] If draft restored **Upload a different CV**, re-choose the PDF (files are not stored in the draft).
- [ ] Restore a draft whose primary CV was deleted meanwhile: Save is not ready with a stale id; mode falls back to tailored when the library is empty, or another primary when one remains.
- [ ] Fail Save (e.g. offline create / forced API error): draft remains. Succeed Save → `/admin/new` is clean afterward.
- [ ] With progress on the form, click **Dashboard** / **Profile** / browser **Back**: confirm dialog appears (“Leaving this page will discard this draft…”). **No, stay** keeps you on the page with the draft. **Yes, I'm sure** leaves and clears the draft — reopening New Application is clean.
- [ ] After confirming a Dashboard/Profile link leave, you land on the target and **Back does not return to `/admin/new`** (sentinel was dropped before replace).
- [ ] Edit then clear fields back to empty: leave no longer prompts (and Back does not require an extra press). Then type again so progress returns: leave prompts again (sentinel re-armed after the clear).
- [ ] Untouched form (profile prefills only): leaving does not prompt.
- [ ] Manual slug edits are protected by the leave dialog; auto slug updates alone are not.
- [ ] Opening `/admin/new` as the first tab history entry, then confirming Back, still leaves create (falls back to dashboard if needed).
- [ ] Two accounts on one browser: drafts do not overwrite each other.
- [ ] Leave a fully empty new form idle: no stale draft on a later visit.

## Done when

Checks above pass and `pnpm test:ci` is green.
