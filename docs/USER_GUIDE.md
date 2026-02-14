# HireView — User Guide

This guide describes what you can do with HireView as a **candidate** (job seeker) or as a **recruiter** (someone viewing an application).

---

## For candidates (job seekers)

### Getting started

- **Sign up:** On the home page, use “Get Started” or go to **Sign up**. Enter your email and a password. Confirm your email if your Supabase project requires it.
- **Sign in:** Use **Sign in** and enter your email and password. After signing in, you are taken to your **Dashboard** (`/admin`).

### Profile

From the header, open **Profile** (`/admin/profile`). You can:

- See your **account email** and **member since** date.
- Edit **profile details** used as defaults when you create applications:
  - First name  
  - Last name  
  - Location  
  - Portfolio URL  
  - LinkedIn URL  

Saving updates only your profile. These values are not changed when you edit an application. You can leave any field blank.

- See how many **applications** you have in total and how many are **active** vs **archived**. A link takes you back to the dashboard.

### Dashboard

At **Dashboard** (`/admin`) you can:

- See all your applications in horizontal cards showing: status (active/archived), company, role, and action buttons.
- **Search** by company or role.
- **Create** a new application (New Application).
- **Copy Link** to copy the shareable link to send to recruiters.
- **View Insights** to expand a card and see view count and creation date.
- **View Application** to open the application page in a new tab.
- Use the **3-dot menu** on each card to **Edit**, **Archive** (or **Restore** if archived), or **Delete**.

### Creating an application

1. Click **New Application** (`/admin/new`).
2. **Info shown to recruiters** (at the top):
   - Your profile details are shown as a preview. You can **toggle each field on or off** (off means recruiters will not see it).
   - You can **edit** any value here; changes apply only to this application, not to your profile.
   - You can **show or hide** the whole list of fields; that preference is remembered for next time.
3. Fill in the **application form**:
   - **Company name** and **Role/Position** (required).
   - **Name in URL** (optional): choose **None**, **At start** (e.g. `john-doe-acme-software-engineer`), or **At end** (e.g. `acme-software-engineer-john-doe`). The slug preview updates as you type.
   - **Slug** (used in the URL; auto-generated from company and role, and from your name and position if you chose; you can change it manually).
   - **CV**: upload a PDF (stored securely).
   - **YouTube URL** for your video pitch.
   - **Description** (optional text for recruiters).
4. Click **Save Application**. You are returned to the dashboard. The shareable link is shown on the application card; use **Copy Link** to share it.

### Editing an application

1. On the dashboard, open the **3-dot menu** on the application card and click **Edit**.
2. The form is pre-filled from **that application only** (including which candidate fields are on or off and their values). You can change **Name in URL** (None / At start / At end) when you save. Your profile is not changed when you save.
3. Change any fields or toggles, then click **Save Application**.

### Sharing with recruiters

- Each application has a **unique link**. It can be based on company and role (e.g. `https://yoursite.com/view/acme-software-engineer`) or, if you chose to include your name when creating or editing, on your name plus company and role (e.g. `https://yoursite.com/view/john-doe-acme-software-engineer`).
- Use **Copy Link** on the dashboard card and send it by email, LinkedIn, or job portal.
- Recruiters can open the link without signing in. You can see how many times the page was viewed (view count on the card; one count per recruiter session).

### Archiving and deleting

- **Archive:** The link still works, but recruiters see a message that the application is no longer active and the CV and video are not shown. You can **Restore** later to make it active again.
- **Delete:** The application is removed. The link will no longer work.

---

## For recruiters

### Viewing an application

- Open the **shareable link** the candidate sent (e.g. `https://yoursite.com/view/acme-software-engineer`).
- You do **not** need to sign in.

You will see:

- **Header:** Company name, role, and (if the candidate chose to share them) their name, location, and buttons for **Portfolio** and **LinkedIn**.
- **Resume:** A PDF viewer with the candidate’s CV.
- **Video pitch:** An embedded YouTube video.
- **About:** Optional description from the candidate.

If the application was **archived**, you will see a message that it is no longer active and the CV and video are not available.

### View count

- Opening the link counts as one **view** per browser session. The candidate sees the total view count on their dashboard.

---

## Summary

| Who       | What they can do |
| --------- | ----------------- |
| **Candidate** | Sign up, sign in, edit profile (name, location, portfolio, LinkedIn), create applications (company, role, CV, video, description, candidate toggles), edit or archive or delete applications, copy shareable links, see view counts. |
| **Recruiter** | Open shareable link (no login), see candidate name/location/portfolio/LinkedIn when shared, view CV and video pitch, read description. |

For setup and technical details, see [README.md](../README.md) and [ARCHITECTURE.md](ARCHITECTURE.md).
