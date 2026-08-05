This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started.

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

# MyHireView

Personalized recruiter landing pages: create shareable pages with your CV (PDF) and video pitch per application.

## Setup

1. Install dependencies: `pnpm install`
2. Copy `.env.local.example` to `.env.local` and fill in Supabase and Cloudflare R2 values.
3. Run the SQL migrations in the Supabase SQL Editor (in order): `001_initial_schema.sql`, `002_add_application_is_active.sql`, `003_profiles_table.sql`, `004_application_candidate_fields.sql`, `005_application_include_name_in_slug.sql`, `006_slug_name_position_text.sql`
4. **Configure Supabase Auth**: see [docs/SUPABASE_AUTH_SETUP.md](docs/SUPABASE_AUTH_SETUP.md) to enable the Email provider and optional email templates.
5. Ensure Supabase **Redirect URLs** include `/auth/callback` for email links.

## Development

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

## Security & data access

Profile and account data are retrieved in a way that is safe and consistent with your Supabase setup:

- **Auth user data:** Identity (email, id, created_at) comes only from **Supabase Auth** via `getUser()` / `requireAuth()`. The server uses the session cookie; Supabase returns only the current user. No raw access to `auth.users` from app code.
- **Applications:** Row Level Security (RLS) is enabled on `applications`. Users can SELECT/INSERT/UPDATE/DELETE only their own rows (`auth.uid() = user_id`). The profile page and APIs use the server client and `requireAuth()`, then filter by `user.id`, so they only ever read or write the signed-in user’s data.
- **Profile page:** `/admin/profile` is behind the same admin layout as the dashboard; it uses `requireAuth()` and only displays the current user’s email, “member since”, and application counts fetched with RLS-scoped queries.

So **yes** — the current Supabase implementation and RLS policies allow for **safe retrieval of user data** for the account owner on the profile page and elsewhere in the admin area.

## Documentation

- **[Build summary](docs/BUILD_SUMMARY.md)** — Chronological summary of what was built commit-by-commit; full detail is split by phase (scaffold, PRs 1–6) in `docs/build-summary/`.
- **[Architecture & system design](docs/ARCHITECTURE.md)** — High-level architecture, tech stack, data model, key flows, and Mermaid diagrams.
- **[CI/CD pipeline](docs/CI_CD.md)** — GitHub Actions workflows, quality gates, and pipeline roadmap.
- **[API reference](docs/API_REFERENCE.md)** — Catalog of all `/api` routes: methods, auth, rate limits, request/response shapes.
- **[Data flow](docs/DATA_FLOW.md)** — Mermaid diagrams for auth, profile, create/edit application, and public view.
- **[User guide](docs/USER_GUIDE.md)** — What candidates and recruiters can do with the app.
- **[Supabase Auth setup](docs/SUPABASE_AUTH_SETUP.md)** — Email provider and email templates.
- **[Code review notes](docs/CODE_REVIEW.md)** — Refactors and best practices.
- **[PDFs and Cloudflare R2](docs/PDF_AND_R2.md)** — How CV PDFs are uploaded, stored, and deleted.
