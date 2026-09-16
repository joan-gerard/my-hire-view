# Manual test — application card status legend (F19-047)

Covers **F19-047**: discoverable help for dashboard status icons and draft card actions.

Related: draft/preview/publish flow — [MANUAL_TEST_APPLICATION_PREVIEW_DRAFT.md](MANUAL_TEST_APPLICATION_PREVIEW_DRAFT.md).

## Prerequisites

- [ ] Logged in
- [ ] Ideally one of each: **draft**, **active (0 views)**, **active (viewed)**, **archived** (and a **CV missing** card if you can reproduce it)

## Legend modal

- [ ] With at least one application, `/admin` header shows a **What do these icons mean?** button (next to Applications)
- [ ] Clicking it opens a modal titled **Status icons & draft actions**
- [ ] Modal lists: Draft, Active (not viewed yet), Active (viewed), Archived, and CV missing — with matching icons/badge
- [ ] Same modal explains draft actions: **Publish**, **Preview**, **Publish to share**
- [ ] Close via **Close** button, Escape, or backdrop click; focus returns to the page
- [ ] On open, keyboard focus starts on the modal heading (not the Close button)
- [ ] While the modal is open, the dashboard page behind it does **not** scroll (body scroll locked)

## Cards stay consistent

- [ ] Draft card: amber clock; **Publish**; **Publish to share**; **Preview** (not View Application)
- [ ] Active, never viewed: green clock
- [ ] Active, viewed at least once: green check
- [ ] Archived: grey archive icon; link unavailable until restore
- [ ] Hover/focus titles on the left status icon match the legend labels

## Smoke

- [ ] Empty dashboard (no apps, no search) hides the legend button and search bar
- [ ] After creating the first application, legend button and search bar appear
- [ ] Search with no matches still shows the legend button and search bar (Clear search works)
- [ ] Clearing a no-match search does **not** briefly flash the first-run empty state or hide the search bar before the full list returns
- [ ] Search / pagination still work after opening and closing the modal
