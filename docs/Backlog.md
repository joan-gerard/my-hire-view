# MyHireView — Backlog

Consolidated planned work from existing docs. Source docs stay the living detail; sync this file when work ships or priorities change.

**Sources:** [PROJECT_OVERVIEW.md](PROJECT_OVERVIEW.md) · [API_REFERENCE.md](API_REFERENCE.md) · [CODE_REVIEW.md](CODE_REVIEW.md) · [LANDING_PAGE_BRIEF.md](LANDING_PAGE_BRIEF.md) · [product-ideas/ai-powered-interview-preparation.md](product-ideas/ai-powered-interview-preparation.md)

**MoSCoW:** **M**ust · **S**hould · **C**ould · **W**on’t (this time)

---

## Before launch

Work needed before a public launch with paid access (free tier / trial only — not unlimited free use of the app).

### Must

| Subcategory | Item | Notes | Source |
| ----------- | ---- | ----- | ------ |
| Security | Auth on `POST /api/slug` | No auth today; align with `/api/slug/validate`. | [PROJECT_OVERVIEW.md](PROJECT_OVERVIEW.md), [API_REFERENCE.md](API_REFERENCE.md), [CODE_REVIEW.md](CODE_REVIEW.md) |
| Infrastructure | Durable rate limiting | Replace in-memory `lib/rate-limit.ts` with Redis/Upstash (or similar). | [PROJECT_OVERVIEW.md](PROJECT_OVERVIEW.md) |
| Infrastructure | CI/CD | Run `pnpm test:ci` automatically on push/PR. | [PROJECT_OVERVIEW.md](PROJECT_OVERVIEW.md) |
| API | Whitelist `PUT /api/applications` fields | Avoid mass-assignment risk (`user_id`, counts, etc.). | [API_REFERENCE.md](API_REFERENCE.md) |
| API | Validate / own `cv_url` on create & update | Reject URLs outside this app’s R2 public base. | [API_REFERENCE.md](API_REFERENCE.md) |
| Marketing | Remove `/how-it-works` and `/blog` routes | Delete placeholder pages before launch; drop nav links in `MarketingHeader`; clean up page-only components left unused (e.g. blog-only hero usage). | [PROJECT_OVERVIEW.md](PROJECT_OVERVIEW.md) |
| Product | Pricing & membership tiers | Define plans (paid + optional free tier / trial), per-tier limits, price points. Do **not** launch with unlimited free app access. | [PROJECT_OVERVIEW.md](PROJECT_OVERVIEW.md) |
| Product | Payment / membership system | Stripe (or similar): checkout, webhooks, Supabase subscription state; gate creating/using applications behind an active plan or trial. | [PROJECT_OVERVIEW.md](PROJECT_OVERVIEW.md) |
| Marketing | Pricing page beyond placeholder | Ship real tiers on `/pricing` aligned with billing — not a stub. | [PROJECT_OVERVIEW.md](PROJECT_OVERVIEW.md) |

### Should

| Subcategory | Item | Notes | Source |
| ----------- | ---- | ----- | ------ |
| Branding | Update `/admin` and `/view` branding | Still on previous visual identity. | [PROJECT_OVERVIEW.md](PROJECT_OVERVIEW.md) |
| Docs / DX | Refresh README | Still create-next-app boilerplate; migrations list outdated. | [PROJECT_OVERVIEW.md](PROJECT_OVERVIEW.md) |
| Support | Technical support entry point | Mailto, simple form, or lightweight tool on marketing / dashboard / view. | [PROJECT_OVERVIEW.md](PROJECT_OVERVIEW.md) |
| Marketing | Clean up `MarketingHero_Old.tsx` | Still referenced on pricing/blog — remove or replace (ties to route cleanup above). | [PROJECT_OVERVIEW.md](PROJECT_OVERVIEW.md) |
| API | Schema validation on write routes | Zod (or similar) for bodies/params; clear **400**s. | [API_REFERENCE.md](API_REFERENCE.md), [CODE_REVIEW.md](CODE_REVIEW.md) |
| API | Shared auth vs error handling | `withAuth` / `handleApiError` so failures aren’t mislabeled **401**. | [API_REFERENCE.md](API_REFERENCE.md), [CODE_REVIEW.md](CODE_REVIEW.md) |
| API | Public application DTO | Omit `user_id` and other owner-only fields from slug GET. | [API_REFERENCE.md](API_REFERENCE.md) |
| Security | Waitlist bot protection | CAPTCHA, honeypot, or Turnstile — IP limits alone are weak. | [API_REFERENCE.md](API_REFERENCE.md) |
| Security | PDF magic-byte check on upload | Don’t rely on `Content-Type` alone. | [API_REFERENCE.md](API_REFERENCE.md) |
| Security | Harden auth login/signup responses | Validate email/password; prefer generic errors (less enumeration). | [API_REFERENCE.md](API_REFERENCE.md) |
| Marketing | Landing product screenshots | Replace SVG placeholders when real shots exist. | [LANDING_PAGE_BRIEF.md](LANDING_PAGE_BRIEF.md) |

### Could

| Subcategory | Item | Notes | Source |
| ----------- | ---- | ----- | ------ |
| Code quality | FileUpload progress UX | Shows “0%” without real progress — simplify or implement. | [CODE_REVIEW.md](CODE_REVIEW.md) |
| Code quality | Login / signup DRY | Shared layout, fields, and/or submit hook. | [CODE_REVIEW.md](CODE_REVIEW.md) |
| Infrastructure | Middleware entry clarity | Ensure Next picks up session middleware (`proxy.ts` vs `middleware.ts`). | [CODE_REVIEW.md](CODE_REVIEW.md) |

---

## After launch

Work to tackle once the product is live.

### Must

| Subcategory | Item | Notes | Source |
| ----------- | ---- | ----- | ------ |
| API | Server-side view/download dedupe | Client `sessionStorage` is easy to bypass; cookie or short-lived token. | [API_REFERENCE.md](API_REFERENCE.md) |
| API | Scope upload idempotency keys per user | Avoid cross-user key collision / overwrite. | [API_REFERENCE.md](API_REFERENCE.md) |
| API | Restrict `profile_picture_url` to user path | Reject arbitrary URLs on profile PUT. | [API_REFERENCE.md](API_REFERENCE.md) |

### Should

| Subcategory | Item | Notes | Source |
| ----------- | ---- | ----- | ------ |
| Product | In-app video recording | `MediaRecorder`; storage via Mux / Cloudflare Stream (or object storage). | [PROJECT_OVERVIEW.md](PROJECT_OVERVIEW.md) |
| Product | Teleprompter UI | Script field, auto-scroll, overlay that doesn’t hide the camera. | [PROJECT_OVERVIEW.md](PROJECT_OVERVIEW.md) |
| API | Re-check slug uniqueness on create | Close race between client validate and insert; **409** on conflict. | [API_REFERENCE.md](API_REFERENCE.md) |
| API | Ownership checks on `excludeId` (slug routes) | Don’t let users exclude another user’s application id. | [API_REFERENCE.md](API_REFERENCE.md) |
| API | Rate-limit remaining public/auth’d reads | e.g. by-id GET, viewer-status; optional tighter per-slug limits. | [API_REFERENCE.md](API_REFERENCE.md) |
| API | Image magic-byte / safe decode on avatar upload | Same idea as PDF upload hardening. | [API_REFERENCE.md](API_REFERENCE.md) |
| API | Read-only GET profile | Move ensure/create off GET (upsert on first PUT or dedicated path). | [API_REFERENCE.md](API_REFERENCE.md) |
| Code quality | Single source of truth for DB types | Derive/generate from schema; stop dual `application` / `database` shapes. | [CODE_REVIEW.md](CODE_REVIEW.md) |

### Could

| Subcategory | Item | Notes | Source |
| ----------- | ---- | ----- | ------ |
| Product | Admin dashboard stats section | Above the search bar on `/admin`: total applications, active, archived, viewed at least once, etc. | — |
| Marketing | Rebuild `/how-it-works` with dedicated content | Not a homepage duplicate — deeper, page-specific content. | [PROJECT_OVERVIEW.md](PROJECT_OVERVIEW.md) |
| Marketing | Rebuild `/blog` with real posts | Restore route + shipping content (not an empty placeholder). | [PROJECT_OVERVIEW.md](PROJECT_OVERVIEW.md) |
| API | Cache or lazy `cv_exists` | Skip HeadObject on every public/edit fetch if costly. | [API_REFERENCE.md](API_REFERENCE.md) |
| API | Fold `isOwner` into public GET | Save a viewer-status round trip. | [API_REFERENCE.md](API_REFERENCE.md) |
| API | Harden R2 delete failure policy | Document or fail request when CV cleanup fails on delete/replace. | [API_REFERENCE.md](API_REFERENCE.md) |
| API | Auth signup CAPTCHA | If signup spam appears. | [API_REFERENCE.md](API_REFERENCE.md) |
| API | Logout hardening | Log `signOut` failures; optional CSRF / auth requirement. | [API_REFERENCE.md](API_REFERENCE.md) |
| API | Avatar retention policy | Canonical filename or cleanup orphans on upload. | [API_REFERENCE.md](API_REFERENCE.md) |
| Code quality | Central API client | Wrap client `fetch` with defaults / future interceptors. | [CODE_REVIEW.md](CODE_REVIEW.md) |
| Docs / DX | Commit `.env.local.example` | Un-ignore (e.g. `!.env.local.example`) and commit template for future setup / collaborators. | [PROJECT_OVERVIEW.md](PROJECT_OVERVIEW.md) |
| Product | AI interview prep — Phase 1 MVP | CV vault, Q&A bank, job ingest, RAG Q&A generator. | [product-ideas/…](product-ideas/ai-powered-interview-preparation.md) |
| Product | AI interview prep — Phase 2 | Flashcards, cheat sheet export, embedding feedback loop. | [product-ideas/…](product-ideas/ai-powered-interview-preparation.md) |

### Won’t (this time)

| Subcategory | Item | Notes | Source |
| ----------- | ---- | ----- | ------ |
| API | Soft-delete applications | Archive already soft-hides; hard delete is intentional for now. | [API_REFERENCE.md](API_REFERENCE.md) |

---

## How to use

1. Finish **Before launch → Must**, then work down MoSCoW in that section.
2. After launch, start with **After launch → Must**.
3. When an item ships, update the source doc and remove (or strike) the row here.
