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

- **Profile** — identity header with **profile picture** (preview + Change picture / Remove picture; uploaded on Save), **account email**, **member since**, and **Public id** (the private account segment in every share link — not your name). Edit **profile details** (first name, last name, email prefilled from your account email, phone, location, LinkedIn URL, portfolio URL) and **Shown by default on new applications** toggles (email, phone, picture, location, LinkedIn, portfolio). A LinkedIn URL in the portfolio field, a non-LinkedIn URL in the LinkedIn field, or a URL missing `http://`/`https://`, shows a soft warning under the field (not the browser URL bubble). Mix-up warnings still allow save; save still requires a valid URL. Changing your name also updates the name stored on your account. Location, phone, email, and URLs can be left blank. New and Edit applications show About you as read-only profile values with show/hide (including email and phone). Saving an application snapshots the shown values onto that application. The picture is added and changed on Profile.
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
- Use **More options** (⋯; tooltip on hover/focus) on each card to **Edit**, **Archive** (or **Restore** if archived), **Publish** (complete drafts), or **Delete**. Draft cards use two status colors: orange for incomplete, gold for ready to publish. **Publish** appears only when every required field is filled.

### Creating an application

1. Click **New Application** (`/admin/new`).
2. If optional profile fields (location, links) are still empty, a short notice recommends completing your profile for richer prefills (arrow icon opens Profile).
3. **About you** on create and edit shows profile values as **read-only**. A short note says they come from your profile and this page only chooses what recruiters see; use **Edit profile** to change them. Order: **First name** and **Last name** (always shown when present; required to publish), then **Picture** (photo or initials; show switch under it, or a link to Profile when missing), then Location, **LinkedIn**, and **Portfolio** with an eye / eye-off when non-empty. Empty optional fields point you to Profile. Saving snapshots what this page shows — it does not update your profile. Status dots: green “From your profile” when a value exists, grey when empty. Picture is green when a photo exists. Résumé marks the chosen Library / This role source green and the other grey.
4. Fill in the **application form**. **New application** is no wider than a `2xl` column. The title and description sit at the top. Sections are **Your link**, **About you**, **Your Résumé**, and **Your Pitch**, each a heading above its own card. Each entry puts its title on the left and the control on the right (on a narrow screen the title sits above). A short description sits under the title when there is one. **Your link** holds company, role, **How the link reads**, **Link ending**, and **Your application link** on separate rows. **How the link reads** is a custom dropdown, **Company + Role** or **Role + Company**. **Link ending** is its own row, with the same kind of info dialog. **Your application link** is a full-width result row: the title sits above a read-only field with a copy icon. Required fields show a red asterisk. While the link is being checked it says **Checking...** in grey italic on the ending row. Link problems stay on that row. **Use the suggested link** appears after the ending is changed. **Cancel** returns to the dashboard. **Save Draft** sits at the bottom and is greyed out until the application is ready. A line above the buttons names what is still missing. Create and edit share this layout — see [APPLICATION_FORM_WORKFLOW.md](../product/APPLICATION_FORM_WORKFLOW.md).
   - **Company name** and **Role/Position** (required).
   - **How the link reads** on create, its own row: a dropdown of **Company + Role** or **Role + Company**. **Company + Role** is selected until you change it. An info icon beside the title opens a dialog that says to choose whether the company or the role comes first. The dialog closes from an icon on the right of the title. Edit still labels this **URL segment order** and shows the examples.
   - **Link ending**, the next row. It is pre-filled. An info icon opens a dialog: edit it if you like, and each ending must be unique. **Use the suggested link** restores that ending after a manual change. **Your application link** is the result row under that: full width, title above a read-only URL with a copy icon. Wider screens show the full URL, wrapped so the ending stays visible. A narrow screen shows the `/view/…` path so the ending is not crowded out.
   - **Your Résumé**: **Library** shows the selected primary with **Manage** to change it in a modal. **This role** uses **Choose a PDF** / **Manage** to pick a file for this application only. Once a file is chosen, **Recruiters download it as** appears at the bottom of the section with the generated `{First}-{Last}-{Slug}.pdf` name (muted `First-Last` / `Company-Role` placeholders fill gaps); turn on **Original name** to keep the PDF’s filename. Source options stay locked briefly while your library loads (create).
   - **YouTube URL** for your video pitch. You can save a **draft** without it; **Publish** (and saving a live application) requires a valid YouTube link.
   - Create and edit share this layout. Create’s button is **Save Draft**. Edit’s button is **Save Draft** or **Save application**. When company, role, share link, names, résumé, and a valid YouTube intro are all ready, **Publish** appears beside Save. On edit, Save stays off until something changes, and a successful Save stays on the edit page; **Publish** opens the live share page.
5. Progress on this form is **remembered in this browser** if you refresh (up to about a week). These browser drafts are stored per signed-in account (separate from a saved application draft). Profile name and links alone do not count as progress. If you leave with unsaved changes (Cancel, Edit profile, another admin link, or browser Back), you are asked to confirm. The dialog suggests adding company and role when those are missing so you can save; when a draft can be saved, **Save Draft** is available in the dialog and then continues to the page you were heading to. Confirming leave without saving **discards** the browser draft so the next New Application starts clean. After a successful **Save Draft**, the browser draft is cleared; a failed save keeps it. A tailored PDF file itself is not restored — re-choose the file if you had one selected.
6. Click **Save Draft** to save and open the **edit** page (`/admin/edit/[id]`), or **Publish** when it appears to go live and open the share page. Recruiters cannot see the page until you publish. You can also **Preview** or **Publish** from the dashboard card (or the preview banner on the share link). Until published, the card shows **Publish to share** instead of **Copy Link**.

### Editing an application

1. On the dashboard, open the **3-dot menu** on the application card and click **Edit**.
2. Name, location, and links are read-only from your profile; use **Edit profile** to change them. Location, LinkedIn, and Portfolio stay hidden on this application when the saved page did not include them (switch off). A later profile-only change does not update an already saved application until you save that application again.
3. Company, role, the share link, the résumé, and the video come from **that application**. Changing the company or role does not change a share link you already saved. **Use the suggested link**, a new segment order, or typing a new ending does. Existing shared links keep working until you save that new slug. Saving does not change your profile.
4. Change any fields or toggles, then click **Save Draft** while the application is still a draft, or **Save application** once it is live. Save stays disabled with **No changes to save.** until something differs from the last save; after saving you stay on the edit page. When a draft has the full required set, **Publish** appears and goes live (opens the share page). Active apps stay active.

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

- **Header:** Company name, role, and (if the candidate chose to share them) their name, location, and buttons for **LinkedIn** and **Portfolio**.
- **Resume:** A PDF viewer with the candidate’s CV.
- **Video pitch:** An embedded YouTube video.

If the application was **archived** or **deleted** (or the link is invalid / mistyped), you will see that the link **doesn’t have an active application** — the CV and video are not shown.

### View count and last viewed

- Opening the link counts as one **view** per browser session. The candidate sees the total view count and the last viewed date/time on their dashboard (View Insights on each card).

---

## Summary

| Who           | What they can do                                                                                                                                                                                                        |
| ------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Candidate** | Sign up, sign in, edit profile (name, location, portfolio, LinkedIn), create applications (company, role, CV, video, candidate toggles), edit or archive or delete applications, copy shareable links, see view counts. |
| **Recruiter** | Open shareable link (no login), see candidate name/location/portfolio/LinkedIn when shared, view CV and video pitch.                                                                                                    |

For setup and technical details, see [README.md](../../README.md), [ARCHITECTURE.md](../architecture/ARCHITECTURE.md), and [API_REFERENCE.md](../architecture/API_REFERENCE.md).
