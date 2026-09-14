# Manual test — create-application draft + CV source (F15)

Covers **F15-045** (local form draft) and **F15-049** (CV source while library loads) on `/admin/new`.

## Setup

- Signed in as a user with at least one **primary CV** in the library (for most CV checks).
- Optional: a second browser profile / private window to confirm drafts are scoped per account key.

## F15-049 — CV source while library loads

- [ ] Open `/admin/new`. While “Loading your CV library…” is visible, both **Use a primary CV** and **Upload a different CV** radios are disabled.
- [ ] After load finishes with primaries present, **Use a primary CV** is selected by default and a library CV is chosen.
- [ ] Switch to **Upload a different CV**, choose a PDF, then confirm Save would use tailored (filename shown; primary select hidden). Refresh is covered under draft below — mode must stay tailored after any library re-fetch is not forced back to primary.
- [ ] With an empty primary library: after load, mode defaults to tailored; Manage library still works. After uploading the first primary via the modal **without** having chosen tailored first, create can prefer primary. If you already chose tailored before adding a primary, mode stays tailored.

## F15-045 — Persist create draft

- [ ] On `/admin/new`, fill **Company**, **Role**, **YouTube URL**, tweak a candidate field, set **Name in URL**, and (optionally) switch CV mode / primary selection.
- [ ] Refresh the page (or navigate to `/admin` and back to `/admin/new`). Typed fields and CV **mode** / primary selection restore. Profile prefills do not wipe restored values.
- [ ] If draft restored **Upload a different CV**, re-choose the PDF (files are not stored in the draft).
- [ ] Complete Save successfully → land on `/admin`. Re-open `/admin/new`: form is clean (no previous company/role).
- [ ] Leave an empty new form idle: no stale draft appears on a later visit (blank drafts are not kept).

## Done when

Checks above pass and `pnpm test:ci` is green.
