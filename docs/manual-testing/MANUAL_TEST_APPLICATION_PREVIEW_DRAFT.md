# Manual test — application draft, preview, and publish (F16)

Covers **F16-050**: create saves as draft → owner preview on the share URL → publish to make it live.

Related: local browser form draft (F15) is separate — [MANUAL_TEST_CREATE_APP_DRAFT_AND_CV_MODE.md](MANUAL_TEST_CREATE_APP_DRAFT_AND_CV_MODE.md).

## Prerequisites

- [ ] Logged in with a profile that has a **Public id** (share links work)
- [ ] At least one primary CV or a PDF ready to upload as tailored

## Happy path

- [ ] `/admin/new` → fill form → **Save & Preview**
- [ ] Redirects to `/view/{publicId}/{slug}` with an amber **Draft preview** banner (Edit / Publish / Dashboard). If you land on `/admin` instead, open **Preview** on the draft card (missing Public id is the only expected fallback).
- [ ] Page shows CV, video, and candidate fields as recruiters will see them after publish
- [ ] Open the same URL in a private/incognito window (or signed out) → empty “doesn’t have an active application” state (no CV/video)
- [ ] Click **Publish** on the banner → banner disappears; page stays as the live public view
- [ ] Dashboard card is **active**; **Copy Link** works; **View Application** (not Preview)

## Dashboard draft card

- [ ] Create another draft and return to `/admin` without publishing
- [ ] Card shows draft status icon; **Publish** button; **Publish to share** instead of Copy Link; **Preview** opens the share URL with the banner
- [ ] 3-dot menu: **Publish** (not Archive); Edit and Delete still work
- [ ] Publish from the card → active; Copy Link enabled

## Edit keeps draft

- [ ] Edit a draft → Save Application → still draft on the dashboard (not auto-published)
- [ ] Preview again, then Publish

## Negative / smoke

- [ ] Draft view does not bump view count for the owner (insights stay at 0 until a non-owner views after publish)
- [ ] Archived apps still show the empty state for everyone (including the owner) — no draft-style preview banner
