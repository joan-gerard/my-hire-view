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
| **Company**                 | Required text. Seeds the share link.                                                  | **Keep**   | Core. No debate.                                                                                                                                                               |
| **Role**                    | Required text. Seeds the share link.                                                  | **Keep**   | Core. No debate.                                                                                                                                                               |
| **Shareable link**          | Read-only full URL from `sm` up; path only on a narrow screen. Full-width result row. | **Keep**   | Candidates need to see the URL they will share, including the ending.                                                                                                          |
| **Checking… / link errors** | Live status while the ending is checked.                                              | **Keep**   | Required for trust when the ending is auto-built.                                                                                                                              |
| **Edit link**               | Was a toggle for order and ending.                                                    | **Remove** | Reversed the same day: order and ending stay visible on the share-link row.                                                                                                    |
| **How the link reads**      | Custom dropdown: **Company + Role** or **Role + Company**.                            | **Keep**   | An info icon beside the title opens that explanation in a dialog. **Company + Role** is the default. Revisit after username-in-URL work if the path already brands the person. |
| **Link ending**             | Manual slug edit.                                                                     | **Keep**   | Pre-filled. An info icon explains that each ending must be unique. Sits above the read-only URL.                                                                               |
| **Use the suggested link**  | Resets a manual ending.                                                               | **Keep**   | Cheap escape hatch once someone edits the ending.                                                                                                                              |

---

## About you

Product model today: values are a **snapshot on the application**. Each field can be edited for this role, and each has **Show / Hidden** so recruiters may not see it even if a value exists. The picture is profile-owned; the application only chooses show vs hide.

| Control                           | What it does today                           | Call         | Feedback                                                                                                                                                 |
| --------------------------------- | -------------------------------------------- | ------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Profile picture — show switch** | Whether this page shows the profile photo.   | **Keep**     | Legitimate per-application choice (e.g. hide photo for one employer). Compact switch under the preview; off dims the photo instead of removing it.       |
| **Add / Manage picture**          | Opens the profile picture modal from create. | **Simplify** | Convenient, but it mixes “this application” with “my account.” Prefer: if no picture, one link to Profile; if there is a picture, only Show / Hide here. |
| **First name** (value)            | Dense field on create/edit; required.        | **Simplify** | Profile-owned quick edit. Same control as Company/Role. Saving the application writes to the profile first; not a per-role override.                     |
| **First name — Show / Hidden**    | Can omit first name from `/view`.            | **Remove**   | A candidate page with no first name is odd and easy to set by accident. If the value exists, show it.                                                    |
| **Last name** (value)             | Dense field on create/edit; required.        | **Simplify** | Same as first name: profile-owned quick edit on create/edit.                                                                                             |
| **Last name — Show / Hidden**     | Can omit last name from `/view`.             | **Remove**   | Same as first name. Hiding surname alone is a rare privacy case; not worth a toggle on every create.                                                     |
| **Location** (value)              | Dense field on create/edit.                  | **Simplify** | Profile-owned quick edit; switch under the field when non-empty.                                                                                         |
| **Location — Show / Hidden**      | Omit location on this page.                  | **Keep**     | In-field eye / eye-off toggle when the value is non-empty (same placement idea as the shareable-link copy button).                                       |
| **Portfolio** (URL field)         | Dense URL field on create/edit.              | **Simplify** | Profile-owned quick edit + in-field eye toggle when non-empty. Soft warning if the URL looks like LinkedIn.                                              |
| **Portfolio — Show / Hidden**     | Omit portfolio on this page.                 | **Keep**     | In-field eye toggle; same pattern as location.                                                                                                           |
| **LinkedIn** (URL field)          | Dense URL field on create/edit.              | **Simplify** | Profile-owned quick edit + in-field eye toggle when non-empty. Soft warning if the URL does not look like LinkedIn.                                      |
| **LinkedIn — Show / Hidden**      | Omit LinkedIn on this page.                  | **Keep**     | In-field eye toggle; same pattern as location.                                                                                                           |

### About you — proposed shape (if we trim)

1. Picture: show switch (plus “Add on Profile” when missing).
2. First / last name: dense required fields; always shown; saved to the profile on application save.
3. Location / portfolio / LinkedIn: dense fields + in-field eye toggle when non-empty; saved to the profile on application save; application only stores shown values.

That keeps one source of truth (profile) while letting create/edit fix typos without a separate dialog.

---

## Résumé

| Control                                               | What it does today                             | Call                   | Feedback                                                                                                                                          |
| ----------------------------------------------------- | ---------------------------------------------- | ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Choose one résumé** (heading)                       | Frames library vs tailored.                    | **Keep**               | Clear job for the section.                                                                                                                        |
| **From your library** (list)                          | Pick a primary CV.                             | **Keep**               | Core product.                                                                                                                                     |
| **Manage library**                                    | Opens the primary CV modal.                    | **Keep**               | Needed so create does not dead-end when the library is empty.                                                                                     |
| **A PDF just for this role**                          | Tailored upload for this application.          | **Keep**               | Core differentiator vs a single static CV.                                                                                                        |
| **Choose a PDF** (file picker)                        | Selects the tailored file.                     | **Keep**               | Required when tailored is chosen.                                                                                                                 |
| **Recruiters download it as…**                        | Shows download filename.                       | **Simplify**           | Showing the name is fine. The next toggle is the question.                                                                                        |
| **Use a generated name / Use the original file name** | Switches `CV-{slug}.pdf` vs original filename. | **Park** or **Remove** | Most candidates will not care. Default to a clean generated name; put the original-filename choice behind an advanced link or drop it for launch. |

---

## Pitch

| Control         | What it does today           | Call     | Feedback                                                                    |
| --------------- | ---------------------------- | -------- | --------------------------------------------------------------------------- |
| **YouTube URL** | Required intro for the page. | **Keep** | Core. Required for save today; keep unless product changes the pitch model. |

---

## Page chrome and actions

| Control                  | What it does today                                | Call     | Feedback                                                                     |
| ------------------------ | ------------------------------------------------- | -------- | ---------------------------------------------------------------------------- |
| **Title / description**  | Explains the page.                                | **Keep** | Shorten copy if needed; do not remove.                                       |
| **Profile nudge**        | Tip when location/links/picture are empty.        | **Keep** | Points people to Profile, which supports the “own identity once” trim above. |
| **Cancel**               | Back to dashboard (leave confirm if draft dirty). | **Keep** | Standard escape.                                                             |
| **Save draft & preview** | Creates draft and opens preview when possible.    | **Keep** | Primary action.                                                              |
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
5. **Empty LinkedIn, portfolio, or location:** Dense fields on create/edit; saving the application writes them to the profile. The eye toggle appears once the field is non-empty.

---

## Suggested decision order

1. Agree on identity: names always shown; LinkedIn (and Portfolio?) profile-owned.
2. Agree on résumé: keep library + tailored; park download filename.
3. Leave Role + Pitch as they are.
4. Update [APPLICATION_FORM_WORKFLOW.md](APPLICATION_FORM_WORKFLOW.md) and the create UI in one pass once calls are marked Keep / Simplify / Remove above.
