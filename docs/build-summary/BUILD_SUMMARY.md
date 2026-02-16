# MyHireView — Build Summary

This document summarizes what was built commit-by-commit, in chronological order, to reflect the thinking process: what was created, updated, fixed, or refactored at each step.

> **Note:** This document should be updated only when explicitly requested. Do not update it automatically when new commits are made.

---

## Detailed history by phase

The full commit-by-commit detail is split into phase-based chunks:

| Phase | Description | Commits | Detail |
| ----- | ----------- | ------- | ------ |
| 1 | **Scaffold & MVP** | 1–7 | [01-scaffold-mvp.md](build-summary/01-scaffold-mvp.md) |
| 2 | **PR #1 — MVP refactor** | 8–16 (`44f7dd6` → `5b034bf` + merge) | [02-pr1-mvp-refactor.md](build-summary/02-pr1-mvp-refactor.md) |
| 3 | **PR #2 — Create profile page** | 17–24 (`f5d964a` → `151667b` + merge) | [03-pr2-create-profile-page.md](build-summary/03-pr2-create-profile-page.md) |
| 4 | **PR #3 — Bug: CV in blob** | 27–29 (`c19c88e`, `a5da3f6` + merge) | [04-pr3-bug-cv-in-blob.md](build-summary/04-pr3-bug-cv-in-blob.md) |
| 5 | **PR #4 — Application cards horizontal** | 31–37 (`f8585bb` → `85667e7` + merge) | [05-pr4-application-cards-horizontal.md](build-summary/05-pr4-application-cards-horizontal.md) |
| 6 | **PR #5 — Fix view count** | 39–41 (`1824d5e`, `68f019e` + merge) | [06-pr5-fix-view-count.md](build-summary/06-pr5-fix-view-count.md) |
| 7 | **PR #6 — Improve view page UI** | 43–57 (`72d5f57` → `7803a0f` + merge) | [07-pr6-improve-view-page-ui.md](build-summary/07-pr6-improve-view-page-ui.md) |

Doc-only commits (BUILD_SUMMARY updates, update policy, etc.) are not given separate phase files: 25, 26, 30, 38, 42, 54, 55.

---

## Summary table

| #   | Commit    | Type     | Summary                                                        |
| --- | --------- | -------- | -------------------------------------------------------------- |
| 1   | `19a1111` | scaffold | Next.js app bootstrap                                          |
| 2   | `dcf670a` | docs     | README for project                                             |
| 3   | `9ddb9fa` | tooling  | CURSOR_PROMPT.md                                               |
| 4   | `604c19d` | feature  | MyHireView core: auth, admin, apply/view, APIs, DB            |
| 5   | `631252a` | chore    | Cursor commit message command                                  |
| 6   | `4005c55` | fix      | Edit page: normalize DB → form data                            |
| 7   | `927f0b3` | docs     | ARCHITECTURE.md                                                |
| 8   | `44f7dd6` | UX       | Dashboard + Sign out when signed in; logo → /                  |
| 9   | `cdc267f` | fix      | Sign out redirects to homepage                                 |
| 10  | `ee741d5` | refactor | PublicSiteHeader, AdminHeader                                  |
| 11  | `e9dfaec` | refactor | MarketingHeader, ApplicationPageHeader; route /view            |
| 12  | `3c52312` | chore    | App title MyHireView                                           |
| 13  | `0dfa1e3` | refactor | Hooks, API client, dashboard/landing components                |
| 14  | `4e1486b` | refactor | SignOutButton → components/auth                                |
| 15  | `5b034bf` | fix      | ViewTracker path alias                                         |
| 16  | `89e0dcb` | merge    | PR #1 mvp-refactor                                             |
| 17  | `f5d964a` | feature  | Basic profile page                                             |
| 18  | `354f649` | feature  | Profiles table + candidate snapshot on applications            |
| 19  | `1fbf4e6` | feature  | Candidate field toggles, form components, framer-motion        |
| 20  | `93929d9` | docs     | DATA_FLOW.md, USER_GUIDE.md                                    |
| 21  | `127efe9` | feature  | Name in slug: None / At start / At end                         |
| 22  | `21a78df` | fix      | Mermaid labels quoted for GitHub                               |
| 23  | `151667b` | fix      | Mermaid rectangle nodes for GitHub                             |
| 24  | `eac7494` | merge    | PR #2 create-profile-page                                      |
| 25  | `fe2826e` | docs     | BUILD_SUMMARY + link in README                                 |
| 26  | `3956b3a` | docs     | BUILD_SUMMARY update policy                                    |
| 27  | `c19c88e` | feature  | CV upload on save, blob delete, optional preview modal         |
| 28  | `a5da3f6` | fix      | Missing CV blob: existence check and retry UI                  |
| 29  | `20bf0e8` | merge    | PR #3 bug-cv-in-blob                                           |
| 30  | `a40e651` | docs     | BUILD_SUMMARY extended through PR #3                           |
| 31  | `f8585bb` | refactor | Horizontal ApplicationCard layout                              |
| 32  | `87c80a8` | UX       | Application card status: clock (unviewed), check (viewed)      |
| 33  | `e0b9ad2` | fix      | Exclude applicant from view count when viewing own application |
| 34  | `73b87c1` | feature  | CV download count tracking, insights (owner excluded)          |
| 35  | `88d0e20` | feature  | Last viewed tracking                                           |
| 36  | `85667e7` | refactor | InsightItem + responsive grid for application card insights    |
| 37  | `a00c745` | merge    | PR #4 update-application-cards-horizontal                      |
| 38  | `04822bf` | docs     | BUILD_SUMMARY through commit 37, unify list formatting         |
| 39  | `1824d5e` | fix      | View count via SECURITY DEFINER RPC, service_role admin client |
| 40  | `68f019e` | fix      | Download count via SECURITY DEFINER RPC for anon/non-owner     |
| 41  | `11a3a16` | merge    | PR #5 fix-view-count-does-not-update                           |
| 42  | `cd8b4b6` | docs     | BUILD_SUMMARY with latest commits                              |
| 43  | `72d5f57` | refactor | ViewPageContent, ViewTracker → components/view                 |
| 44  | `ee4019e` | UX       | ViewPageContent content max-w increased                        |
| 45  | `e7464da` | feature  | PDFViewer: View CV button, Download CV with count              |
| 46  | `21361ea` | feature  | CV download filename for recruiter downloads                  |
| 47  | `a525af6` | UX       | View header: profile image, ExternalLinkButton, responsive    |
| 48  | `5e2992b` | feature  | Profile picture with Supabase Storage, per-app visibility      |
| 49  | `f0cf24a` | feature  | Video pitch button and floating modal (Escape to close)        |
| 50  | `0c21272` | feature  | YouTube Shorts URLs and vertical embed                         |
| 51  | `105711a` | UX       | Watch Video Pitch button in job details section                |
| 52  | `0673bf3` | refactor | View page UI: ApplicationPageContent, VideoModal, styling      |
| 53  | `6036b44` | refactor | Remove application description field and DB column            |
| 54  | `3e3cbfa` | chore    | Revert BUILD_SUMMARY changes                                   |
| 55  | `41d034a` | chore    | Revert BUILD_SUMMARY changes                                   |
| 56  | `7803a0f` | feature  | View page footer for recruiters, viewer-status API             |
| 57  | `6c180ad` | merge    | PR #6 improve-view-page-ui                                     |

---

_Generated from the repository's git history; each section maps to one commit in chronological order._
