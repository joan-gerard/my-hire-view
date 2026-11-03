# MyHireView — User Guide

**MyHireView** is a platform that transforms traditional job applications into dynamic, personalized landing pages. Instead of sending a static PDF resume, candidates create a unique, shareable page for each job application that combines their CV, a video pitch, and optional profile information (portfolio, LinkedIn, location). Each application gets its own custom URL that can be shared with recruiters—no login required for them to view it. Candidates can track when their applications are viewed, manage multiple applications from a central dashboard, and tailor each application to the specific role and company. MyHireView helps job seekers stand out by showcasing their personality and communication skills through video while providing visibility into application engagement.

This guide describes what you can do with MyHireView as a **candidate** (job seeker) or as a **recruiter** (someone viewing an application).

---

## For candidates (job seekers)

### Getting started

- **Sign up:** On the home page, use “Get Started” or go to **Sign up**. Enter your first name, last name, email, password, and confirm password. Confirm your email if your Supabase project requires it. Your name is stored on your account and a profile record is created with that name (you can add location, links, and a picture later).
- **Sign in:** Use **Sign in** and enter your email and password. After signing in, you are taken to your **Dashboard** (`/admin`).
- **Getting started checklist:** On the dashboard (`/admin`), a **Getting started** panel in the right rail guides new accounts until you: create your profile (name), add location or a link (LinkedIn or portfolio), add a profile photo, upload a primary CV, create your first application, and **publish** so you can share the link. Steps tick off as you complete them (no refresh needed) and stay checked in this browser for your account (Public id, or user id before a profile exists) even if you later remove the data that completed them. You can **Skip** individual steps or **Skip all**, and minimize it to a compact control (prefs are remembered per account in this browser). When everything is done or skipped, **Skip all** becomes **Dismiss** — use that to hide the panel. Recreating an account starts the checklist fresh.
### Account settings (Profile)

From the header, open **Profile** (`/admin/profile`). The page title is **Account settings** with tabs:

- **Profile** — identity header with **profile picture** (preview + Change picture / Remove picture; uploaded on Save), **account email**, **member since**, and **Public id** (the private account segment in every share link — not your name). Edit **profile details** used as defaults when you create applications (first name, last name, location, portfolio URL, LinkedIn URL). Changing your name also updates the name stored on your account. Location and URLs can be left blank. These values are not changed when you edit an application. You can also add or change your profile picture from **New** / **Edit application**.
- **CVs** — manage your **Primary CV library** (up to 5 résumé PDFs). The same library is available from **New** / **Edit** via **Manage library**.
- **Preferences** — choose how dashboard **status indicators** look (colorful dots or high-contrast icons). Saved in this browser for your account.
- **Billing and plan** — current Free plan, usage vs draft caps, and Free / Pro / Premium comparison. Marked with a tool icon as a **preview** (paid checkout is not live; upgrade actions stay disabled until membership ships).
- **Password** — change-password form preview (tool icon; submit disabled until auth wiring). Forgot-password will land here later.

Active / draft / archived application totals live in the dashboard **Summary** (not on Account settings). Extra stats such as viewed-at-least-once are still planned (`L7-080`). **Billing and plan** still shows total application count (and primary-CV count) against draft Free caps.

### Dashboard

At **Dashboard** (`/admin`) you can:

- See a personalized greeting (**Good morning/afternoon/evening, {name}**) above the **Applications** title when your first name is known.
- See all your applications in horizontal cards, grouped by day. The day label stays under the header until the next day reaches it. Cards show: status icon, company, role, and action buttons. If you have none yet, the dashboard explains the next step and links to **New application** (legend and search stay hidden until you have at least one application); a search with no matches offers **Clear search**.
- On the right (below the list on small screens): **Search** (once you have at least one application), then a **Summary** of counts (**All**, **Live**, **Draft**, **Archived**), then the **Getting started** checklist (while not dismissed). Search stays put while Summary and the checklist scroll. Both panels are collapsible (choice remembered in this browser). You can skip checklist steps or skip all, then dismiss when done.
- Once you have applications, open **What do these icons mean?** (header button) for a modal legend of status icons (**draft**, **active not viewed**, **active viewed**, **archived**, **CV missing**, and **Picture missing**) and a short explanation of draft actions (**Publish**, **Preview**, **Publish to share** vs **Copy Link**).
- **Search** by company, role, or slug from that rail field (hidden until the first application; kept while a search is in flight or has no matches).
- **Create** a new application via the lime **+** button (tooltip: Create new application), or **New Application** in the admin header.
- On each card, **Copy link**, **View insights**, and **View application** (or **Preview** for drafts) are icon-only buttons — hover or focus shows an instant custom tooltip. **Copy link** copies the shareable URL after the application is published; **View insights** opens view count, CV downloads, creation date, and last viewed; **View application** opens the live page in a new tab.
- Use **More options** (⋯; tooltip on hover/focus) on each card to **Edit**, **Archive** (or **Restore** if archived), **Publish** (drafts), or **Delete**. Drafts still show a labeled **Publish** button on the card.

### Creating an application

1. Click **New Application** (`/admin/new`).
2. If optional profile fields (location, links) are still empty, a short notice recommends completing your profile for richer prefills (arrow icon opens Profile).
3. **About you** on create starts with **Profile picture**: **Show picture** / **Hide picture**, then **Manage picture** or **Add profile picture** under those choices. First and last name sit side by side, then location, **Portfolio**, and **LinkedIn**, each with **Show** / **Hidden**. A hidden field is muted and cannot be edited until you choose **Show**. Edits apply only to this application. Edit still uses **Yes** / **No** and the collapsible **Info shown to recruiters** list.
4. Fill in the **application form**. On **New application**, one chapter is open at a time: **Role**, **About you**, **Résumé**, and **Pitch**. The others stay as a single line. The checklist and form are centered. A checklist titled **This application** shows how many parts are ready; click a row to open that part. The closed Role line shows the company and role once the share link is ready. While the link is being checked it says **Checking...** in grey italic. Other link problems stay in pink: missing, invalid, already used, or could not be checked. **Next** moves on without waiting. **About you** is optional. **Edit link** opens **Order in the link** and **Link ending**, without the longer help text. **Use the suggested link** appears after the ending is changed. **Save draft & preview** stays at the top and is greyed out until the application is ready. The checklist names what is still missing. Edit is still the scrolling page described in [APPLICATION_FORM_WORKFLOW.md](../product/APPLICATION_FORM_WORKFLOW.md).
   - **Company name** and **Role/Position** (required).
   - **Order in the link**, behind **Edit link** on create: **Company, then role** or **Role, then company**. Edit still labels this **URL segment order** and shows the examples.
   - **Link ending** on create, in the same **Edit link** panel. It is auto-generated from company and role. **Use the suggested link** restores that ending after a manual change. Edit still calls this field **Slug**, offers **Reset to suggested**, and shows a **Share link preview** that explains **Public id**.
   - **Résumé** on create: choose a library file as a card, or **A PDF just for this role**. **Manage library** sits beside **From your library**. Once a file is chosen, recruiters’ download name is one line with a toggle for the original or generated name. Edit still uses the longer **CV** radios and **Download name for recruiters** block. Source options stay locked briefly while your library loads.
   - **YouTube URL** for your video pitch (**required** — create and edit will not save without a valid YouTube link).
   - **Review & save**, on edit, shows a collapsible **Summary** grouped like the steps: Role (company and role, then the share link), About you (picture **Shown** / **Hidden** / **None** first, then each field’s value or **Hidden** / **Empty**), CV, and Video. Status chips mark Available, Missing, and similar states. It starts open. **Preview** on edit opens that recruiter page in a dialog, without leaving the form. Create has no preview button; saving opens the draft preview.
5. Progress on this form is **remembered in this browser** if you refresh (up to about a week). These browser drafts are stored per signed-in account (separate from a saved application draft). If you leave via the browser Back button or another admin link, you are asked to confirm — confirming **discards** the browser draft so the next New Application starts clean. After a successful **Save draft & preview**, the browser draft is cleared; a failed save keeps it. A tailored PDF file itself is not restored — re-choose the file if you had one selected.
6. Click **Save draft & preview**. That saves the application as a draft and, when your account has a Public id, opens a **preview** of the public page (same link recruiters will use later). If the Public id is not ready yet, you return to the dashboard instead — open **Preview** from the draft card once the id is available. Recruiters still cannot see the page until you publish. Use **Publish** on the preview banner or on the dashboard card when it looks right. Until then the card shows **Publish to share** instead of **Copy Link**.

### Editing an application

1. On the dashboard, open the **3-dot menu** on the application card and click **Edit**.
2. A notice reminds you that candidate details come from when this application was saved — not from your live profile. Changing your profile does not update existing applications.
3. The form is pre-filled from **that application only** (including which candidate fields are on or off and their values). Changing the company or role does not change a share link you already saved. **Reset to suggested**, a new segment order, or typing a new slug does. Existing shared links keep working until you save that new slug. Your profile is not changed when you save.
4. Change any fields or toggles, then click **Save draft** while the application is still a draft, or **Save application** once it is live. Draft apps stay drafts until you **Publish**; active apps stay active.

### Sharing with recruiters

- Each application has a **unique link** for that user. The shape is `https://yoursite.com/view/{publicId}/{slug}` — for example `https://yoursite.com/view/k7x2m9ab/acme-software-engineer`. The middle segment is an opaque id assigned to your account (username/handle planned for all tiers). The last segment is company and role in your chosen order (company-role or role-company).
- **Publish** the application first (from the draft preview banner or the dashboard). Then use **Copy Link** on the dashboard card and send it by email, LinkedIn, or job portal.
- Recruiters can open the link without signing in. You can see how many times the page was viewed and when it was last viewed (view count and last viewed date in View Insights; one count per recruiter session).

### Archiving and deleting

- **Archive:** Only for published (active) applications. The link still opens, but recruiters see that it **doesn’t have an active application** (no CV, video, or candidate details). You can **Restore** later to make it active again.
- **Delete:** The application is removed. Opening the old link shows the **same** empty-state message.

---

## For recruiters

### Viewing an application

- Open the **shareable link** the candidate sent (e.g. `https://yoursite.com/view/k7x2m9ab/acme-software-engineer`).
- You do **not** need to sign in.

You will see:

- **Header:** Company name, role, and (if the candidate chose to share them) their name, location, and buttons for **Portfolio** and **LinkedIn**.
- **Resume:** A PDF viewer with the candidate’s CV.
- **Video pitch:** An embedded YouTube video.

If the application was **archived** or **deleted** (or the link is invalid / mistyped), you will see that the link **doesn’t have an active application** — the CV and video are not shown.

### View count and last viewed

- Opening the link counts as one **view** per browser session. The candidate sees the total view count and the last viewed date/time on their dashboard (View Insights on each card).

---

## Summary

| Who       | What they can do |
| --------- | ----------------- |
| **Candidate** | Sign up, sign in, edit profile (name, location, portfolio, LinkedIn), create applications (company, role, CV, video, candidate toggles), edit or archive or delete applications, copy shareable links, see view counts. |
| **Recruiter** | Open shareable link (no login), see candidate name/location/portfolio/LinkedIn when shared, view CV and video pitch. |

For setup and technical details, see [README.md](../../README.md), [ARCHITECTURE.md](../architecture/ARCHITECTURE.md), and [API_REFERENCE.md](../architecture/API_REFERENCE.md).
