# Application form workflow

How create and edit feel in the wizard: the journey, what each step asks for, and when a step turns green and shows a check.

Create is `/admin/new`. Edit is `/admin/edit/[id]`. Both use the same five steps and the same fields. What differs is how far you can jump, when a step counts as done, and what Save does afterward.

This is the behavior reference. The decision to keep only the wizard is in [APPLICATION_FORM_STEPS_F35.md](../retrospectives/APPLICATION_FORM_STEPS_F35.md). Candidate-facing steps are in [USER_GUIDE.md](../engineering/USER_GUIDE.md).

---

## The journey in one pass

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

| What you see | Meaning |
| --- | --- |
| **Black pill**, white text | The step you are on. No green fill and no green outline. |
| **Check** inside the black pill | You are on a step that already counts as done. |
| **Green pill** and a **check** | A step you are not on, and it counts as done. |
| **Number**, normal text, clickable | You can open it, and it is not done yet. |
| **Number**, quieter text, not clickable | Create only. You have not reached this step with Continue. |

The line under **Application progress** says **N of M complete**. N is how many steps have a check, including the one you are on if its marker is a check. Clicking around does not move the bar. Only gaining or losing a check does.

---

## Create

You start on Role. Later steps are locked until Continue reaches them.

Continue does two things: it opens the next step, and it remembers how far you have come. Going back does not lock those steps again, and it does not remove a check from a step you have already passed. A check does drop if that step stops being ready — for example you delete the company name, the CV, or the YouTube link. Put the required value back and the check returns, without another Continue.

About you has no required fields, so passing it is enough for its check.

**Save & Preview** saves a **draft**. Recruiters cannot open it yet. If your account has a Public id, you land on your own preview of the share link. If it does not, you land on the dashboard and can open **Preview** from the card once the id exists. Publish is a separate action, on the preview banner or the dashboard card.

The browser Back button or another admin link asks you to confirm. Confirming throws away the browser draft so the next New Application starts empty. A successful save clears that draft too. A failed save keeps it. The draft remembers what you typed for about a week, in this browser, for this account. It does not remember a tailored PDF you had selected — choose the file again.

---

## Edit

Every step can be opened immediately. Continue is still blocked until the step you are on is ready, but you can jump with the step list instead of Continue.

Steps that already have their required data start done. The step you land on (Role) is black, with a check in the marker when Role is already filled. The others are green.

**Save Application** returns you to the dashboard. A draft stays a draft. A live application stays live. Saving does not publish.

There is no browser draft and no leave confirmation on edit. Leave from the header or with the browser Back button.

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

**You enter**

- Profile picture first. **Yes** shows the picture. **No** hides it and keeps **Manage picture**. Until a picture exists, the choice is **Add profile picture**.
- Then first name, last name, location, portfolio, and LinkedIn. Each is **Show** or **Hidden**, with the label above the value. A hidden field is muted and not editable. Hidden fields are not shown to recruiters. A shown field that is blank is shown as empty, not as a placeholder.

Nothing here blocks Continue.

**The check**

- **Create:** appears once you Continue past this step. It stays, because the step has no required fields to clear.
- **Edit:** it is done as soon as the form opens.

### 3. CV

**You choose one**

- A **primary CV** from your library (up to five, the same library as on Profile). **Manage library** uploads or deletes without leaving the page.
- A **tailored PDF** for this application only.
- **Download name for recruiters**, once a CV is selected: the original file name, or a generated `CV-{slug}.pdf`. The section stays hidden until then.

On create, the source choices stay locked for a moment while the library loads, so a slow load cannot overwrite your choice.

**Continue** needs a real CV:

- Primary: one selected from the library.
- Tailored: a file chosen now, or, on edit, a tailored file already saved.

**The check**

- **Create:** appears after you Continue past this step, and drops if the CV is cleared. It returns when a CV is chosen again, without another Continue, because you had already passed the step.
- **Edit, file still in storage:** the step starts done. While the library is loading, the check stays if a primary CV was already saved. If that primary is gone when the library returns, the check drops.
- **Edit, file missing from storage:** the step stays undone when you pick another primary or upload a new tailored PDF. It turns green only after **Continue** on this step. If you then pick a different file, the check drops again until the next Continue. The missing file itself does not count, even if its name is still shown.

**Check again**, under the missing-file warning, looks in storage once more. The button reads **Checking…**. If the file is still gone, it says so. If the check fails, it asks you to try again. If the file is back, the warning goes away.

### 4. Video

**You enter** a YouTube URL. It is required.

**The check**

- **Create:** appears after you Continue past this step, and drops if the URL is cleared.
- **Edit:** appears immediately when a YouTube URL is already saved, and drops if you clear it.

### 5. Review & save

**You see**

- A **Summary**, open at first, that you can collapse. Order matches the steps: company and role, share slug, info shown to recruiters (value, **Hidden**, or **Empty**, plus picture **Shown** / **Hidden** / **None**), then CV, then video.
- **Show preview** opens the recruiter page in a dialog: header, CV (including a tailored file you have chosen but not uploaded yet), and video. **Watch Video Pitch** plays here. Closing the dialog, Escape, or the backdrop returns you to the form. This does not count a view and does not leave the form. If the video is open, Escape closes the video first.
- **Save & Preview** on create, or **Save Application** on edit.

Save stays disabled until company, role, an available slug, a usable CV, and a YouTube URL are all in place. The button explains which one is missing. On the last step, Continue is not shown.

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

| | Create | Edit |
| --- | --- | --- |
| Button | **Save & Preview** | **Save Application** |
| What is stored | A draft | The same status it already had |
| Where you go | Owner preview of the share link, or the dashboard if Public id is missing | Dashboard |
| Who can see it | Only you, until you publish | Unchanged: drafts stay private, live links stay live |

Publishing from the review step, and saving a draft that is still missing required fields, are not part of this flow. Those are `F41-127` and `F40-124`.
