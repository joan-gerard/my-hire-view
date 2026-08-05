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
- **View and download counts** are tracked via Supabase RPCs (owner views excluded; server httpOnly dedupe cookie + client `sessionStorage` optimization; per-IP and per-path rate limits).

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
- View/download dedup: server httpOnly cookie (24h) + client `sessionStorage`.
- CV files are stored on Cloudflare R2; profile pictures on Supabase Storage.

RLS policies protect all tables. The service-role Supabase client is used server-side only for privileged operations (analytics RPCs, waitlist inserts).

---

## 6. Authentication & Authorization

- **Supabase Auth** with email/password; sessions stored in HTTP cookies via `@supabase/ssr`.
- `**proxy.ts`\*\* refreshes the session and guards all `/admin` routes.
- `**requireAuth()**` in `lib/auth.ts` is used inside API route handlers to get the authenticated user.
- **RLS** on `applications` and `profiles` enforces data isolation at the database level.
- **Public read** of applications by slug is permitted (recruiter view requires no login).

See `docs/SUPABASE_AUTH_SETUP.md` for full setup details.

---

## 7. Testing & CI

- **Vitest** is configured as the test runner (`vitest.config.ts`).
- `pnpm test` — interactive watch mode; `pnpm test:ci` — single run (used in CI).
- Test files live in `__tests__/unit/` and a shared helper in `__tests__/helpers/`.
- **CI:** GitHub Actions runs `pnpm test:ci` on every pull request and on pushes to `main` (A1-002). Local Husky **pre-push** runs the same command before `git push`. Pipeline architecture: [CI_CD.md](CI_CD.md).

### What is covered

| Area                                                                                              | File(s)                                                          |
| ------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------- |
| Pure slug utilities (`generateSlug`, `buildSlug`, `validateSlugFormat`)                           | `__tests__/unit/lib/utils/slug-generate.test.ts`                 |
| Server-side slug helpers (`checkSlugUniqueness`, `validateSlugForApplication`, `reserveBaseSlug`) | `__tests__/unit/lib/utils/slug.test.ts`                          |
| In-memory rate limiter (`rateLimit`, `checkRateLimit`, `rateLimit429`, `getClientIdentifier`)     | `__tests__/unit/lib/rate-limit.test.ts`                          |
| Profile flow (GET + PUT `/api/profile`)                                                           | `__tests__/unit/api/profile.test.ts`                             |
| Create-application flow (POST `/api/applications`, POST `/api/slug`, POST `/api/slug/validate`)   | `__tests__/unit/api/applications-create.test.ts`, `slug.test.ts` |
| Edit-application flow (PUT `/api/applications`, GET `/api/applications/by-id/[id]`)               | `__tests__/unit/api/applications-edit.test.ts`                   |
| Public-view flow (GET `/api/applications/[slug]`, POST `/api/applications/[slug]/view`)           | `__tests__/unit/api/applications-public-view.test.ts`            |

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

## 9. Planned work

Open pre-launch and post-launch work (gaps, TODOs, improvements) lives in **[Backlog.md](Backlog.md)** — the canonical tracker. This overview does not maintain a parallel checklist.

---

## 10. Notable Strengths

- Well-structured internal docs in `docs/` (ARCHITECTURE, API_REFERENCE, CI_CD, DATA_FLOW, BUILD_SUMMARY, CODE_REVIEW, etc.).
- Clear separation between marketing and product surfaces.
- Security-conscious patterns: RLS, owner exclusion from analytics, URL validation, PDF type/size validation.
- CSS design system with CSS variables (warm neutrals, brand colors) and consistent typography.
- Clean component breakdown across `public/`, `admin/`, `forms/`, `pdf/`, `video/`, `view/`, `ui/`.

---

## Summary

The **core product loop** (create application → share link → recruiter views page with PDF + video) is **functionally complete and well-architected**. Launch blockers and remaining planned work are tracked in **[Backlog.md](Backlog.md)**.
