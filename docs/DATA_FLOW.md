# HireView — Data Flow

This document describes how data moves through the system using Mermaid diagrams. For system architecture and design, see [ARCHITECTURE.md](ARCHITECTURE.md).

---

## 1. High-level data flow

```mermaid
flowchart LR
  subgraph Actors
    Candidate[Candidate]
    Recruiter[Recruiter]
  end

  subgraph App[Next.js App]
    ProfilePage[Profile page]
    NewEdit[New / Edit application]
    ViewPage[Public view]
  end

  subgraph APIs[API routes]
    ProfileAPI["/api/profile"]
    AppsAPI["/api/applications"]
    SlugAPI["GET /api/applications/slug"]
    ViewAPI["POST .../view"]
  end

  subgraph Data[Data]
    Profiles[profiles]
    Applications[applications]
  end

  Candidate --> ProfilePage
  Candidate --> NewEdit
  ProfilePage --> ProfileAPI
  NewEdit --> AppsAPI
  Recruiter --> ViewPage
  ViewPage --> SlugAPI
  ViewPage --> ViewAPI

  ProfileAPI --> Profiles
  AppsAPI --> Profiles
  AppsAPI --> Applications
  SlugAPI --> Applications
  ViewAPI --> Applications
```

- **Profiles** are read/updated only via the profile page and `/api/profile`.
- **Applications** are created/updated via the application form; candidate fields can come from the form (with toggles) or, on create, from a profile fallback. Recruiters read only from the application row.

---

## 2. Authentication

```mermaid
sequenceDiagram
  participant U as User
  participant Login as Login page
  participant API as /api/auth/login
  participant Supa as Supabase Auth
  participant MW as Middleware

  U->>Login: Enter email + password
  Login->>API: POST credentials
  API->>Supa: signInWithPassword
  Supa-->>API: session
  API->>API: Set session cookies on response
  API-->>Login: 200 + Set-Cookie
  Login->>U: Redirect to /admin
  U->>MW: Request /admin
  MW->>Supa: getUser (refresh from cookies)
  MW-->>U: Allow /admin
```

Sign-up works the same way via `/api/auth/signup`. Session is stored in cookies; middleware refreshes it and protects `/admin` routes.

---

## 3. Profile (read and update)

```mermaid
sequenceDiagram
  participant U as User
  participant Page as /admin/profile
  participant API as /api/profile
  participant DB as profiles table

  U->>Page: Open profile
  Page->>DB: select by user_id (server)
  DB-->>Page: profile or none
  Page->>U: Show form (email, profile fields)

  U->>Page: Edit name, location, URLs, Save
  Page->>API: PUT profile (partial)
  API->>API: requireAuth, validate URLs
  API->>DB: upsert by user_id
  DB-->>API: updated row
  API-->>Page: 200 + data
  Page->>U: Refresh / success
```

Profile data is used as the default source for candidate fields when creating a new application; it is not updated from the application form.

---

## 4. Create application

```mermaid
sequenceDiagram
  participant U as User
  participant NewPage as /admin/new
  participant ProfileAPI as GET /api/profile
  participant Form as ApplicationForm
  participant SlugAPI as POST /api/slug
  participant UploadAPI as POST /api/upload
  participant AppsAPI as POST /api/applications
  participant Blob as Vercel Blob
  participant Profiles as profiles
  participant Applications as applications

  U->>NewPage: Open create form
  NewPage->>ProfileAPI: GET profile
  ProfileAPI->>Profiles: select by user_id
  Profiles-->>ProfileAPI: profile
  ProfileAPI-->>NewPage: profile data
  NewPage->>Form: initialData (profile for candidate section)

  U->>Form: Fill company, role, candidate toggles, CV (file held in memory), video
  U->>Form: Save
  Form->>UploadAPI: POST PDF (only on save)
  UploadAPI->>Blob: put(file)
  Blob-->>UploadAPI: url
  UploadAPI-->>Form: cv_url
  Form->>SlugAPI: POST company, role (optional: first_name, last_name if include name in URL)
  SlugAPI->>Applications: check slug (with optional name prefix)
  SlugAPI-->>Form: slug
  Form->>AppsAPI: POST (company, role, slug, cv_url, video_url, candidate fields from form)
  AppsAPI->>AppsAPI: requireAuth()
  AppsAPI->>Profiles: select profile (if candidate fields not in body)
  Profiles-->>AppsAPI: profile
  AppsAPI->>AppsAPI: use body candidate fields or profile fallback
  AppsAPI->>Applications: insert row
  Applications-->>AppsAPI: data
  AppsAPI-->>Form: 201
  Form->>U: Redirect to /admin
```

Candidate fields (first name, last name, location, portfolio URL, LinkedIn URL) are sent from the form; toggles determine which are stored or set to null. If the client does not send them, the API falls back to the current profile. If the user chooses **Name in URL** (At start or At end), the slug API is called with `slugNamePosition` and first/last name so the shareable link can be `firstname-lastname-company-role` or `company-role-firstname-lastname`.

---

## 5. Edit application

```mermaid
sequenceDiagram
  participant U as User
  participant EditPage as /admin/edit/[id]
  participant ByIdAPI as GET /api/applications/by-id/[id]
  participant Form as ApplicationForm
  participant AppsAPI as PUT /api/applications
  participant Applications as applications

  U->>EditPage: Open edit
  EditPage->>ByIdAPI: GET by id
  ByIdAPI->>Applications: select by id, user_id
  Applications-->>ByIdAPI: application (incl. candidate fields)
  ByIdAPI-->>EditPage: data
  EditPage->>Form: initialData from application only

  U->>Form: Change fields, toggles, optionally new CV file, Include name in URL, Save
  Note over Form: If new CV selected: upload to /api/upload on save, then PUT with new cv_url
  Form->>AppsAPI: PUT (id, all fields including candidate)
  Note over Form,Applications: If slug changed, slug API called with company, role, optional first/last name
  AppsAPI->>AppsAPI: requireAuth(), verify ownership; if cv_url changed, delete old blob
  AppsAPI->>Applications: update row (no profile merge)
  Applications-->>AppsAPI: data
  AppsAPI-->>Form: 200
  Form->>U: Redirect to /admin
```

Only the application row is updated; the profile table is never written from the edit flow.

---

## 6. Public view and view count

```mermaid
sequenceDiagram
  participant R as Recruiter
  participant Page as /view/[slug]
  participant SlugAPI as GET /api/applications/[slug]
  participant ViewAPI as POST .../view
  participant VT as ViewTracker
  participant Applications as applications

  R->>Page: Open shareable link
  Page->>SlugAPI: fetch(slug)
  SlugAPI->>Applications: select by slug
  Applications-->>SlugAPI: full row (incl. candidate fields)
  SlugAPI-->>Page: application
  Page->>Page: Render header (company, role, name, location, portfolio/LinkedIn), PDF, video
  Page->>VT: Mount
  VT->>VT: sessionStorage already tracked?
  VT->>ViewAPI: POST (if not)
  ViewAPI->>ViewAPI: viewer is applicant? (auth.uid === application.user_id)
  ViewAPI->>Applications: RPC increment_application_view_count(slug) via service_role (only if not applicant)
  ViewAPI-->>VT: 200
  VT->>VT: sessionStorage set
```

All data shown to the recruiter (including candidate name, location, and links) comes from the application row. View count is incremented once per session via ViewTracker, and `last_viewed_at` is set to the current time, **except when the applicant (owner) is viewing their own application**—in that case the API returns success without updating so the count and last-viewed time reflect only external viewers. The increment is done via a SECURITY DEFINER database function callable only by the service role (see **docs/VIEW_COUNT_FIX.md**).

**CV download count:** When the recruiter (or any visitor) clicks "Download CV" in the PDF viewer, the client calls `POST /api/applications/[slug]/download` (once per session, via sessionStorage). The API increments `download_count` via the `increment_application_download_count` SECURITY DEFINER RPC (service_role only), only when the requester is not the application owner, so the count reflects only external CV downloads. The dashboard "View Insights" panel shows view count, CV download count, creation date, and last viewed date/time. The file name used for the download is chosen when creating or editing the application: either the original uploaded filename (e.g. `My Resume.pdf`) or the generated name `CV-{Slug}.pdf`, stored in `applications.cv_filename` and `applications.use_original_cv_filename`.

---

## 7. Data ownership summary

| Data        | Written by                    | Read by                          |
| ----------- | ----------------------------- | --------------------------------- |
| **profiles** | Profile page → `/api/profile` | Profile page; applications API (create fallback) |
| **applications** | New/Edit form → `/api/applications` | Dashboard, edit page, public `/view/[slug]` |
| **auth**    | Login/signup → Supabase Auth  | Middleware, requireAuth(), profile/dashboard |

Candidate fields on the application are either supplied by the form (with toggles) or, on create only, taken from the profile when not in the request body. The recruiter view never reads from the profile table.
