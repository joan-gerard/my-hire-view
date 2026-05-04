# MyHireView — Project Overview

> Last updated: May 4, 2026

A high-level catch-up document covering the product, tech stack, architecture, business logic, data model, and pre-launch gaps.

---

## 1. What is MyHireView?

**MyHireView** is a tool for job seekers that lets them create a **dedicated landing page per job application** — combining their CV (PDF), a video pitch (YouTube URL), and their contact info — all accessible via a shareable public link that recruiters can open without logging in.

There are two distinct surfaces:

- **Marketing site** (`/`) — home, how it works, pricing, blog, waitlist signup. Currently in pre-launch mode.
- **Product** (`/admin`) — authenticated dashboard to create, manage, and track applications.

---

## 2. Tech Stack


| Area              | Choice                                              |
| ----------------- | --------------------------------------------------- |
| Framework         | Next.js 16 (App Router)                             |
| UI                | React 19, Tailwind CSS 4, Framer Motion             |
| Fonts / Icons     | Geist, FaunaOne, FunnelSans, `react-icons`          |
| Auth + DB         | Supabase (email/password, PostgreSQL, RLS, Storage) |
| CV storage        | Cloudflare R2                                       |
| Video             | YouTube embed (URL only, no upload)                 |
| Language          | TypeScript 5 (strict mode)                          |
| Package manager   | pnpm                                                |
| Deployment target | Vercel                                              |


---

## 3. Architecture

Single Next.js app (no monorepo). All UI, API routes, and session logic live in one deployable.

### Directory structure

```
app/
  (marketing)/       — marketing pages with shared layout
  admin/             — protected dashboard (list, new, edit, profile)
  view/[slug]/       — public recruiter-facing application page
  login/             — sign-in page
  signup/            — sign-up page
  auth/callback/     — Supabase email confirmation / magic link handler
  api/               — Route Handlers (auth, applications, slug, upload, profile, waitlist, analytics)

components/
  public/            — marketing components
  admin/             — dashboard components
  forms/             — ApplicationForm and related
  pdf/               — PDF viewer components
  video/             — YouTube embed components
  view/              — public view page components
  ui/                — shared primitives

lib/
  supabase/          — clients: server, route-client, middleware, admin (service role)
  api/               — client-side API call helpers
  types/             — TypeScript types including database.ts
  utils/             — slug, URL, YouTube, CV storage helpers
  auth.ts            — requireAuth() helper
  rate-limit.ts      — in-memory rate limiting

hooks/
  useApplications.ts — application list state for the dashboard

supabase/
  migrations/        — 001–019 ordered SQL migrations

docs/                — internal documentation
```

### Session / auth flow

`**proxy.ts**` (Next.js 16 replacement for `middleware.ts`) refreshes the Supabase session cookie on every request and redirects unauthenticated users away from `/admin`.

---

## 4. Core Business Logic

### Creating an application

1. User fills in company, role, candidate fields (name in URL, profile picture, CV download filename).
2. CV PDF is uploaded to **Cloudflare R2** via `POST /api/upload`.
3. A slug is generated via `POST /api/slug`.
4. The full application record is saved via `POST /api/applications`.

### Public view (recruiter-facing)

- `GET /api/applications/[slug]` fetches the application.
- Page renders a PDF viewer (`react-pdf` + `pdfjs-dist`) and a YouTube embed.
- **View and download counts** are tracked via Supabase RPCs (owner views excluded; session-scoped dedup via `sessionStorage`).

### Admin dashboard

- `useApplications` hook drives the application list.
- Applications can be searched, archived/restored, and deleted.
- Edit flow loads the application by ID, allows PDF replacement (old R2 object removed), and saves via `PUT /api/applications`.

### Waitlist

- `POST /api/waitlist` — validated body, rate-limited, inserts into `waitlist_signups` via service role.

---

## 5. Data Model (Supabase PostgreSQL)


| Table              | Key fields                                                                                                                                                                                                 |
| ------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `applications`     | `slug`, `company`, `role`, `cv_url`, `video_url`, `view_count`, `download_count`, `last_viewed_at`, `is_active`, `user_id`, candidate snapshot fields, profile picture visibility, CV filename preferences |
| `profiles`         | One row per user: `first_name`, `last_name`, `location`, `linkedin_url`, `portfolio_url`, `profile_picture_url`                                                                                            |
| `waitlist_signups` | `email`, `name`, job search status, segmentation fields                                                                                                                                                    |


**State management:**

- Server state lives in Supabase + HTTP cookies.
- Client state is managed with React `useState` in forms and `useApplications`.
- View/download dedup uses `sessionStorage`.
- CV files are stored on Cloudflare R2; profile pictures on Supabase Storage.

RLS policies protect all tables. The service-role Supabase client is used server-side only for privileged operations (analytics RPCs, waitlist inserts).

---

## 6. Authentication & Authorization

- **Supabase Auth** with email/password; sessions stored in HTTP cookies via `@supabase/ssr`.
- `**proxy.ts`** refreshes the session and guards all `/admin` routes.
- `**requireAuth()**` in `lib/auth.ts` is used inside API route handlers to get the authenticated user.
- **RLS** on `applications` and `profiles` enforces data isolation at the database level.
- **Public read** of applications by slug is permitted (recruiter view requires no login).

See `docs/SUPABASE_AUTH_SETUP.md` for full setup details.

---

## 7. Testing & CI

- **No test files exist** — no Jest, Vitest, or any test runner is configured.
- **No `test` or `test:ci` script** in `package.json`.
- **No CI/CD pipeline** — no GitHub Actions or equivalent.

This is the most significant gap before a production launch.

---

## 8. Environment Variables


| Variable                                                                                            | Purpose                                                                     |
| --------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`                                                                          | Supabase project URL (public)                                               |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY`                                                                     | Supabase anon key (public)                                                  |
| `SUPABASE_SERVICE_ROLE_KEY`                                                                         | Server-only; used for privileged RPCs and waitlist inserts                  |
| `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET_NAME`, `R2_PUBLIC_BASE_URL` | Cloudflare R2 for CV PDFs (server-only); see [PDF_AND_R2.md](PDF_AND_R2.md) |
| `NEXT_PUBLIC_SITE_URL`                                                                              | Optional; falls back to localhost in `lib/utils/url.ts`                     |


> Note: `.env.local.example` lists required variables including R2 credentials for CV uploads.

---

## 9. Pre-Launch Gaps & TODOs

### Must fix (production hardening)


| Issue                           | Location            | Notes                                                                                                    |
| ------------------------------- | ------------------- | -------------------------------------------------------------------------------------------------------- |
| `/api/slug` has no auth check   | `app/api/slug/`     | Lower risk but worth tightening.                                                                         |
| In-memory rate limiting         | `lib/rate-limit.ts` | Resets per serverless instance; not safe across concurrent Vercel instances. Replace with Redis/Upstash. |
| No automated tests              | —                   | No test runner configured at all.                                                                        |
| No CI/CD                        | —                   | No automated pipeline on push/PR.                                                                        |


### Nice to have before launch

- **README is outdated** — still contains create-next-app boilerplate at the top; migration list only covers `001–006` but the repo is now at `019`.
- **Pricing and Blog pages** are placeholders — fine for a waitlist launch, not for full public launch.
- **Pricing & membership tiers** — think through plan structure (what stays free vs paid), per-tier limits, price points, and how `/pricing` presents tiers so it matches the real offering once billing exists (pairs with the payment integration item below).
- `**.env.local.example`** is missing — add it back for onboarding clarity.
- `**MarketingHero_Old.tsx**` is still referenced on pricing/blog — clean up or replace.
- **Blog** has no real content yet.
- **How It Works page** (`/how-it-works`) is nearly a duplicate of the homepage content — needs its own dedicated, more detailed content.
- **Branding on `/admin` and `/view` pages** is outdated — both still use the previous brand; needs updating to match the current visual identity.
- **Support for technical issues** — add a support button or section (marketing, dashboard, and/or public view) so users can report bugs or other technical problems (e.g. mailto link, simple feedback form, or a lightweight third-party tool).
- **Payment / membership system** — no payment integration exists yet. Need to integrate a payment provider (e.g. Stripe) to gate features behind a paid membership, covering plan management, checkout flow, webhooks, and Supabase subscription state.
- **In-app video recording** — currently only a YouTube URL can be provided. Users should be able to record a video pitch directly in the browser (via `MediaRecorder` API). Needs a decision on storage: generic object storage is possible for small raw files, but a dedicated video platform (e.g. **Mux**, **Cloudflare Stream**) is usually better for encoding, adaptive streaming, and bandwidth at scale. The recorded video URL would replace the current `video_url` field, or the two could coexist as separate source types.
- **Teleprompter UI for recording** — when recording in-app, display a scrolling script overlay so the user can read their pitch while looking at the camera. Needs a script input field on the application form, auto-scroll speed control, and a fullscreen/overlay mode that doesn't obscure the webcam feed.

---

## 10. Notable Strengths

- Well-structured internal docs in `docs/` (ARCHITECTURE, DATA_FLOW, BUILD_SUMMARY, CODE_REVIEW, etc.).
- Clear separation between marketing and product surfaces.
- Security-conscious patterns: RLS, owner exclusion from analytics, URL validation, PDF type/size validation.
- CSS design system with CSS variables (warm neutrals, brand colors) and consistent typography.
- Clean component breakdown across `public/`, `admin/`, `forms/`, `pdf/`, `video/`, `view/`, `ui/`.

---

## Summary

The **core product loop** (create application → share link → recruiter views page with PDF + video) is **functionally complete and well-architected**. The main blockers before a real production launch are **rate limiting durability** and the **complete absence of automated testing and CI**, alongside the remaining rows in the pre-launch table above. The marketing site is in good shape for a waitlist/early-access launch as-is.