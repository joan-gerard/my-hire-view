# MyHireView — System Architecture & Design

This document describes the architecture and design of **MyHireView**, an application that lets users create personalized recruiter landing pages: one shareable page per job application, with a tailored CV (PDF) and video pitch (YouTube).

---

## 1. Overview

**Purpose:** Candidates create one landing page per application. Each page has a unique shareable link, shows a tailored CV (PDF) and an embedded YouTube video pitch. Recruiters open the link without logging in. Candidates manage applications from an authenticated admin dashboard and can track view counts.

**High-level behavior:**

- **Public:** Anyone with a link can view an application at `/view/[publicId]/[slug]` (e.g. `/view/k7x2m9ab/acme-software-engineer`). Views are tracked (once per session). See [PUBLIC_URL_OPTION_B.md](PUBLIC_URL_OPTION_B.md).
- **Authenticated:** Users sign up / sign in, then create, edit, archive, and delete applications. They get shareable URLs and see view counts.

---

## 2. Technology Stack

| Layer            | Technology                                                 |
| ---------------- | ---------------------------------------------------------- |
| **Framework**    | Next.js 16 (App Router)                                    |
| **UI**           | React 19, Tailwind CSS 4                                   |
| **Backend**      | Next.js API Routes (serverless)                            |
| **Database**     | Supabase (PostgreSQL)                                      |
| **Auth**         | Supabase Auth (email/password)                             |
| **File storage** | Cloudflare R2 (CV PDFs), Supabase Storage (profile pictures) |
| **Video**        | YouTube (embed only; URLs stored)                          |

---

## 3. High-Level Architecture

The system is a single Next.js application that uses Supabase for auth and data, and Cloudflare R2 for CV storage. All user-facing and API logic lives in the same deployment.

```mermaid
flowchart TB
  subgraph Users
    Candidate[Candidate / User]
    Recruiter[Recruiter]
  end

  subgraph MyHireView["MyHireView (Next.js)"]
    direction TB
    Middleware[Middleware<br>Session refresh & /admin guard]
    App[App Router<br>Pages & Layouts]
    API[API Routes]

    Middleware --> App
    Middleware --> API
    App --> API
  end

  subgraph External["External Services"]
    Supabase[(Supabase<br>PostgreSQL + Auth)]
    R2CV[Cloudflare R2<br>PDF storage]
    YouTube[YouTube<br>Embed]
  end

  Candidate --> App
  Candidate --> API
  Recruiter --> App

  API --> Supabase
  API --> R2CV
  App --> Supabase
  App --> YouTube
```

- **Middleware:** Runs on each request (except static assets). Refreshes Supabase session and redirects unauthenticated users from `/admin` to `/login`.
- **App Router:** Renders pages (public apply page, admin dashboard, login/signup, home).
- **API Routes:** Handle CRUD for applications, auth (login/signup/logout), upload, slug generation, and view tracking. They enforce auth where needed and talk to Supabase and Cloudflare R2 (S3 API). Rate limiting (see `lib/rate-limit.ts`) is applied per IP on write endpoints (e.g. waitlist, auth, applications, uploads) to mitigate abuse and brute force.

---

## 4. Architecture Diagram — Component View

```mermaid
flowchart LR
  subgraph Frontend["Frontend (React)"]
    Public[Public: /view/publicId/slug]
    Admin[Admin: /admin, /admin/new, /admin/edit/id]
    AuthPages[Auth: /login, /signup]
  end

  subgraph API["API Routes"]
    AppsAPI["/api/applications<br>GET, POST, PUT, DELETE"]
    ProfileAPI["/api/profile<br>GET, PUT"]
    SlugAPI["/api/applications/slug<br>GET by slug"]
    ViewAPI["/api/applications/slug/view<br>POST increment"]
    ByIdAPI["/api/applications/by-id/id<br>GET by id"]
    AuthAPI["/api/auth/login<br>signup, logout"]
    UploadAPI["/api/upload<br>POST PDF"]
    SlugGenAPI["/api/slug<br>POST generate"]
  end

  subgraph Lib["Shared lib"]
    Auth[requireAuth, getUser]
    SupabaseClients[Supabase: server, route-client, middleware]
    Utils[url, slug, youtube, clipboard]
    Types[application, database types]
  end

  subgraph Data["Data & Storage"]
    DB[(applications table)]
    ProfilesTable[(profiles table)]
    AuthUsers[(auth.users)]
    R2Store[(Cloudflare R2)]
  end

  Public --> SlugAPI
  Admin --> AppsAPI
  Admin --> ProfileAPI
  Admin --> ByIdAPI
  Admin --> UploadAPI
  Admin --> SlugGenAPI
  AuthPages --> AuthAPI
  Public --> ViewAPI

  AppsAPI --> Auth
  ByIdAPI --> Auth
  ProfileAPI --> Auth
  UploadAPI --> Lib
  AuthAPI --> SupabaseClients
  SlugGenAPI --> Lib

  Auth --> SupabaseClients
  AppsAPI --> DB
  AppsAPI --> ProfilesTable
  ByIdAPI --> DB
  ProfileAPI --> ProfilesTable
  SlugAPI --> DB
  ViewAPI --> DB
  SlugGenAPI --> DB
  UploadAPI --> R2Store
  AuthUsers --> SupabaseClients

  style Public fill:#dbeafe,stroke:#1d4ed8,stroke-width:2px
  style Admin fill:#dbeafe,stroke:#1d4ed8,stroke-width:2px
  style AuthPages fill:#dbeafe,stroke:#1d4ed8,stroke-width:2px
  style AppsAPI fill:#e9d5ff,stroke:#6b21a8,stroke-width:2px
  style SlugAPI fill:#e9d5ff,stroke:#6b21a8,stroke-width:2px
  style ViewAPI fill:#e9d5ff,stroke:#6b21a8,stroke-width:2px
  style ByIdAPI fill:#e9d5ff,stroke:#6b21a8,stroke-width:2px
  style AuthAPI fill:#e9d5ff,stroke:#6b21a8,stroke-width:2px
  style UploadAPI fill:#e9d5ff,stroke:#6b21a8,stroke-width:2px
  style SlugGenAPI fill:#e9d5ff,stroke:#6b21a8,stroke-width:2px
  style ProfileAPI fill:#e9d5ff,stroke:#6b21a8,stroke-width:2px
  style Auth fill:#fef3c7,stroke:#b45309,stroke-width:2px
  style SupabaseClients fill:#fef3c7,stroke:#b45309,stroke-width:2px
  style Utils fill:#fef3c7,stroke:#b45309,stroke-width:2px
  style Types fill:#fef3c7,stroke:#b45309,stroke-width:2px
  style DB fill:#d1fae5,stroke:#047857,stroke-width:2px
  style ProfilesTable fill:#d1fae5,stroke:#047857,stroke-width:2px
  style AuthUsers fill:#d1fae5,stroke:#047857,stroke-width:2px
  style R2Store fill:#d1fae5,stroke:#047857,stroke-width:2px
  style Frontend fill:#eff6ff,stroke:#1d4ed8,stroke-width:2px
  style API fill:#f5f3ff,stroke:#6b21a8,stroke-width:2px
  style Lib fill:#fffbeb,stroke:#b45309,stroke-width:2px
  style Data fill:#ecfdf5,stroke:#047857,stroke-width:2px
```

---

## 5. Layer Breakdown

### 5.1 Presentation (App Router)

| Route               | Purpose                                                                                                                                                                                                                                                                                                            | Auth |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---- |
| `/`                 | Pre-launch landing page (see [LANDING_PAGE_BRIEF.md](LANDING_PAGE_BRIEF.md)): hero, email capture form (waitlist), problem/solution, how it works, FAQ, final CTA, footer. Shares `MarketingHeader` with other marketing routes via `app/(marketing)/layout.tsx`.                                                                                                                                 | No   |
| `/how-it-works`     | How it Works marketing page: `HowItWorksHero` (heading, subtitle, CTAs above a full-width image; image stays fixed on scroll) and `HowItWorksScrollSection` (content that scrolls over the image). Uses same `MarketingHeader` as `/`.                                                                                                               | No   |
| `/pricing`          | Pricing marketing page: compact `MarketingHero` (image + `PageHeroContent` with title/subtitle), then main content. Uses same `MarketingHeader` as `/`.                                                                                                                                                                                            | No   |
| `/blog`             | Blog marketing page: compact `MarketingHero` (image + `PageHeroContent` with title/subtitle), then main content. Uses same `MarketingHeader` as `/`.                                                                                                                                                                                               | No   |
| `/login`, `/signup` | Auth forms; submit to `/api/auth/*`                                                                                                                                                                                                                                                                                | No   |
| `/auth/callback`    | Supabase email confirmation / magic link; exchanges `code` for session                                                                                                                                                                                                                                             | No   |
| `/admin`            | Dashboard: list applications, search, create/edit/archive/delete                                                                                                                                                                                                                                                   | Yes  |
| `/admin/new`        | Create application form (slug, company, role, CV upload, YouTube URL)                                                                                                                                                                                                                                               | Yes  |
| `/admin/edit/[id]`  | Edit existing application (same form, load by id)                                                                                                                                                                                                                                                                  | Yes  |
| `/admin/profile`    | Profile: account email, member since; editable profile details (first name, last name, location, portfolio URL, LinkedIn URL); application counts                                                                                                                                                                  | Yes  |
| `/view/[publicId]/[slug]` | Public application page: header (company, role, candidate name, location, portfolio/LinkedIn buttons), PDF viewer, YouTube embed when `status = active`. Archived, draft, deleted, or unknown links share one empty state (“This link doesn’t have an active application”; no application content). A compact footer (MyHireView, Terms/Privacy, ©) is shown to all viewers — owners and recruiters alike — so the candidate preview matches the recruiter experience. Candidate name, location, and links come from the application row (snapshot from profile at create/update). `noindex` and strict referrer policy apply. | No   |

Layouts:

- **Root (`app/layout.tsx`):** Global layout, fonts, metadata.
- **Marketing (`app/(marketing)/layout.tsx`):** Wraps with `HeroEntranceProvider` and `ScrollCoverProvider`, then renders `MarketingHeader` (logo, nav: How it Works, Pricing, Blog; avatar dropdown with Sign In or Dashboard + Sign out) and `children`. Used by `/`, `/how-it-works`, `/pricing`, `/blog`. The header is implemented as a module under `components/public/MarketingHeader/` (index, constants, signOut, UserDropdown, MobileMenuContent, MobileMenuToggle). On mobile, the header background is transparent over the hero and switches to white once the user has scrolled so that `ScrollCoverSection` has reached the top of the viewport (via `ScrollCoverContext` and a 1px sentinel in `ScrollCoverSection`). Mobile viewport detection uses the shared hook `hooks/useMobileViewport` (which also exports `MOBILE_BREAKPOINT_PX`).
- **Admin (`app/admin/layout.tsx`):** Calls `requireAuth()` (redirects to `/login` if not authenticated), then renders `AdminHeader` (MyHireView, Dashboard, New Application, Profile, user email, Sign out) and `children`.

API routes under `app/api/` are documented in **[API_REFERENCE.md](API_REFERENCE.md)** (endpoint index, request/response shapes, auth, and rate limits).

### 5.2 Auth & Session

- **Provider:** Supabase Auth (email/password). Config and email templates are described in `docs/SUPABASE_AUTH_SETUP.md`.
- **Session:** Cookie-based. Supabase SSR helpers read/write cookies.
- **Clients:**
  - **Server (Server Components, server-side logic):** `lib/supabase/server.ts` — `createClient()` using `cookies()` from `next/headers`.
  - **Route handler (login/signup/logout):** `lib/supabase/route-client.ts` — `createSupabaseRouteClient({ request, response })` so the response carries `Set-Cookie` headers.
  - **Admin (server-only, privileged):** `lib/supabase/admin.ts` — `createAdminClient()` using `SUPABASE_SERVICE_ROLE_KEY`; used for RLS-bypass ops (public application resolution, view/download count RPCs) and creating the initial `profiles` row at signup when there may be no session yet. Never used from the client.
  - **Middleware:** `lib/supabase/middleware.ts` — `updateSession(request)`: refreshes session and redirects unauthenticated users from `/admin` to `/login`. Intended to be invoked from root middleware (e.g. `middleware.ts` that re-exports or calls this; current entry is `proxy.ts` with matcher config).
  - **Callback:** `app/auth/callback/route.ts` — GET handler that takes `code` and `next` from query, exchanges code for session, ensures a profiles row exists (`createInitialProfile`, idempotent), redirects via `safeNextPath` to a safe same-origin `next` (default `/admin`; rejects `//…` and backslash open-redirect tricks).

### 5.3 Data (Supabase)

- **Table: `applications`**
  - `id` (UUID, PK), `slug` (unique per user), `company`, `role`, `cv_url`, `cv_type` (`primary` \| `tailored`), `primary_cv_id` (nullable FK), `video_url`, `created_at`, `updated_at`, `view_count`, `download_count`, `last_viewed_at`, `user_id`, `status` (`active` \| `draft` \| `archived`), `archived_at` (set when archived; cleared on restore).
  - **`primary_cvs`:** profile-owned CV library (max 5 per user in API); see [CV_REUSE_AND_STORAGE.md](retrospectives/CV_REUSE_AND_STORAGE.md).
  - **CV download filename:** `cv_filename` (TEXT, nullable) stores the original uploaded file name; `use_original_cv_filename` (BOOLEAN, default true) controls whether the public download uses that name or the generated `CV-{Slug}.pdf`. Set on create/update from the application form.
  - **Candidate snapshot fields** (nullable): `first_name`, `last_name`, `location`, `portfolio_url`, `linkedin_url`. These are copied from the user’s **profile** when an application is created or updated, so the recruiter view always reads from the application row (no join to profile). Existing rows may have NULLs until the next edit or a backfill.
  - **`include_name_in_slug`** (TEXT, nullable): Name position in the slug: `null` (not included), `'start'` (name-company-role), or `'end'` (company-role-name). Persisted so the edit form shows the correct choice and users can change it on save.
- **Table: `profiles`**
  - One row per user: `user_id` (PK, FK to `auth.users`), `public_id`, `first_name`, `last_name`, `location`, `portfolio_url`, `linkedin_url`, `profile_picture_url`, `updated_at`. Created at signup (`createInitialProfile`) with names + `public_id`; other columns null until the user fills them. DB columns remain nullable; product rules require first/last name at signup and on profile save. Users edit this on the profile page (and can change the picture from new/edit via a shared modal); the applications API does not expose profile directly to the public.
  - **Snapshot rule:** On POST or PUT to `/api/applications`, the server loads the current user’s profile and merges `first_name`, `last_name`, `location`, `portfolio_url`, `linkedin_url` into the insert or update. The recruiter-facing page at `/view/[publicId]/[slug]` uses only data from the application row.
  - **Public URLs:** Each user has an opaque `profiles.public_id` (assigned at signup). Application slugs are unique per user (`UNIQUE (user_id, slug)`), not globally. Share links are `/view/{public_id}/{slug}`.
- **Indexes (applications):** `slug`, `user_id`, `created_at DESC`.
- **RLS:** Enabled on both tables. Applications: users can SELECT/INSERT/UPDATE/DELETE their own rows only (no open anon SELECT — public pages resolve via the service-role client in `resolvePublicApplication`). Profiles: users can SELECT/INSERT/UPDATE their own row only.
- **Triggers:** `updated_at` maintained on update for both tables.

Types are mirrored in `lib/types/application.ts`, `lib/types/profile.ts`, and `lib/types/database.ts`.

### 5.4 File Storage (Cloudflare R2)

- **Use case:** CV PDFs only.
- **Flow (upload on save):** The form keeps the selected PDF in memory until the user saves. On submit, the client uploads to `/api/upload` → API validates type (PDF) and size (3MB max) → `PutObject` to R2 → returned public URL is stored in `applications.cv_url`. When editing, if the user replaces the CV, the new file is uploaded on save and the previous object is deleted. When an application is deleted, its CV object is also deleted. See **docs/PDF_AND_R2.md** for full details.

Video is not stored; only YouTube URLs are stored and embedded via `YouTubeEmbed` and `lib/utils/youtube.ts`.

### 5.5 Profile pictures (Supabase Storage)

- **Use case:** One profile picture per user at `{user_id}/avatar.{ext}`, uploaded on profile Save. Applications store only `show_profile_picture`; the public view reads the live URL from `profiles` when that flag is true. See **docs/PROFILE_PICTURE.md**.

---

## 6. Key Flows

### 6.1 Authentication (login)

```mermaid
sequenceDiagram
  participant U as User
  participant L as Login Page
  participant API as /api/auth/login
  participant Supa as Supabase Auth
  participant MW as Middleware

  U->>L: Submit email + password
  L->>API: POST { email, password }
  API->>API: createSupabaseRouteClient(request, response)
  API->>Supa: signInWithPassword()
  Supa-->>API: session
  API->>API: Set session cookies on response
  API-->>L: 200 + Set-Cookie
  L->>U: Redirect to /admin
  U->>MW: Request /admin
  MW->>Supa: getUser() (refresh session from cookies)
  MW-->>U: Allow /admin
```

### 6.2 Create application

```mermaid
sequenceDiagram
  participant U as User
  participant Form as ApplicationForm
  participant SlugAPI as /api/slug
  participant AppsAPI as /api/applications
  participant UploadAPI as /api/upload
  participant Supa as Supabase
  participant R2 as Cloudflare R2

  U->>Form: Fill company, role, select PDF (held in memory), YouTube URL
  U->>Form: Submit
  Form->>UploadAPI: POST FormData (file) on submit
  UploadAPI->>R2: PutObject (PDF)
  R2-->>UploadAPI: url
  UploadAPI-->>Form: { url }
  Form->>SlugAPI: POST { company, role }
  SlugAPI->>Supa: check uniqueness, generate slug
  SlugAPI-->>Form: { slug }
  Form->>AppsAPI: POST { company, role, slug, cv_url, video_url, ... }
  AppsAPI->>AppsAPI: requireAuth()
  AppsAPI->>Supa: select profile by user_id
  Supa-->>AppsAPI: profile (first_name, last_name, location, portfolio_url, linkedin_url)
  AppsAPI->>AppsAPI: merge profile snapshot into insert
  AppsAPI->>Supa: insert application (with snapshot)
  Supa-->>AppsAPI: data
  AppsAPI-->>Form: 201 { data }
  Form->>U: Redirect to /admin
```

### 6.3 Public view and view tracking

```mermaid
sequenceDiagram
  participant R as Recruiter
  participant Page as /view/[publicId]/[slug]
  participant SlugAPI as GET /api/applications/[slug]
  participant ViewAPI as POST /api/.../view
  participant VT as ViewTracker
  participant Supa as Supabase

  R->>Page: Open /view/k7x2m9ab/my-company-role
  Page->>SlugAPI: fetch(slug)
  SlugAPI->>Supa: select by slug (full row, includes candidate name, location, portfolio_url, linkedin_url)
  Supa-->>SlugAPI: application
  SlugAPI-->>Page: { data }
  Page->>Page: Render header (company, role, candidate name, location, portfolio/LinkedIn buttons) + PDF + YouTube
  Page->>VT: Mount ViewTracker(slug)
  VT->>VT: sessionStorage already tracked?
  VT->>ViewAPI: POST (if not tracked)
  ViewAPI->>ViewAPI: per-IP + per-path rate limits; httpOnly dedupe cookie?
  alt cookie present
    ViewAPI-->>VT: 200 (no increment)
  else
    ViewAPI->>ViewAPI: get viewer via auth.getUser(); skip increment if owner
    ViewAPI->>Supa: RPC increment_application_view_count (non-owner only, service_role)
    ViewAPI-->>VT: 200 + Set-Cookie dedupe
  end
  VT->>VT: sessionStorage set tracked
```

View count and `last_viewed_at` are only updated when the viewer is not the application owner; the applicant can open their own link without affecting the count or last-viewed time. Repeats within 24h are suppressed by an httpOnly dedupe cookie (client `sessionStorage` only avoids extra POSTs). The increment is performed by a SECURITY DEFINER function callable only by the service role (see **docs/VIEW_COUNT_FIX.md**).

**CV download count:** When a visitor clicks "Download CV" on the public view page, `PDFViewer` calls `POST /api/applications/[slug]/download` (client `sessionStorage` + same server httpOnly dedupe cookie). The download API increments `download_count` via the `increment_application_download_count` SECURITY DEFINER RPC (service_role only), mirroring the view-count behaviour; see **docs/VIEW_COUNT_FIX.md**. The downloaded file name is either the original upload name (when `use_original_cv_filename` is true and `cv_filename` is set) or the generated name `CV-{Slug}.pdf`.

### 6.4 Profile and snapshot into applications

- **Profile page:** User opens `/admin/profile`. Server fetches `profiles` row by `user_id` (no row yet is allowed). Client form (ProfileForm) shows first name, last name, location, portfolio URL, LinkedIn URL. On save, client PUTs to `/api/profile` with the edited fields; API validates URLs (http/https) and upserts the profile row.
- **Profile API:** GET returns the current user’s profile row, creating one with nulls if missing. PUT accepts partial updates, merges with existing row, and upserts.
- **Candidate fields on create (POST):** The new-application form shows the user’s profile as a preview (name, location, portfolio URL, LinkedIn URL) above the application form. Users can toggle each field on/off (off stores null so recruiters don’t see it) and edit values; edits apply only to this application. The client sends candidate fields in the POST body; if provided, the API uses them, otherwise it falls back to a profile snapshot.
- **Candidate fields on edit (PUT):** When editing an existing application, the form is pre-filled from the application row only. Users can toggle and edit as above. The API updates only the application row from the request body; the profile table is never updated from the application form. Profile is updated only via the profile page and `/api/profile`.
- **Recruiter view:** Recruiters see data from the application row only (name, location, portfolio/LinkedIn when non-null).

---

## 7. Security Summary

- **Auth:** Supabase handles passwords and sessions; middleware protects `/admin`; API routes use `requireAuth()` where needed.
- **Data:** RLS ensures users only read/modify their own applications; public share URLs are served by Next.js APIs that resolve via the service-role client (not an open anon SELECT policy).
- **Upload:** PDF-only, size limit; `POST /api/upload` requires auth and an idempotency key. Profile pictures use a separate authenticated upload to Supabase Storage.
- **Slug:** Unique per application; generation is deterministic from company/role with collision handling; no sensitive data in slug. `POST /api/slug` is currently unauthenticated (consider tightening); `POST /api/slug/validate` requires auth.

---

## 8. Project Structure (Summary)

```
my-hire-view/
├── app/
│   ├── layout.tsx              # Root layout
│   ├── (marketing)/            # Public marketing routes (shared MarketingHeader)
│   │   ├── layout.tsx          # Marketing layout (header + children)
│   │   ├── page.tsx            # Home (landing)
│   │   ├── how-it-works/       # How it Works page
│   │   ├── pricing/            # Pricing page
│   │   └── blog/               # Blog page
│   ├── login/, signup/         # Auth pages
│   ├── auth/callback/          # Supabase OAuth/email callback
│   ├── admin/                  # Dashboard, new, edit (layout uses requireAuth)
│   ├── view/[slug]/            # Public application route (page, loading, not-found)
│   └── api/                    # All API routes (see docs/API_REFERENCE.md)
├── components/
│   ├── admin/                  # AdminDashboardEmpty, AdminDashboardError, AdminDashboardSkeleton, AdminHeader, ApplicationCard, SearchBar
│   ├── auth/                   # SignOutButton
│   ├── forms/                  # ApplicationForm, CandidateFieldsSection, CandidateFieldRow, ApplicationFormActions, ProfilePictureField, ProfilePictureModal, NameInUrlField, CvSourceField, FileUpload, PrimaryCvLibrarySection, PrimaryCvLibraryModal, PrimaryCvUsedByPreview, ProfileForm, YouTubeUrlInput
│   ├── pdf/                    # PDFViewer
│   ├── public/                 # ApplicationPageHeader, EmailCaptureForm, FAQSection (re-export from public/faq), FinalCTASection, Footer (→ ViewPageFooter marketing footer), HomeHeroContent, HowItWorksHero (How it Works page: content above + fixed image), HowItWorksScrollSection (content that scrolls over fixed hero image), HowItWorksSection (see public/how-it-works/ for StepLabel, StepCard, useHowItWorksObservers, constants; on home page receives isDarkMode from LandingPageSections), LandingPageSections (owns single IntersectionObserver for ProblemSection wrapper; passes isDarkMode to HowItWorksSection, ProblemSection, and FAQSection—one prop name, one source of truth), public/faq/ (FAQSection, FAQItem, FAQContactCard, constants; isDarkMode prop from parent), MarketingHero (reusable: backgroundImage + children + optional imageCredit), MarketingHeader, PageHeroContent (reusable title + subtitle for Pricing / Blog), ProblemSection, SolutionSection, ViewPageFooter (full marketing footer; application pages use ApplicationViewFooter)
│   ├── ui/                     # Button, Input, Textarea
│   ├── video/                  # YouTubeEmbed
│   └── view/                   # ApplicationViewFooter, ViewPageContent, UnavailableApplicationView, ViewTracker (public application page UI)
├── hooks/                      # useApplications (admin dashboard state + API)
├── lib/
│   ├── api/                    # applications (client: fetch, delete, archive, restore)
│   ├── auth.ts                 # getUser, requireAuth
│   ├── supabase/               # server, route-client, middleware, client, env
│   ├── types/                  # application, profile, database
│   └── utils/                  # url, slug, slug-generate, youtube, clipboard
├── supabase/migrations/        # ordered SQL (001–025); apply all in numeric order
├── proxy.ts                    # Middleware entry (session + /admin guard)
└── docs/                       # ARCHITECTURE, API_REFERENCE, CI_CD, CODE_REVIEW, SUPABASE_AUTH_SETUP
```

---

## 9. Design Decisions (Summary)

| Decision                        | Rationale                                                                                                                                                                                                                                                    |
| ------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Next.js App Router              | Single codebase for SSR, API, and client components; good fit for auth and public/private routes.                                                                                                                                                            |
| Supabase                        | Managed Postgres + Auth + RLS in one product; reduces custom backend code.                                                                                                                                                                                   |
| Slug-based public URLs          | Stable, shareable links that don’t expose internal IDs; uniqueness enforced in DB and slug API. Users can optionally include their name at the start (name-company-role) or end (company-role-name) of the slug.                                             |
| Cloudflare R2 for PDFs        | S3-compatible object storage with no egress fees from R2; pairs well with Next.js on Vercel.                                                                                                                                                               |
| View count in DB                | Simple and accurate; one increment per browser path (httpOnly cookie + client `sessionStorage`), with per-IP and per-path rate limits.                                                                                                                                                                       |
| Last viewed at in DB            | Set to current time whenever view_count is incremented (non-owner only); null if never viewed.                                                                                                                                                               |
| Download count in DB            | Same pattern as view count; one increment per download (per session), owner downloads not counted.                                                                                                                                                           |
| `status` + `archived_at` for archive | Soft hide via `status = archived`; `archived_at` resets when re-archiving (90-day retention clock). Hard purge deferred. See [CV_REUSE_AND_STORAGE.md](retrospectives/CV_REUSE_AND_STORAGE.md). |
| Route client for auth APIs      | Login/signup/logout must write cookies on the response; route client is the pattern recommended by Supabase for Next.js.                                                                                                                                     |
| Profile snapshot on application | Candidate name, location, portfolio URL, and LinkedIn URL are stored in `profiles` and copied into each application row on create/update. Recruiters read only from the application row, giving a stable snapshot and no auth dependency on the public view. |

---

For setup and auth configuration, see [README.md](../README.md) and [SUPABASE_AUTH_SETUP.md](SUPABASE_AUTH_SETUP.md). For the full API catalog, see [API_REFERENCE.md](API_REFERENCE.md). For CI/CD pipeline architecture, see [CI_CD.md](CI_CD.md). For code quality and refactors, see [CODE_REVIEW.md](CODE_REVIEW.md).
