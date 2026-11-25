# Manual test — create-application draft + CV source (F15)

Covers **F15-045** (local form draft) and **F15-049** (CV source while library loads) on `/admin/new`. Design rationale (keep draft on refresh; discard on confirmed intentional leave): [CREATE_APP_DRAFT_AND_LEAVE.md](../retrospectives/CREATE_APP_DRAFT_AND_LEAVE.md).

## Setup

- Signed in as a user with at least one **library résumé** (for most résumé-source checks).
- Optional: a second account on the same browser to confirm drafts are scoped by auth `user.id` (not a shared `local` key).

## F15-049 — Résumé source while library loads

- [ ] Open `/admin/new`. While “Loading your résumé library…” is visible, both **Use library résumé** and **Upload one for this role** radios are disabled (**create only**).
- [ ] On **Edit**, radios stay usable while the library loads (saved résumé source is not overwritten by the fetch).
- [ ] After load finishes with library résumés present, **Use library résumé** is selected by default and a library file is chosen.
- [ ] Switch to **Upload one for this role**, choose a PDF — mode must stay tailored after refresh (draft) and must not flip back when the library finishes loading.
- [ ] With a library résumé selected, switch to **Upload one for this role** without picking a PDF, fill company/role/slug, **Save draft** — succeeds (no “CV URL must be a tailored upload…”). Publish still requires a file.
- [ ] With an empty résumé library: after load, mode stays **Use library résumé** (Free default) with **No résumés in your library yet** and **Manage library**. After uploading the first library résumé via the modal **without** having chosen tailored first, create selects that library file. If you already chose tailored before adding a library résumé, mode stays tailored.
- [ ] (Optional) Throttle / block `/api/profile/primary-cvs`: within ~12s radios unlock so a tailored résumé can still be chosen.

## F15-045 — Persist create draft

- [ ] On `/admin/new`, edit only candidate fields (e.g. location) then refresh — those edits restore (personal-only progress is kept).
- [ ] Fill **Company**, **Role**, **YouTube URL**, link options, and résumé mode / library selection; refresh — fields restore. Profile prefills do not wipe restored values.
- [ ] If draft restored **Upload one for this role**, re-choose the PDF (files are not stored in the draft).
- [ ] Restore a draft whose library résumé was deleted meanwhile: Save is not ready with a stale id; mode stays library when the library is empty (no file selected), or another library résumé when one remains.
- [ ] Fail Save (e.g. offline create / forced API error): draft remains. Succeed Save → `/admin/new` is clean afterward.
- [ ] With no progress (including a form that only shows profile name/links), **Cancel** / **Dashboard** / **Edit profile** leave without a dialog; waiting on the page then leaving still does not confirm
- [ ] With progress, **Cancel** / **Dashboard** / **Profile** / **Edit profile** / browser **Back**: confirm dialog (“Leaving this page will discard unsaved changes…”). If company or role is missing, the dialog suggests adding them to save a draft (no Save Draft button). If company and role are filled and the link is ready, **Save Draft** appears between No and Yes; while saving the dialog stays open; after success it closes and continues to the page you were heading to. **No, stay** keeps you on the form. **Yes, I'm sure** leaves without saving and clears the browser draft — reopening New Application is clean
- [ ] After confirming a Dashboard/Profile link leave, you land on the target and **Back does not return to `/admin/new`** (sentinel was dropped before replace).
- [ ] Edit then clear fields back to empty: leave no longer prompts (and Back does not require an extra press). Then type again so progress returns: leave prompts again (sentinel re-armed after the clear).
- [ ] Untouched form (profile prefills only): leaving does not prompt.
- [ ] Manual slug edits are protected by the leave dialog; auto slug updates alone are not.
- [ ] Opening `/admin/new` as the first tab history entry, then confirming Back, still leaves create (falls back to dashboard if needed).
- [ ] Two accounts on one browser: drafts do not overwrite each other.
- [ ] Leave a fully empty new form idle: no stale draft on a later visit.

## Done when

Checks above pass and `pnpm test:ci` is green.
