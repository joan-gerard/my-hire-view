# Review: one-page create form feedback

Reviewed 60 comments on branch `spike-one-page-create-form` against the code and the docs. Nothing here was taken on trust.

After merging comments that describe the same problem:

| | Count |
| --- | ---: |
| Valid issues | 28 |
| Invalid issues | 11 |
| Unclear | 0 |

The 28 valid issues come from 48 comments. The 11 invalid issues cover the other 12 comments. None of those need a fix on this spike.

**How to cite issues**

- Valid issues use `V01`–`V28`.
- Invalid issues use `I01`–`I11`.

**How to read severity**

- **High.** People hit this in normal use. It blocks a main action, or it shows contact the person meant to hide.
- **Medium.** Real, on a specific path, or it makes the page slower or confusing.
- **Low.** Wording, polish, or a rare edge.

**How to read effort**

- **Small.** A focused change.
- **Medium.** More than one screen, or a new way to load data.
- **Large.** A redesign. None of these are large.

One issue is high: `V02`.

---

## Publishing and preview

### V01 — Preview had a dead footer (Back to form / Publish)

**Severity:** Low. **Effort:** Small.
**Status:** Done.

**Product decision:** Preview is look-only. Close with the **X** (or Escape / backdrop). Publish stays on the form bar only. **Back to form** is not needed.

What the feedback reported: Preview defined bottom buttons (**Back to form** and **Publish**), but the shared popup hid the whole bottom bar when the header **X** was on. So those buttons never appeared.

Cleanup done: removed the unused Preview footer and the Publish-from-preview props. Behavior docs and manual checks that mentioned publish-from-preview were updated to match.

### V02 — Dashboard treats every draft as missing a way to be reached

**Severity:** High. **Effort:** Small.
**Status:** Done.

A draft can be published from its card only when every publish requirement is present. One requirement is a visible email, phone, or LinkedIn link. The dashboard list was not loading those three fields, so every draft looked like it had no contact method.

**Fix:** the list query and the card type now include email, phone, and LinkedIn. A finished draft can publish from its card. A draft that really has no contact method still stays blocked.

### V03 — Saving a live page re-checks the full publish set

**Severity:** Medium. **Effort:** Small.
**Status:** In Progress.

Any save of a page that is already live runs the full publish checklist. That includes a save that only changes something like the picture switch. Pages that went live before these checks existed can fail the new contact or name rules.

If we leave it, a small edit on an older live page is rejected until every publish field is filled. Newer complete pages are unaffected.

Run this check when the save is what makes the page live, or when the save changes a field the checklist cares about. If we want every live save to stay strict, say that in the product note and leave the code.

---

## Contact and what gets shown

### V04 — A switch that reads Hidden can still be saved as shown

**Severity:** Medium. **Effort:** Small.
**Status:** In Progress.

On Profile, the Visible / Hidden switch under a field is forced to Hidden when that field is treated as empty or not good enough to show. The saved setting is a separate on/off value, and it is not updated to match the switch.

Two cases:

- If the email box is empty, the switch says Hidden and cannot be changed. Save can still store “show email.” A new application then fills in the sign-in email, because an empty profile email falls back to the account address. The form usually prefills that address, so this shows up when the box has been cleared.
- If LinkedIn or Portfolio has text that fails the “good link” check, the switch says Hidden. Save can still store “show this link.” A new application includes the link anyway.

If we leave it, a person who sees Hidden can still publish that contact on the next application.

When the switch is forced to Hidden, save the off value. For email, decide the switch from the same address the application will use, including the sign-in email when the profile email is empty.

### V05 — A create request that leaves email or phone out ignores the hide setting

**Severity:** Medium. **Effort:** Small.
**Status:** In Progress.

If a create request does not include email, the server stores the profile email or the sign-in email. It does not look at “show email by default.” The same pattern stores the phone number when phone is left out. Whatever is stored is what the public page can show.

The form people actually use does send email and phone. When the switch is off, it sends an empty value, and the server keeps that empty value. This hole is for a request that omits the field.

If we leave it, a caller that skips the field can put a hidden address on the public page.

When the field is omitted, copy it only if the profile default says to show it.

### V06 — An untouched new application can look like unfinished work

**Severity:** Medium. **Effort:** Small.
**Status:** In Progress.

The browser draft treats “this switch differs from the default” as progress. For email and phone, that default is “on if the box has text.” The form’s real default comes from Profile (“show email / phone on new applications”), which can be off while the box still has text.

If we leave it, a person who turned those defaults off gets a restore prompt and a “leave this page?” prompt on a form they have not touched.

Judge those two switches against the defaults the form was given, or ignore them when deciding the form is still blank.

### V07 — The profile nudge never appears once a profile exists

**Severity:** Low. **Effort:** Small.
**Status:** In Progress.

The banner that asks for location, links, or a picture also requires “no email” and “no phone.” Signed-in people always have a sign-in email, so that “no email” check never passes. The banner only appears when there is no profile row at all.

If we leave it, someone with a saved profile and no location, links, or picture never sees the prompt the banner was written for.

Drop the email and phone checks. Base the email check on the profile email only if we still want one.

---

## Résumé

### V08 — Choosing a library résumé can skip the replace warning

**Severity:** Medium. **Effort:** Small.
**Status:** In Progress.

Switching from “upload one for this role” to “use a library résumé” asks before replacing a saved tailored file. Picking a résumé inside Manage library does not. It changes the source immediately. That path is open when Manage library is available before the switch, including when the library is empty and the person uploads and then selects a file.

If we leave it, saving later can delete that application’s tailored file without the warning.

Run the same confirmation before a library selection changes the source away from a saved tailored résumé.

### V09 — Delete warning says “Résumé missing”; the dashboard says “CV missing”

**Severity:** Low. **Effort:** Small.
**Status:** In Progress.

The delete confirmation tells the person that affected applications will show “Résumé missing.” The badge on the dashboard still says “CV missing.” A later copy pass already lists the dashboard wording as unfinished.

If we leave it, the warning names a label the person will not see.

Use “CV missing” in the warning until the dashboard label changes, or change both together.

### V10 — A missing file still says the saved PDF is in use

**Severity:** Low. **Effort:** Small.
**Status:** In Progress.

When a saved résumé is gone from storage, the status line still says “Using the saved PDF for this role.” A warning under it says the file is not in storage.

If we leave it, the two lines disagree. Someone can think the file is fine.

Show a different status, or none, when the saved file is confirmed missing.

### V11 — Preview loads the résumé file while the window is closed

**Severity:** Medium. **Effort:** Small.
**Status:** In Progress.

The preview window always builds its contents, including when it is closed. The résumé viewer then loads the PDF as soon as the form opens.

If we leave it, every create and edit pays for a PDF load the person has not asked for. On a slow connection that is a delay and extra data use.

Build the preview body only while the window is open.

### V12 — Try again in preview does nothing

**Severity:** Low. **Effort:** Small.
**Status:** In Progress.

If the saved résumé is missing, the preview offers Try again. That action is an empty function. Nothing reloads.

If we leave it, Try again looks broken.

Hide Try again in this preview, or make it re-check the file.

### V13 — The download name drops letters outside basic Latin

**Severity:** Medium. **Effort:** Small.
**Status:** In Progress.

The generated file name keeps only English letters and digits. Names in Cyrillic, Chinese, Japanese, Korean, and letters such as ø, ł, or đ are stripped. A name with no basic Latin letters disappears from the preview and from the download name.

If we leave it, those candidates get a file name that is not theirs.

Keep letters and digits from any writing system.

### V14 — A first name alone looks like a finished download name

**Severity:** Low. **Effort:** Small.
**Status:** In Progress.

The preview is supposed to show a placeholder for a missing part, such as Last. If only a first name is present, the preview uses that name as the whole name and treats the name as complete. The “still incomplete” hint stays off. Example shape: `Joan-Spotify-Software-Engineer.pdf`, with no Last.

If we leave it, a missing last name is easy to miss before publish.

Fill first name and last name separately, and keep the placeholder for whichever one is missing.

### V15 — A newly chosen PDF preview can break while developing

**Severity:** Low. **Effort:** Small.
**Status:** In Progress.

The temporary link to a file chosen on this computer is created while the screen is drawing, and cleared when the screen updates. In development, React draws twice on purpose. The second draw can point Preview at a link that was already cleared.

If we leave it, Preview of a just-chosen PDF fails in local development. A normal production visit is much less likely to hit this.

Create and clear that link in one update step, and keep it in state.

---

## Video

### V16 — A temporary YouTube check failure blocks save

**Severity:** Medium. **Effort:** Small.
**Status:** In Progress.

A video that is private or cannot be embedded is a real block, and save should wait. A failed check for another reason (the service is down, the request is rate-limited, or the session expired) is reported the same way. Save and draft save stay blocked until the person retypes the link. There is no retry.

If we leave it, a short outage looks like a bad video and stops a draft that was otherwise fine.

Treat those temporary failures as “could not check,” and let the person retry. Keep the hard block for a video YouTube itself rejects.

### V17 — Reusing an earlier video loads the full application list

**Severity:** Medium. **Effort:** Medium.
**Status:** In Progress.

The “reuse a video” list asks for up to 50 applications. That list endpoint also checks whether each résumé file still exists in storage. The video list only needs the old video links.

If we leave it, opening create or edit can trigger up to 50 storage checks that the video field does not use. That is slower and costs more as the account grows.

Load prior video links from a lighter request that does not check résumé files.

### V18 — A link that is not YouTube can pass the video check

**Severity:** Low. **Effort:** Small.
**Status:** In Progress.

The video check looks for the text `youtube.com/watch` (and a few other YouTube shapes) anywhere in the link. It does not check that the site is actually YouTube. A different site that contains that text can be accepted, and the form then treats the extracted clip id as a YouTube video.

If we leave it, a non-YouTube link can be saved as the pitch.

Accept the link only when the site is YouTube or the YouTube short domain.

---

## Saving, leaving, and profile safety

### V19 — A failed profile read can wipe saved contact settings

**Severity:** Medium. **Effort:** Small.
**Status:** In Progress.

Saving a profile first reads the current row. If that read fails, the error is ignored. Missing fields are then filled with empty values or “show by default,” and the save writes those over the real row. A missing profile (a new account) looks the same as a failed read.

If we leave it, a blip while loading the profile can clear a saved phone, contact email, and the show/hide settings.

If the read fails for a reason other than “no profile yet,” stop and show an error. Do not save.

### V20 — The loading shell is too short, so the page jumps

**Severity:** Low. **Effort:** Small.
**Status:** In Progress.

The note on the loading shell says it should be tall enough that the scrollbar does not appear and disappear. The create and edit shell no longer sets that minimum height. The dashboard shell still does.

If we leave it, opening New application or Edit can shift the page when the real form arrives.

Restore the tall shell, or change the note if the short shell is the choice.

---

## Keyboard and screen readers

### V21 — Deleting a library résumé drops the keyboard user

**Severity:** Medium. **Effort:** Small.
**Status:** In Progress.

In Manage library, Delete closes the row menu and shows a confirm box under the row. Focus is not moved into that box, or back to the row. The menu item that had focus is gone.

If we leave it, keyboard and screen-reader users lose their place and may not hear the confirm.

Move focus into the confirm when it appears. On cancel, return focus to the row.

### V22 — The link-order menu does not keep keyboard users oriented

**Severity:** Medium. **Effort:** Small.
**Status:** In Progress.

This covers both comments on the Company + Role menu.

Choosing an option removes the option that had focus and does not return focus to the menu button. Arrow keys move a highlight only. The screen reader is not told which option Enter will choose.

If we leave it, keyboard users tab into an unexpected place, and screen-reader users cannot tell which order they are about to pick.

Return focus to the button after a choice. Expose the highlighted option to assistive technology, or move real focus through the options.

### V23 — Name fields are hard to reach and hard to name

**Severity:** Medium. **Effort:** Small.
**Status:** In Progress.

This covers both comments on the read-only name rows.

“To publish, add…” is supposed to scroll to the missing field and focus it. For first or last name, the empty message has no id, and the filled value is not focusable. Focus finds nothing.

The filled value is also a plain box with a name attached in a way screen readers are told to ignore. The row label points at that box, which cannot be labelled that way, so the field name and the value are not read as one field.

If we leave it, a missing name in the publish list does not move keyboard focus, and a screen reader may not announce “First name” with the value.

Give the empty message an id and make it focusable without adding it to the tab order. Do the same for the filled value, and give that value a role so its name is allowed.

### V24 — Buttons sit inside field labels

**Severity:** Medium. **Effort:** Small.
**Status:** In Progress.

This covers the status dot and the résumé controls.

The status dot (Ready, Not ready yet, and similar) is a button inside the field’s label. The résumé choices do the same with Manage library and the file controls. A label is supposed to name one field. Buttons inside it are invalid, and the button text becomes part of the field’s spoken name.

If we leave it, screen readers announce the status or the button as part of the field name. Activating the label can also hit the wrong control.

Place the status dot and those buttons beside the label, outside it.

### V25 — The file picker is announced twice

**Severity:** Low. **Effort:** Small.
**Status:** In Progress.

The hidden file input and the visible Choose button share one name. The hidden input is still exposed to screen readers.

If we leave it, the person hears two controls with the same name.

Hide the file input from assistive technology and keep the visible button.

---

## Small visual mismatch

### V26 — Publish is a different shape from Save and Preview

**Severity:** Low. **Effort:** Small.
**Status:** In Progress.

Save and Preview use the rounded button shape. Publish does not set a shape, so it uses the pill shape that primary buttons get by default.

If we leave it, the three actions in one bar do not match.

Give Publish the same rounded shape as the other two.

### V27 — A phone number with no digits is a dead call link

**Severity:** Low. **Effort:** Small.
**Status:** In Progress.

A phone value is turned into a `tel:` link by stripping everything that is not a digit or a plus sign. A value such as “N/A” becomes a link with no number.

If we leave it, the public page shows a call link that goes nowhere.

Show a call link only when a digit remains. Otherwise show the text as plain text.

---

## Written guides

### V28 — Guides and checklists disagree with the live form

**Severity:** Low. **Effort:** Medium.
**Status:** In Progress.

Seventeen comments point at the same kind of problem: a written source describes an older form, or two parts of one doc disagree. None of these change what the app does today. They do send a tester or a later reader down the wrong path.

If we leave them, manual tests fail for the wrong reason, and planning notes still count shipped work as open.

Bring each line in line with the live form. The mismatches:

| Where | What it says now | What is true |
| --- | --- | --- |
| Create/edit test script, résumé section | Publish without the full set fails with an error list | Publish stays disabled and shows **To publish, add…** |
| Form history note | Publishing from create is still future work, and the checklist below says create already publishes to the share page | Create already has Publish. The two lines should match |
| Workflow guide, create | Names are not starred on a draft, and the About you section says the name fields carry a red star | The star shows when editing a live page |
| Workflow guide, edit | Leaving an edit does not ask you to confirm | Unsaved edits do ask. Only the browser-saved draft is limited to create |
| Architecture route list | Create is a four-chapter checklist. Edit is five bands | Both are one page of section cards |
| Architecture decision table | The snapshot is name, location, portfolio, and LinkedIn | Email and phone are snapshotted too. The data section already says so |
| Résumé library test script | Delete copy and empty-library buttons do not match the screen | Unused delete says “Delete this library résumé? This cannot be undone.” Empty library uses **Manage library** and **Upload one to your library** on create and on edit |
| Field-trim note | The résumé table keeps the Original name switch. The summary says it was parked or removed. Open questions still read as undecided, and one still says a save writes back to the profile | The switch is on the form. Saves store a snapshot on the application. Profile is where those values are edited |
| API notes | Company, role, and link ending are “required for draft.” A picture-only save from New application can create the profile | Those three are required on every create. Pictures are changed on Profile |
| Before-launch plan | The paragraph says two groups are shipped. The open-count table still includes them | One of those stories should win, and the count should follow |
| Profile test script | Picture control is Show / Hide. The button is Save picture | The control is Visible / Hidden. The button is Save profile |
| Database note on the email column | The email is described as depending on a toggle that was removed | It is an editable email, filled from the sign-in address when empty |

---

## Invalid

These comments do not need a fix on this spike.

**I01 — Saved-identity helper drops profile fields.** The helper would drop contact and show/hide fields if something called it. Nothing in the app calls it, so no profile data is dropped.

**I02 — Unused stacked layout for About you.** The only screen that uses this section asks for the row layout. The other layout is unused code. People never see it.

**I03 — Email check is copied in two files.** The two checks match. Combining them is tidy and does not change what is accepted.

**I04 — Row alignment setting does nothing.** The layout ignores it on purpose. Labels sit at the top of the row. The setting is leftover from an older layout.

**I05 — Unused eye icons.** Nothing uses these icons. The password field has its own icon. Removing the extras is cleanup.

**I06 — Step-list copy is unused.** The wizard that read those titles is gone. Error mapping still uses the step ids. The title edits do not appear anywhere.

**I07 — Save Draft in the leave dialog is treated as cancel.** A successful save-and-leave does run the stay handler afterwards, because the dialog never marks that action as confirmed. The leave is already committed before that handler runs. The handler only clears the pending leave. It does not bring the person back. A failed save leaves the dialog open, which is what we want.

**I08 — Suggested extra tests.** One asks for a preview case where the résumé link is set and the file is missing. Another asks for more publish-checklist cases (library résumé, company, role, link). The product paths exist. The gap is test coverage, which this spike does not need in order to judge the form.

**I09 — Backlog numbers collide.** Pinning favourite applications reuses number 130, which the résumé-wording ticket also uses. That is a planning-id clash. It does not change this form.

**I10 — User guide mentions an internal ticket.** The account-settings note names the résumé-wording ticket. That guide is an internal doc. The tab label it describes is accurate.

**I11 — Database type list omits the collapse preference.** The new preference column is missing from the generated-style database types. The app reads and saves it through the profile type, and the preference works. Updating the type list does not change what people see.

---

## Unclear

None. Every comment could be checked against the code or the docs.
