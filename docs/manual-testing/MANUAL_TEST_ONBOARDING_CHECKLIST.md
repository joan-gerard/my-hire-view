# Manual test — new-user onboarding checklist (F19-044)

Covers **F19-044**: floating Getting started checklist on all `/admin` routes for profile, photo, primary CV, first application, and publish/share.

## Prerequisites

- [ ] Prefer a **fresh account** (or clear prior photo/CVs/apps) so incomplete steps are visible
- [ ] Logged in
- [ ] To reset in this browser: clear `localStorage` key `myhireview:onboarding-checklist` (single blob: `accountKey`, `completed`, `skipped`, `dismissed`, `expanded`)

## Floating availability

- [ ] Checklist appears as a floating panel (bottom-right) on `/admin`, `/admin/profile`, `/admin/new`, and `/admin/edit/[id]`
- [ ] Progress shows (e.g. `N of 6 complete`) when any step is incomplete
- [ ] **Minimize** collapses to a compact **Getting started N/6** control; expand restores the panel — open/closed choice survives refresh and navigation

## Steps

- [ ] **Create your profile** — complete when first + last name are saved on Profile; link goes to `/admin/profile`
- [ ] **Add location or a link** — complete when **at least one** of location, LinkedIn, or portfolio is set
- [ ] **Add a profile photo** — complete after uploading a picture; still incomplete if names exist but no photo
- [ ] **Upload a primary CV** — complete after adding ≥1 primary CV on Profile
- [ ] **Create your first application draft** — complete after Save & Preview (draft counts)
- [ ] **Publish & share** — complete only after an application is **active** (Publish); drafts alone are not enough

## Skip

- [ ] Each incomplete step has **Skip**; skipped steps show as **Skipped**, count toward progress, and survive refresh
- [ ] Completing a previously skipped step via real data shows it as completed (not Skipped)
- [ ] **Skip all** marks every step skipped; the panel **stays open** and footer switches to **Dismiss**
- [ ] After Skip all, clearing the skipped localStorage key brings incomplete steps back (if not dismissed)

## Completion

- [ ] After a step ticks off from real data, it **stays checked** even if that data is later removed (e.g. publish → delete the only application; Publish & share remains complete in this browser **for that account key**)
- [ ] Account **without** a profiles row (GET `/api/profile` → 404) still shows the checklist with **Create your profile** incomplete
- [ ] Delete account + recreate with the same email (new public id / user) → checklist starts fresh (does not inherit the previous account’s completed/skipped/dismissed prefs)
- [ ] After all six are done or skipped, the panel stays visible with progress **All set** (minimized chip shows **Done**) and **Dismiss** instead of **Skip all**
- [ ] **Dismiss** hides the checklist for this browser + account (survives refresh); clearing the storage key brings it back
- [ ] Completing a step (save profile, upload photo/CV, create app, publish) ticks it off **without** a full page refresh while you stay on `/admin`
- [ ] Navigating between admin routes does **not** refetch checklist counts by itself; saving/publishing (or remounting admin) does

## Smoke

- [ ] Users who dismissed (or never see incomplete work after dismiss) do not see the floating control
- [ ] Create/edit forms remain usable with the panel minimized
- [ ] Search / legend / create still work with the checklist visible
