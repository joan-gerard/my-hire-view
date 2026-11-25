# Create form field trim (`/admin/new`)

**Date:** 3 November 2026  
**Status:** Decided and implemented, 3 November 2026. The lean trim is the live create and edit form.  
**Scope:** Controls on create and edit. Role, pitch, and page actions stayed. About you and the résumé download name were trimmed.  
**Related:** [APPLICATION_FORM_WORKFLOW.md](APPLICATION_FORM_WORKFLOW.md), [ARCHITECTURE.md](../architecture/ARCHITECTURE.md) (profile snapshot on the application row).

## How to read this

| Call         | Meaning                                                                            |
| ------------ | ---------------------------------------------------------------------------------- |
| **Keep**     | Stays on create as it is (or with only copy/layout polish).                        |
| **Simplify** | Keep the idea; cut a control, a toggle, or the place where it is edited.           |
| **Remove**   | Drop from create (and likely from the product model later, unless noted).          |
| **Park**     | Useful for some people; hide behind a quieter control or defer until after launch. |

Each item is one thing the candidate can see or change: a field, a choice, a toggle, or an action.

---

## Role (company, role, share link)

| Control                     | What it does today                                                                    | Call       | Feedback                                                                                                                                                                       |
| --------------------------- | ------------------------------------------------------------------------------------- | ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Company**                 | Required text. Seeds the share link.                                                  | **Keep**   | Placeholder `e.g. Spotify`; autofocus on create.                                                                                                                                 |
| **Role**                    | Required text. Seeds the share link.                                                  | **Keep**   | Placeholder `e.g. Software Engineer`.                                                                                                                                            |
| **Your application link**   | Read-only full URL from `sm` up; path only on a narrow screen. Full-width result row under Company/Role. | **Keep**   | URL always previews. Copy only when live; otherwise a broken-link icon with tip (**Publish before sharing** / **Finish required fields…**, or earlier missing-id/ending tips). |
| **Checking… / link errors** | Live status while the ending is checked.                                              | **Keep**   | Result field end control: spinner while checking; danger icon when invalid/taken (replaces copy). Customize gets a trailing danger icon; invalid/taken does **not** auto-expand. Ending row shows Checking… / messages when open. |
| **Customize link**          | Expands How the link reads + Link ending. Collapsed by default.                       | **Keep**   | Replaces the always-visible advanced rows. Opens by default when ending/order is already customized (edit or restored draft). Hide link options collapses again. Invalid/taken ending shows a danger icon after the label (label stays ink-colored). |
| **How the link reads**      | Custom dropdown: **Company + Role** or **Role + Company**.                            | **Park**   | Behind Customize link. Info icon still explains the choice. **Company + Role** is the default.                                                                        |
| **Link ending**             | Manual slug edit.                                                                     | **Park**   | Behind Customize link. Pre-filled; info icon for uniqueness.                                                                                                          |
| **Use the suggested link**  | Resets a manual ending.                                                               | **Keep**   | Cheap escape hatch once someone edits the ending (visible when Customize is open).                                                                                    |

---

## About you

**Shipped model:** values come from the **profile** (read-only on create/edit). The application only chooses **show / hide** and stores a **snapshot** of what this page shows. Change identity on **Profile** (**Edit profile**). Soft URL warnings live on Profile, not here.

| Control                           | What it does                                 | Call         | Feedback                                                                                                                                                 |
| --------------------------------- | -------------------------------------------- | ------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Profile picture — Visible/Hidden** | Whether this page shows the profile photo. | **Keep**     | Same VisibilityToggle as contact fields: **Visible** / **Hidden** label + switch under the preview; off dims the photo (neutral grey, not warning pink). |
| **Add / Manage picture**          | Opens the profile picture modal from create. | **Simplify** | Done: if no picture, link to Profile; if there is a picture, only Show / Hide here.                                                                     |
| **First name** (value)            | Read-only from profile; required to publish. | **Keep**     | Edit on Profile. Always shown when present.                                                                                                              |
| **First name — Show / Hidden**    | Can omit first name from `/view`.            | **Remove**   | A candidate page with no first name is odd and easy to set by accident. If the value exists, show it.                                                    |
| **Last name** (value)             | Read-only from profile; required to publish. | **Keep**     | Same as first name.                                                                                                                                      |
| **Last name — Show / Hidden**     | Can omit last name from `/view`.             | **Remove**   | Same as first name.                                                                                                                                      |
| **Location** (value)              | Read-only from profile.                      | **Keep**     | Empty points to Profile.                                                                                                                                 |
| **Location — Visible / Hidden**   | Omit location on this page.                  | **Keep**     | VisibilityToggle under the value when non-empty (neutral grey when Hidden).                                                                              |
| **Portfolio** (URL field)         | Read-only from profile.                      | **Keep**     | Empty points to Profile; URL soft warnings stay on Profile.                                                                                              |
| **Portfolio — Visible / Hidden**  | Omit portfolio on this page.                 | **Keep**     | Same VisibilityToggle as location.                                                                                                                       |
| **LinkedIn** (URL field)          | Read-only from profile (before Portfolio).   | **Keep**     | Empty points to Profile; URL soft warnings stay on Profile.                                                                                              |
| **LinkedIn — Visible / Hidden**   | Omit LinkedIn on this page.                  | **Keep**     | Same VisibilityToggle as location.                                                                                                                       |
| **Email** (value)                 | Read-only from profile (editable on Profile). | **Keep**    | Profile email is prefilled from the account email; empty points to Profile.                                                                              |
| **Email — Visible / Hidden**      | Omit email on this page.                     | **Keep**     | VisibilityToggle; create defaults from profile `default_show_email`.                                                                                     |
| **Phone** (value)                 | Read-only from profile.                      | **Keep**     | Empty points to Profile.                                                                                                                                 |
| **Phone — Visible / Hidden**      | Omit phone on this page.                     | **Keep**     | VisibilityToggle; create defaults from profile `default_show_phone`.                                                                                     |

### About you — shipped shape

1. Expanded header: short note (**Choose what this page shows from your profile**) with **Edit profile** (and **Hide details** when collapse applies) on the right; saving the application does not PUT the profile.
2. **Repeat create / edit:** after the first **live (active)** application, About you collapses to one summary line (`Showing photo, name, portfolio`) with **Edit** to expand and **Hide details** to collapse again — when Preferences **Collapse About you after your first live application** is on (default). Drafts alone do not collapse it; turning the preference off keeps About you fully expanded.
3. First / last name: read-only; always shown when present; required to publish (before Picture); slightly stronger field fill than show/hide rows.
4. Picture: VisibilityToggle (Visible / Hidden) under the preview (plus “Add on Profile” when missing).
5. Email / Phone / Location / LinkedIn / Portfolio: read-only + VisibilityToggle when non-empty; application only stores shown values. Profile sets default show prefs for new applications.


---

## Résumé

| Control                                               | What it does today                             | Call                   | Feedback                                                                                                                                          |
| ----------------------------------------------------- | ---------------------------------------------- | ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Résumé** (one source row)                           | Radios: Use library CV / Upload one for this role. | **Keep**           | Single row; hint that upload overrides library on this page only. Filename truncates with ellipsis + **Preview**.                                 |
| **Use library CV**                                    | Pick a primary CV from the library.                | **Keep**           | Core product.                                                                                                                                     |
| **Manage library**                                    | Opens the primary CV modal.                        | **Keep**           | Needed so create does not dead-end when the library is empty.                                                                                     |
| **Upload one for this role**                          | Tailored upload for this application.              | **Keep**           | Core differentiator; copy makes the override explicit.                                                                                            |
| **Choose a PDF** (file picker)                        | Selects the tailored file.                         | **Keep**           | Opens the PDF dialog; the tailored radio does not. Required before publish when tailored is chosen.                                              |
| **Recruiters download it as…**                        | Shows download filename at the bottom of Your Résumé (result row). | **Keep** | Same pattern as Your application link; truncates with ellipsis. Default `{First}-{Last}-{Slug}.pdf` with muted placeholders. |
| **Original name** switch                              | Switches generated name vs original filename.      | **Keep**           | Compact switch on the download-name row; default off (generated).                                                                                 |

---

## Pitch

| Control         | What it does today           | Call     | Feedback                                                                    |
| --------------- | ---------------------------- | -------- | --------------------------------------------------------------------------- |
| **YouTube URL** | Intro for the page. | **Keep** | Required at **publish** / live save; optional on draft (`F40-124`). After parse: full-width playable preview + title; error if private / not embeddable; note that unlisted works; reuse from earlier applications. |

---

## Page chrome and actions

| Control                  | What it does today                                | Call     | Feedback                                                                     |
| ------------------------ | ------------------------------------------------- | -------- | ---------------------------------------------------------------------------- |
| **Title / description**  | Explains the page.                                | **Keep** | Shorten copy if needed; do not remove.                                       |
| **Profile nudge**        | Tip when location/links/picture are empty.        | **Keep** | Points people to Profile, which supports the “own identity once” trim above. |
| **Cancel**               | Back to dashboard (leave confirm if draft dirty). | **Keep** | Standard escape.                                                             |
| **Save Draft** | Creates draft and opens that draft’s edit page.    | **Keep** | Primary action.                                                              |
| **Blocked reason line**  | Names missing required pieces.                    | **Keep** | Replaces the old checklist gaps.                                             |
| **Enter does not save**  | Prevents accidental submit from inputs.           | **Keep** | Behavior, not a field. Keep.                                                 |
| **Leave confirm**        | Discard browser draft on navigate away.           | **Keep** | Not a form field; keep the safety.                                           |

---

## Scoreboard (create surface)

Rough count of what the candidate currently manages on create:

| Area        | Today                                                        | Lean trim                                                                              |
| ----------- | ------------------------------------------------------------ | -------------------------------------------------------------------------------------- |
| Role fields | Company, Role, order, ending, reset, then the read-only link | Same; order and ending stay visible                                                    |
| About you   | Picture show/hide + manage, 5 values, 5 Show/Hidden          | Picture show/hide; names always on; 3 show toggles; LinkedIn/Portfolio URLs off create |
| Résumé      | Library pick, tailored, manage library, download-name toggle | Drop or park download-name toggle                                                      |
| Pitch       | YouTube URL                                                  | Keep                                                                                   |
| Actions     | Cancel, Save, blocked reason                                 | Keep                                                                                   |

Largest wins: **remove name Show/Hidden**, **stop re-entering LinkedIn (and likely Portfolio) on create**, **park the CV download-name toggle**.

---

## Open questions

1. **Names — decided lean:** Do **not** customise first/last name on applications. Signup collects them; Profile is the only place to change them. The application still stores a snapshot at save (so `/view` does not join live profile), but the form does not offer a per-role override. Rare cases (legal vs preferred name per employer) are not enough to keep editors on every create.
2. **Should location text stay overridable per role?** Closed for now: profile-owned dense field on create/edit; no per-role override. Revisit only if people need a different city per role.
3. **Is “hide last name only” a real requirement?** If yes, it belongs in Profile or a rare privacy setting, not toggles on every application.
4. **Edit page:** Apply the same name rule so create and edit do not teach two models.
5. **Empty LinkedIn, portfolio, or location:** Dense fields on create/edit; saving the application writes them to the profile. The **Visible** / **Hidden** switch appears once the field is non-empty.

---

## Suggested decision order

1. Agree on identity: names always shown; LinkedIn (and Portfolio?) profile-owned.
2. Agree on résumé: keep library + tailored; park download filename.
3. Leave Role + Pitch as they are.
4. Update [APPLICATION_FORM_WORKFLOW.md](APPLICATION_FORM_WORKFLOW.md) and the create UI in one pass once calls are marked Keep / Simplify / Remove above.
