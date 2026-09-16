# Manual test — Public id copy + share URL preview (F19-046)

Covers **F19-046**: explain Public id on profile (and create), and show the final share URL before submit.

Related: draft preview — [MANUAL_TEST_APPLICATION_PREVIEW_DRAFT.md](MANUAL_TEST_APPLICATION_PREVIEW_DRAFT.md).

## Prerequisites

- [ ] Logged in with a profile that has a **Public id** (typical after signup)
- [ ] Optional: a second account or broken state to see the “Not ready yet” copy (rare)

## Profile (`/admin/profile`)

- [ ] Account section shows **Public id** as a read-only monospace value
- [ ] Helper text explains it appears in share links and is not the user’s name
- [ ] Example path shown as `/view/{publicId}/company-role`

## Create application (`/admin/new`)

- [ ] Under **Slug**, a **Share link preview** box shows the full URL once company/role (or slug) produce a value
- [ ] Preview updates live when slug / Name in URL changes
- [ ] Box mentions Public id and that drafts stay private until publish
- [ ] With Public id present, the path includes `/view/{publicId}/{slug}`

## Edit application (smoke)

- [ ] Same share link preview appears under Slug on `/admin/edit/[id]`

## Missing Public id (if reproducible)

- [ ] Profile shows the “Not ready yet” message instead of an id
- [ ] Create form preview shows placeholders and the missing-id help (not a broken empty URL)
