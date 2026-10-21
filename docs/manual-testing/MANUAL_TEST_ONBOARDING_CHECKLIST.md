# Manual test — new-user onboarding checklist (F19-044)

Covers **F19-044**: Getting started checklist on the `/admin` dashboard right rail (above Summary) for profile, photo, primary CV, first application, and publish/share.

Data flow (Mermaid): [DATA_FLOW_ONBOARDING_CHECKLIST.md](../architecture/DATA_FLOW_ONBOARDING_CHECKLIST.md).

## Prerequisites

- [ ] Prefer a **fresh account** (or clear prior photo/CVs/apps) so incomplete steps are visible
- [ ] Logged in
- [ ] To reset in this browser: clear `localStorage` key `myhireview:onboarding-checklist` (single blob: `accountKey`, `completed`, `skipped`, `dismissed`, `expanded`)

## Dashboard rail

- [ ] On `/admin`, the right rail shows **Search** first once you have applications (it stays visible while the column scrolls), then **Getting started** (unless dismissed), then **Summary** (All / Live / Draft / Archived counts)
- [ ] Checklist does **not** float on `/admin/profile`, `/admin/new`, or `/admin/edit/[id]`
- [ ] **Summary** and **Getting started** each collapse/expand from their header; open/closed choice survives refresh
- [ ] Getting started header shows only the title plus a lime **N/6** or **Done** pill (no subtitle); expanded body shows progress bar and the six steps
- [ ] On small screens, Summary + Getting started appear below the applications list
- [ ] On desktop (`lg+`), with the page still at the top and both panels expanded, wheel/trackpad over the right rail scrolls **only that column** (no visible scrollbar). Summary's last row (Archived hint and the card's bottom edge) and the Getting started footer (Skip all / Dismiss, without a clipped extra line) are reachable inside the rail. The applications list does not move

## Steps

- [ ] Ordered list includes: Create your profile → Add location or a link → Add a profile photo → Upload a primary CV → Create your first application draft → Publish & share
- [ ] **Create your profile** — complete when first + last name are saved on Profile; link goes to `/admin/profile`
- [ ] **Add location or a link** — complete when **at least one** of location, LinkedIn, or portfolio is set
- [ ] **Add a profile photo** — complete after uploading a picture; still incomplete if names exist but no photo
- [ ] **Upload a primary CV** — complete after adding ≥1 primary CV on Account settings → **CVs** (link opens that tab even when already on `/admin/profile`)
- [ ] **Create your first application draft** — complete after Save & Preview (draft counts)
- [ ] **Publish & share** — complete only after an application is **active** (Publish); drafts alone are not enough

## Skip

- [ ] Each incomplete step has **Skip**; skipped steps show as **Skipped**, count toward progress, and survive refresh
- [ ] Completing a previously skipped step via real data shows it as completed (not Skipped)
- [ ] **Skip all** marks every step skipped; the panel **stays open** and footer switches to **Dismiss**
- [ ] After Skip all, clear the `skipped` array inside the `myhireview:onboarding-checklist` blob (or clear that whole key per Prerequisites) to bring incomplete steps back if not dismissed

## Completion

- [ ] After a step ticks off from real data, it **stays checked** even if that data is later removed (e.g. publish → delete the only application; Publish & share remains complete in this browser **for that account key**)
- [ ] Account **without** a profiles row still shows the checklist with **Create your profile** incomplete
- [ ] Delete account + recreate with the same email (new public id / user) → checklist starts fresh (does not inherit the previous account’s completed/skipped/dismissed prefs)
- [ ] After all six are done or skipped, the panel stays visible with progress **All set** and **Dismiss** instead of **Skip all**
- [ ] **Dismiss** hides the checklist for this browser + account (survives refresh); clearing the storage key brings it back; Summary remains
- [ ] Completing a step (save profile, upload photo/CV, create app, publish) ticks it off **without** a full page refresh when you return to `/admin`
- [ ] First paint of `/admin` does **not** fire four checklist `/api/*` GETs (snapshot comes from the dashboard page); saving/publishing still refreshes via notify when the rail is mounted
- [ ] Summary counts update after publish / archive / restore / delete on the dashboard

## Smoke

- [ ] Dismissed users do not show the checklist rail; Summary still shows
- [ ] With OS “reduce motion” enabled, the progress bar width does not animate
