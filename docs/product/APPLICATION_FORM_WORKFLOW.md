# Application form workflow

Create is `/admin/new`. Edit is `/admin/edit/[id]`. They share the same fields and CV model. Only create keeps a browser draft. **Saving a draft** needs company, role, and a ready share link (the ending is auto-filled from company + role). Résumé, YouTube, and names can wait. **Publishing** (and saving an already-live app) needs the full set: company, role, share link, names, résumé, and YouTube intro.

## Create

`/admin/new` is one form no wider than `2xl`. The title and a short description sit at the top, above the sections. Sections are **Your link**, **About you**, **Your résumé**, and **Your pitch**. Each section name sits above its own card. Inside the card, every entry has its title on the left and the control on the right. A short description, when there is one, sits under that title. On a narrow screen the title sits above the control. A red asterisk marks fields required to **save** (Company, Role on create/draft; the full set on a live edit). Résumé, YouTube, and names are needed to **publish**, not to save a draft — they are not starred on create/draft. The intro states both bars: company and role to save a draft; résumé and video to publish. **Cancel** returns to the dashboard. **Save Draft** sits in a fixed bar at the bottom of the viewport so it stays in view while you scroll. It stays greyed out until company, role, and the share link are ready. A line above the buttons names what is still missing for the draft; another line lists publish gaps (**To publish, add…**); each item scrolls to its field. **Publish** is always visible on create/draft (disabled until ready) so people learn what publishing needs; **Preview** appears once the full set is ready and opens an in-form recruiter preview (look-only — close with the X). Footer **Publish** goes live and opens the share page. Preview itself does not save, publish, or count a view. Pressing Enter in a field does not save. A successful draft save opens `/admin/edit/[id]`.

**Your link** defaults to **Company**, **Role**, and **Your application link** (result + copy), then **Customize link**. The link updates live from company and role. **Customize link** expands **How the link reads** and **Link ending**; **Hide link options** collapses them again. Customize opens by default when the ending or segment order is already customized (edit, or a restored create draft). A taken or invalid ending stays collapsed and shows a danger icon after **Customize link** / **Hide link options** (the label stays ink-colored) plus a danger icon in the result field’s end control; opening Customize shows the detail on the ending row. On the result field, the copy control becomes a spinner while checking and a danger icon when invalid or taken. **How the link reads** is a custom dropdown, **Company + Role** (the default) or **Role + Company**, with an info dialog. **Link ending** is pre-filled with an info dialog and **Use the suggested link** after a manual edit. **Your application link** is a full-width tinted result under Company/Role: full URL from `sm` up (path on a narrow screen). The URL always previews what you are building. **Copy** is enabled only on a live application; on create and draft edit a broken-link icon replaces Copy, with **Publish before sharing this link** when Publish is ready, or **Finish required fields before publishing and sharing** otherwise (or an earlier tip if the profile id or ending is still missing).

Under **About you**: when expanded, a short line says **Choose what this page shows from your profile**, with **Edit profile** and (when collapse mode applies) **Hide details** on the right. **After the first live (active) application**, About you collapses to one line (e.g. **Showing photo, name, portfolio**) with **Edit** on the right — drafts alone do not collapse it. Account settings → **Preferences** → **Collapse About you after your first live application** (default on) turns that summary mode off if you prefer the full section every time. First and last name are required to publish (red asterisk on those fields). Expanded order: **First name**, **Last name**, then **Picture**, then **Location**, **LinkedIn**, and **Portfolio**. Names and the other text fields are read-only. Names are always shown when present and use a slightly stronger field fill so they read apart from the show/hide rows. The picture row always shows a preview (photo or initials); when a picture exists, a **Visible** / **Hidden** switch under it chooses whether this page shows it (off dims the photo); when it does not, the row links to Profile. Email, Phone, Location, LinkedIn, and Portfolio use the same **Visible** / **Hidden** switch when non-empty (neutral grey when Hidden, not warning pink); empty fields say to add them on Profile. Saving the application snapshots the shown values onto this page — it does not write back to the profile. Status dots: **Your link** grey until valid, then green; **How the link reads** always green; **About you** green with “From your profile” when a value exists, grey when empty; **Picture** green when a photo exists; **Your résumé** / **Your pitch** as before.

**Your résumé** is one source row plus a result row. Radios: **Use library résumé** (create default for Free, including an empty library) or **Upload one for this role** (**Pro**; one helper — replaces the library résumé on this application only). Empty library shows **No résumés…** + **Manage library** under the library option. Product copy says **résumé**, not CV. Selecting the tailored radio only switches mode — it does not open a dialog. The selected filename truncates with an ellipsis and a **Preview** link; **Manage library** / **Choose a PDF** (or **Manage**) open the existing modals (**Résumé library**). Once a file is chosen, **Recruiters download it as** sits at the bottom (like Your application link) with the generated name by default and an **Original name** switch; that filename also truncates with an ellipsis.

Leaving create from the header or with the browser Back button still asks before discarding the browser draft. A successful save clears that draft. A failed save keeps it.

## Edit

`/admin/edit/[id]` uses the **same one-page layout** as create: title and description at the top, then **Your link**, **About you**, **Your résumé**, and **Your pitch**. The title is **Edit application**. Submit is **Save Draft** while the application is still a draft, and **Save application** once it is live. Save stays in the same fixed bottom bar as create. It stays greyed out with **No changes to save.** (plain text, not a link) until something differs from the last successful save. Missing required fields still appear as scroll-to-field links. A successful draft/live save stays on the edit page. While the application is still a draft, **Publish** stays beside Save Draft (disabled with a **To publish, add…** line until ready); **Preview** joins it once the full set is ready. **Preview** opens the in-form recruiter preview (look-only — close with the X); footer **Publish** goes live immediately. Live apps do not show Preview/Publish on the form. Draft save and live/publish completeness follow the same F40 rules as create. A saved share link stays put when company or role change, until you edit the ending or choose **Use the suggested link**. There is no browser localStorage draft and no leave-confirm on edit.

The comparison wizard routes, form demo, wizard layout, and scrolling split-edit shell are gone. Create and edit share `ApplicationFormSinglePageLayout`. Older sections below keep the wizard journey as history only.

This is the behavior reference. The decision record is in [APPLICATION_FORM_STEPS_F35.md](../retrospectives/APPLICATION_FORM_STEPS_F35.md). Candidate-facing steps are in [USER_GUIDE.md](../engineering/USER_GUIDE.md).

---

## The journey in one pass (historical — wizard)

This described the removed wizard, not the live create page.

1. **Role & share URL** — who the application is for, and the link recruiters will use.
2. **About you** — which profile details appear on that link. Nothing here is required.
3. **CV** — a résumé from the library, or a PDF just for this role.
4. **Video** — a YouTube intro.
5. **Review & save** — read the summary, preview the recruiter page, then save.

On a wide screen the steps sit in a left rail that stays under the header while the fields scroll. On a phone or tablet, a progress strip stays under the header and the steps scroll sideways as short labels: Role, You, CV, Video, Save.

**Continue** (with a right arrow) moves forward. It stays quiet until that step is ready, and hovering or focusing it explains why. **Back** (with a left arrow) goes to the previous step. Pressing Enter in a field does not save. Save exists only on the last step. Leave the form from the header or with the browser Back button. On create, those exits still ask before discarding the browser draft.

After you move to a new step, focus lands on that step’s heading.

---

## How a step looks

A step is always in one of these states. If you are looking at a step, that wins: the pill is black even when the step is also done.

| What you see                            | Meaning                                                    |
| --------------------------------------- | ---------------------------------------------------------- |
| **Black pill**, white text              | The step you are on. No green fill and no green outline.   |
| **Check** inside the black pill         | You are on a step that already counts as done.             |
| **Green pill** and a **check**          | A step you are not on, and it counts as done.              |
| **Number**, normal text, clickable      | You can open it, and it is not done yet.                   |
| **Number**, quieter text, not clickable | Create only. You have not reached this step with Continue. |

The line under **Application progress** says **N of M complete**. N is how many steps have a check, including the one you are on if its marker is a check. Clicking around does not move the bar. Only gaining or losing a check does.

---

## Create

You start on Role. Later steps are locked until Continue reaches them.

Continue does two things: it opens the next step, and it remembers how far you have come. Going back does not lock those steps again, and it does not remove a check from a step you have already passed. A check does drop if that step stops being ready — for example you delete the company name, the CV, or the YouTube link. Put the required value back and the check returns, without another Continue.

About you has no required fields, so passing it is enough for its check.

**Save Draft** saves a **draft** and opens that application’s edit page. Recruiters cannot open it yet. **Publish** (when the full set is ready) creates the application as live and opens the share page. Dashboard and owner-preview Publish remain available too.

The browser Back button or another admin link asks you to confirm. Confirming throws away the browser draft so the next New Application starts empty. A successful save clears that draft too. A failed save keeps it. The draft remembers what you typed for about a week, in this browser, for this account. It does not remember a tailored PDF you had selected — choose the file again.

---

## Edit

Every step can be opened immediately. Continue is still blocked until the step you are on is ready, but you can jump with the step list instead of Continue.

Steps that already have their required data start done. The step you land on (Role) is black, with a check in the marker when Role is already filled. The others are green.

**Save Application** returns you to the dashboard. A draft stays a draft. A live application stays live. Saving does not publish.

There is no browser localStorage draft on edit. Leave confirm still appears when the form is dirty (Cancel, header links, Edit profile, or browser Back). The dialog can save from there when the form is ready, then continues to the page you were heading to.

A notice at the top tells you that name, location, and links on this form come from the application as it was saved, not from your live profile. The profile picture is live: if this application shows it, recruiters see the current picture.

---

## Step by step

### 1. Role & share URL

**You enter**

- Company name (required)
- Role (required)
- URL segment order: **Company then role** (the default, `acme-software-engineer`) or **Role then company** (`software-engineer-acme`)
- Slug (required). It is suggested from company and role in that order, and you can type your own. **Reset to suggested** returns to the automatic slug. Existing shared links keep working until the saved slug actually changes.
- A share-link preview of `/view/{publicId}/{slug}`

**Continue** waits until company and role are filled and the slug is **available**. While the slug is still being checked, Continue stays blocked. A taken or invalid slug stays blocked and explains why.

**The check**

- **Create:** appears after you Continue past this step, and stays if you go back, as long as company, role, and a slug are still there.
- **Edit:** appears immediately when company, role, and a slug are present.

Changing the segment order rechecks the slug. The check stays put during that recheck instead of blinking off. If the new slug is taken, the check drops. Continue and Save still wait until the check finishes.

### 2. About you

**You choose what recruiters see**

- First and last name first (always shown when present), then picture (**Visible** / **Hidden** switch; link to Profile when missing), then email, phone, location, LinkedIn, and Portfolio with the same **Visible** / **Hidden** switch when non-empty.
- All identity values are **read-only** from the profile (**Edit profile** to change them). Saving snapshots shown fields onto the application — it does not write back to the profile.

Nothing here blocks Continue.


**The check**

- **Create:** appears once you Continue past this step. It stays, because the step has no required fields to clear.
- **Edit:** it is done as soon as the form opens.

### 3. CV

**You choose one**

- A **library résumé** (up to five, the same library as on Profile). **Manage library** uploads or deletes without leaving the page.
- A **tailored PDF** for this application only.
- Once a CV is selected, the form shows **Recruiters download it as** with the generated `{First}-{Last}-{Slug}.pdf` by default (e.g. `Joan-Gerard-Spotify-Software-Engineer.pdf`). Missing parts use muted placeholders (`First-Last`, `Company-Role`) so the preview always shows the full pattern. **Original name** stores `use_original_cv_filename` so the download keeps the PDF’s filename instead.

On create, the source choices stay locked for a moment while the library loads, so a slow load cannot overwrite your choice.

**Continue** needs a real CV:

- Primary: one selected from the library.
- Tailored: a file chosen now, or, on edit, a tailored file already saved.

**The check**

- **Create:** appears after you Continue past this step, and drops if the CV is cleared. It returns when a CV is chosen again, without another Continue, because you had already passed the step.
- **Edit, file still in storage:** the step starts done. While the library is loading, the check stays if a library résumé was already saved. If that résumé is gone when the library returns, the check drops.
- **Edit, file missing from storage:** the step stays undone when you pick another primary or upload a new tailored PDF. It turns green only after **Continue** on this step. If you then pick a different file, the check drops again until the next Continue. The missing file itself does not count, even if its name is still shown.

**Check again**, under the missing-file warning, looks in storage once more. The button reads **Checking…**. If the file is still gone, it says so. If the check fails, it asks you to try again. If the file is back, the warning goes away.

### 4. Video

**You enter** a YouTube URL (or reuse one from an earlier application). After the URL parses, the form shows a full-width playable preview (thumbnail with play, then embed) and the title. Private videos and videos that block embedding show an error; unlisted videos work. It is required to publish.

**The check**

- **Create:** appears after you Continue past this step, and drops if the URL is cleared.
- **Edit:** appears immediately when a YouTube URL is already saved, and drops if you clear it.

### 5. Review & save

**You see**

- A **Summary**, open at first, that you can collapse. It is grouped like the steps: Role (company and role as the lead line, then the share link with the domain in gray and the slug in the normal text color, and a check after the link when it is available), About you (picture Shown / Hidden / None first, then each field’s value or a Hidden / Empty chip), CV (filename or Missing), and Video (Ready or Missing).
- **Show preview** opens the recruiter page in a dialog: header, CV (including a tailored file you have chosen but not uploaded yet), and video. **Watch Video Pitch** plays here. Closing the dialog, Escape, or the backdrop returns you to the form. This does not count a view and does not leave the form. If the video is open, Escape closes the video first.
- **Save & Preview** on create, or **Save Application** on edit.

On create and draft edit, Save stays disabled until company, role, and an available slug are in place. **Upload one for this role** without a PDF yet is allowed on draft saves (a leftover library URL is not sent as tailored). On a live (active) edit, Save also needs names, a usable CV, and a YouTube URL. The button explains which one is missing. On the last step, Continue is not shown.

**The check**

Review is not earned by Continue. You cannot pass the last step.

- **Create:** Review does not show a check. You save from the black pill, then leave.
- **Edit, and the saved application already has company, role, slug, a CV file in storage, and a video:** Review is green when you are on another step. If you open Review itself, the pill is black and the marker is a check. Clear any of those required pieces and the check drops. Fill them again and it comes back, because the saved application was already complete.
- **Edit, and something required was missing when you opened it** (the usual case is a missing CV file): Review stays without a check while you fix earlier steps. Continue on the CV step does not turn Review green. That would say the application is finished before you have saved it.
- **After a successful save:** Review is marked done, then the page leaves (preview or dashboard), so you do not see the tick appear. The next time you open an edit, Review is green only if that save left every required field in place.

---

## What does not change the checks

- Opening a previous step on create, or any step on edit.
- Collapsing the summary, or opening **Show preview**.
- The progress bar catching up to the step you are merely viewing.

---

## When something fails at save

The form moves you to the step that owns the error, and the message sits on that field. Company, role, slug, and segment order belong to Role. Name, location, and links belong to About you. The CV belongs to CV. The YouTube URL belongs to Video. Anything else is shown on Review.

A tailored PDF is uploaded as part of save. The button can read **Preparing…**, **Uploading…**, or **Saving…**. If save fails, you stay on the form.

---

## After save

|                | Create                                                                    | Edit                                                                           |
| -------------- | ------------------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| Button         | **Save Draft**; **Publish** when the full set is ready                   | **Save Draft** (draft) or **Save application** (live); **Publish** on drafts when ready |
| What is stored | Draft, or **active** when Publish                                         | Same status on Save; **active** when Publish                                   |
| Where you go   | Edit (draft save) or share page (Publish)                                 | Stay on edit (Save); share page (Publish)                                      |
| Who can see it | Only you until Publish; recruiters after Publish                          | Unchanged on Save; recruiters after Publish                                    |

Form Publish on create/edit drafts ships as part of `F41-127` (in-form Preview is look-only). Incomplete draft saves and the publish completeness gate are `F40-124` (shipped).
