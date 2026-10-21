# Manual test — application card status legend (F19-047)

Covers **F19-047**: discoverable help for dashboard status icons and draft card actions.

Related: draft/preview/publish flow — [MANUAL_TEST_APPLICATION_PREVIEW_DRAFT.md](MANUAL_TEST_APPLICATION_PREVIEW_DRAFT.md).

## Prerequisites

- [ ] Logged in
- [ ] Ideally one of each: **draft**, **active (0 views)**, **active (viewed)**, **archived** (and a **CV missing** / **Picture missing** card if you can reproduce them)

## Legend modal

- [ ] With at least one application, `/admin` header shows a **What do these icons mean?** button (next to Applications)
- [ ] Clicking it opens a modal titled **Status icons & draft actions**
- [ ] Intro copy mentions changing indicator style under **Account settings → Preferences** (link closes the modal, goes to `/admin/profile`, and opens the Preferences tab)
- [ ] Modal lists: Draft, Active (not viewed yet), Active (viewed), Archived, **CV missing**, and **Picture missing** — with markers matching the current Preferences tab style / card badges (Picture missing is cool blue, distinct from pink CV missing)
- [ ] Same modal explains draft actions: **Publish**, **Preview**, **Publish to share**
- [ ] Close via **Close** button, Escape, or backdrop click; focus returns to the page
- [ ] On open, focus moves into the modal on the heading (not the Close button). Mouse open should not show a selection-style ring; a `focus-visible` outline remains available for keyboard focus indication
- [ ] While the modal is open, the dashboard page behind it does **not** scroll (body scroll locked)

## Cards stay consistent

### Colorful dots (Preferences default)

- [ ] Draft card: bright gold dot; labeled **Publish**; copy-link icon disabled (publish-to-share tooltip); external-link icon is **Preview** (not View application)
- [ ] Active, never viewed: bright sky dot
- [ ] Active, viewed at least once: bright lime dot
- [ ] Archived: soft grey dot; link unavailable until restore

### High contrast icons (Account settings → Preferences)

- [ ] Draft: soft gold wash + pencil; Active unviewed: sky wash + clock; Viewed: lime wash + check; Archived: mist wash + archive
- [ ] Preference survives refresh; dashboard and legend update after changing it on Preferences
- [ ] Changing the preference in another tab updates this tab without reload
- [ ] A second account in the same browser keeps its own style (does not overwrite the first)

- [ ] Hover/focus titles on the left status badge match the legend labels

## Smoke

- [ ] Search field is at the top of the right rail, above Getting started
- [ ] Empty dashboard (no apps, no search) hides the legend button and search bar
- [ ] After creating the first application, legend button and search bar appear
- [ ] Search with no matches still shows the legend button and search bar (Clear search works)
- [ ] Clearing a no-match search does **not** briefly flash the first-run empty state or hide the search bar before the full list returns
- [ ] Search / pagination still work after opening and closing the modal
- [ ] `/admin/profile` → **Preferences** tab shows **Status indicators** with live previews for both styles
