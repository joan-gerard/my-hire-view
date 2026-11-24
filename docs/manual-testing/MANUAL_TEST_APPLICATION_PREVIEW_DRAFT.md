# Manual test — application draft, preview, and publish (F16)

Covers **F16-050**: create saves as draft → continue on edit → owner preview on the share URL (from the card or link) → publish to make it live.

Related: local browser form draft (F15) is separate — [MANUAL_TEST_CREATE_APP_DRAFT_AND_CV_MODE.md](MANUAL_TEST_CREATE_APP_DRAFT_AND_CV_MODE.md).

## Prerequisites

- [ ] Logged in with a profile that has a **Public id** (share links work)
- [ ] At least one primary CV or a PDF ready to upload as tailored

## Happy path

- [ ] `/admin/new` → fill form → **Save Draft**
- [ ] Redirects to `/admin/edit/[id]` for the new draft (not the owner preview). Fallback is `/admin` if the create response has no id
- [ ] From the dashboard card (or the share link), open **Preview** → `/view/{publicId}/{slug}` with an amber **Draft preview** banner (Edit / Publish / Dashboard)
- [ ] Page shows CV, video, and candidate fields as recruiters will see them after publish (placeholders when résumé/video are still missing)
- [ ] Open the same URL in a private/incognito window (or signed out) → empty “doesn’t have an active application” state (no CV/video)
- [ ] Click **Publish** on the banner → banner disappears; page stays as the live public view
- [ ] Dashboard card is **active**; copy-link icon works; view-application icon (not Preview tooltip)

## Dashboard draft card

- [ ] Create another draft and return to `/admin` without publishing
- [ ] Incomplete draft: orange **Draft (incomplete)** status; no Publish button; copy-link disabled; **Preview** still opens the share URL with the banner
- [ ] Complete draft: labeled **Publish**; **More options** includes Publish; Edit and Delete still work
- [ ] Publish from the card → active; copy-link icon enabled

## Edit keeps draft

- [ ] Edit a draft → Save Application → still draft on the dashboard (not auto-published)
- [ ] Preview again, then Publish

## Negative / smoke

- [ ] Draft view does not bump view count for the owner (insights stay at 0 until a non-owner views after publish)
- [ ] Archived apps still show the empty state for everyone (including the owner) — no draft-style preview banner
