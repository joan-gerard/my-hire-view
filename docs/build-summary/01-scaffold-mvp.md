# Scaffold & MVP

Commit-by-commit detail for the initial scaffold and MVP. See [BUILD_SUMMARY.md](../BUILD_SUMMARY.md) for the full index.

---

## 1. Initial commit from Create Next App

**Commit:** `19a1111`  
**Intent:** Project scaffold.

**Created:**

- **Config & tooling:** `.gitignore`, `eslint.config.mjs`, `next.config.ts`, `tsconfig.json`, `postcss.config.mjs`, `package.json`, `pnpm-lock.yaml`, `pnpm-workspace.yaml`
- **App shell:** `app/layout.tsx`, `app/page.tsx`, `app/globals.css`, `app/favicon.ico`
- **Assets:** `public/file.svg`, `public/globe.svg`, `public/next.svg`, `public/vercel.svg`, `public/window.svg`
- **Docs:** `README.md`

Standard Next.js app bootstrap; no HireView-specific logic yet.

---

## 2. first commit

**Commit:** `dcf670a`  
**Intent:** First project-specific change.

**Updated:**

- `README.md` — adjusted for the new project (content not captured in git diff; reflects initial product description).

---

## 3. create prompt

**Commit:** `9ddb9fa`  
**Intent:** Capture project context for AI assistance.

**Created:**

- `CURSOR_PROMPT.md` — project prompt / context for Cursor.

---

## 4. feat: add HireView — recruiter landing pages with auth, admin and public apply

**Commit:** `604c19d`  
**Intent:** Deliver the core product: recruiter landing pages, auth, admin dashboard, and public apply/view flow.

**Created:**

- **Cursor:** `.cursor/commands/write-a-commit-message.md`
- **Admin:** `app/admin/layout.tsx`, `app/admin/page.tsx`, `app/admin/new/page.tsx`, `app/admin/edit/[id]/page.tsx`, `app/admin/SignOutButton.tsx`, plus `loading.tsx` for admin, new, and edit
- **API:**  
  `app/api/applications/route.ts`, `app/api/applications/[slug]/route.ts`, `app/api/applications/[slug]/view/route.ts`, `app/api/applications/by-id/[id]/route.ts`,  
  `app/api/auth/login/route.ts`, `app/api/auth/logout/route.ts`, `app/api/auth/signup/route.ts`,  
  `app/api/slug/route.ts`, `app/api/upload/route.ts`
- **Public apply flow:** `app/apply/[slug]/page.tsx`, `app/apply/[slug]/loading.tsx`, `app/apply/[slug]/not-found.tsx`, `app/apply/[slug]/ViewTracker.tsx`
- **Auth:** `app/auth/callback/route.ts`, `app/login/page.tsx`, `app/signup/page.tsx`
- **Shared UI:** `app/error.tsx`, `app/not-found.tsx`
- **Components:**  
  `components/admin/ApplicationCard.tsx`, `components/admin/SearchBar.tsx`,  
  `components/forms/ApplicationForm.tsx`, `components/forms/FileUpload.tsx`, `components/forms/YouTubeUrlInput.tsx`,  
  `components/pdf/PDFViewer.tsx`, `components/public/ApplicationHeader.tsx`,  
  `components/ui/Button.tsx`, `components/ui/Input.tsx`, `components/ui/Textarea.tsx`,  
  `components/video/YouTubeEmbed.tsx`
- **Lib:** `lib/auth.ts`, `lib/supabase/client.ts`, `lib/supabase/env.ts`, `lib/supabase/middleware.ts`, `lib/supabase/route-client.ts`, `lib/supabase/server.ts`,  
  `lib/types/application.ts`, `lib/types/database.ts`,  
  `lib/utils/clipboard.ts`, `lib/utils/slug-generate.ts`, `lib/utils/slug.ts`, `lib/utils/url.ts`, `lib/utils/youtube.ts`
- **Docs:** `docs/CODE_REVIEW.md`, `docs/SUPABASE_AUTH_SETUP.md`
- **DB:** `supabase/migrations/001_initial_schema.sql`, `supabase/migrations/002_add_application_is_active.sql`
- **Dev:** `proxy.ts`

**Updated:**

- `app/layout.tsx`, `app/page.tsx` — integrated auth and landing
- `CURSOR_PROMPT.md`, `README.md`, `package.json`, `pnpm-lock.yaml` — deps and project description

Result: end-to-end flow: sign up/in, create/edit applications (slug, CV, video, description), shareable `/apply/[slug]` page with view tracking, Supabase + Vercel Blob.

---

## 5. update cursor command

**Commit:** `631252a`  
**Intent:** Improve Cursor commit-message workflow.

**Updated:**

- `.cursor/commands/write-a-commit-message.md` — refined instructions (e.g. no double quotes in messages).

---

## 6. fix(admin): normalize application to form data in edit page

**Commit:** `4005c55`  
**Intent:** Bug fix so the edit form is populated correctly from the database.

**Updated:**

- `app/admin/edit/[id]/page.tsx` — instead of passing the raw `application` from the API into the form, build an `initialData` object that normalizes the DB shape to the form shape (e.g. `null` → `undefined` for optional fields). Fixes incorrect or missing values when editing.
- `.cursor/commands/write-a-commit-message.md` — minor tweak.

**Bug fixed:** Edit form could show wrong or empty values when loading an existing application.

---

## 7. add Architecture document

**Commit:** `927f0b3`  
**Intent:** Document system design and architecture.

**Created:**

- `docs/ARCHITECTURE.md` — overview, tech stack, high-level architecture, component view, data model, auth, key flows.

**Updated:**

- `README.md` — link or reference to architecture (as appropriate).

---
