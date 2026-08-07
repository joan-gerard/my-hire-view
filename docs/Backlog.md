# MyHireView — Backlog

**Canonical tracker** for planned work, to-dos, and improvement opportunities. Open work is owned here only — other docs may give design context or history, but they are not a second checklist.

**Trello:** Cards live on the [MyHireView](https://trello.com/b/PAn5GrDz/myhireview) board (lists: Pre Launch, Post Launch, Current Sprint, In Progress, Done). Card titles use `[id] Item` (e.g. `[A1-002] CI/CD`) and match rows in this file. Keep this doc and Trello in sync whenever a ticket or PR moves, ships, or is added.

**Context (not the work tracker):** [PROJECT_OVERVIEW.md](PROJECT_OVERVIEW.md) · [API_REFERENCE.md](API_REFERENCE.md) · [CI_CD.md](CI_CD.md) · [CODE_REVIEW.md](CODE_REVIEW.md) · [LANDING_PAGE_BRIEF.md](LANDING_PAGE_BRIEF.md) · [CV_REUSE_AND_STORAGE.md](CV_REUSE_AND_STORAGE.md) · [PRICING_AND_MEMBERSHIP.md](PRICING_AND_MEMBERSHIP.md) · [product-ideas/ai-powered-interview-preparation.md](product-ideas/ai-powered-interview-preparation.md)

**MoSCoW:** **M**ust · **S**hould · **C**ould · **W**on’t (this time)

**IDs:** Each row has a stable ticket id `{PR}-{NNN}` (e.g. `A1-002`), where `{PR}` is the sprint-plan PR label (A1, B1, …). Cite these in commits/PRs/docs (e.g. “closes A1-002”). New items take the next unused `NNN` and the PR id for the group they join; do not reuse ids after a ticket is removed.

---

## Before launch

Work needed before a public launch with paid access (free tier / trial only — not unlimited free use of the app).

### Must

| ID | Subcategory | Item | Notes | Source |
| -------- | -------------- | ---------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| D3-001 | Infrastructure | Durable rate limiting | Replace in-memory `lib/rate-limit.ts` with Redis/Upstash (or similar). Also closes per-path Map growth on view/download: `checkPerSlugRateLimit` keys `${ip}:${publicId}:${slug}` before format validation and only prunes the key being hit, so unique invalid paths accumulate. Interim: validate/normalize `publicId` + slug before constructing the key, and/or add global TTL / capacity sweep. | [PROJECT_OVERVIEW.md](PROJECT_OVERVIEW.md) |
| D1-007 | API | SSR public view vs per-IP rate limit | `/view/[publicId]/[slug]` server `fetch` shares one **120/min** bucket under server/`unknown` IP → cross-visitor **429**. Call `resolvePublicApplication` from the RSC (or exempt/internal-tag server loads). Distinct from Production base URL for SSR. | [API_REFERENCE.md](API_REFERENCE.md) |
| C2-008 | Security | Validate profile-picture URL origin | Path-only “owned” check allows external HTTPS hosts that look like Storage paths; public pages then load that host. Require origin = `NEXT_PUBLIC_SUPABASE_URL`. | [API_REFERENCE.md](API_REFERENCE.md) |
| C1-009 | API | Retry profile create for immediate-session signup | `createInitialProfile` failure still returns signup success; callback retry is confirmation-only, so immediate sessions can lack a `profiles` row. Add post-signup/login bootstrap or explicit retry. | [API_REFERENCE.md](API_REFERENCE.md) |
| C1-010 | API | Distinguish `user_id` vs `public_id` unique violations | `createInitialProfile` treats any `23505` as success; rare `public_id` collision can leave no row. Re-select by `userId` before claiming success. | [API_REFERENCE.md](API_REFERENCE.md) |
| E1-012 | Product | Pricing & membership tiers | Define plans (paid + optional free tier / trial), per-tier limits, price points. Do **not** launch with unlimited free app access. Inventory of existing free/premium mentions: [PRICING_AND_MEMBERSHIP.md](PRICING_AND_MEMBERSHIP.md). | [PRICING_AND_MEMBERSHIP.md](PRICING_AND_MEMBERSHIP.md) |
| E2-013 | Product | Payment / membership system | Stripe (or similar): checkout, webhooks, Supabase subscription state; gate creating/using applications behind an active plan or trial. | [PROJECT_OVERVIEW.md](PROJECT_OVERVIEW.md) |
| E3-014 | Marketing | Pricing page beyond placeholder | Ship real tiers on `/pricing` aligned with billing — not a stub. | [PROJECT_OVERVIEW.md](PROJECT_OVERVIEW.md) |
| A3-015 | Security | Confirm email required in production Supabase | **Defer until production / just before public launch** (not blocking earlier sprints). In Auth → Providers → Email, ensure **Confirm email** is ON so Supabase does not issue a session for unconfirmed users once live. Also set production **Site URL** + Redirect URLs (include `/auth/callback`); localhost Site URL is fine for local-only work. | [SUPABASE_AUTH_SETUP.md](SUPABASE_AUTH_SETUP.md) |

### Should

| ID | Subcategory | Item | Notes | Source |
| -------- | -------------- | ---------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| F17-017 | Branding | Update `/admin` and `/view` branding | Still on previous visual identity. Include loading effects / skeletons so they match the new brand (not leftover styles). | [PROJECT_OVERVIEW.md](PROJECT_OVERVIEW.md) |
| F17-018 | Branding | Update login and signup branding | Match `/login` and `/signup` to the main homepage visual identity, including any loading states / skeletons on those flows. | — |
| F20-019 | Legal | Create legal pages | Terms of Service, Privacy Policy, and Cookies (`/terms`, `/privacy`, cookies). Footer and waitlist already link to `/terms` and `/privacy` with no pages. | — |
| F21-020 | Product | Delete account from profile | On the profile page, let users delete their account: remove Supabase Auth user, `profiles` row, and associated applications (and related storage: **primary + tailored CVs** in R2, profile picture). | [CV_REUSE_AND_STORAGE.md](CV_REUSE_AND_STORAGE.md) |
| F22-021 | Docs / DX | Refresh README | Still create-next-app boilerplate above the MyHireView section. Migrations setup step now points at applying **all** files in `supabase/migrations/` in order (through `027`); finish the full README rewrite. | [PROJECT_OVERVIEW.md](PROJECT_OVERVIEW.md) |
| F23-022 | Support | Technical support entry point | Mailto, simple form, or lightweight tool on marketing / dashboard / view. | [PROJECT_OVERVIEW.md](PROJECT_OVERVIEW.md) |
| F6-024 | API | Schema validation on write routes | Zod (or similar) for bodies/params; clear **400**s. Applications create/update and profile PUT already validate; extend to remaining write routes as needed. | [API_REFERENCE.md](API_REFERENCE.md), [CODE_REVIEW.md](CODE_REVIEW.md) |
| F4-025 | API | Shared `withAuth` helper | Shared `withAuth` so auth failures aren’t mislabeled **401** on remaining routes. (`handleApiError` already shipped.) | [API_REFERENCE.md](API_REFERENCE.md), [CODE_REVIEW.md](CODE_REVIEW.md) |
| C3-026 | API | Picture-only first save without profiles row | `/admin/new` can open profile-picture modal when no `profiles` row; PUT with only `profile_picture_url` → empty names → **400**. Bootstrap names/`public_id` from Auth metadata on create-on-first-save (ties to signup profile retry). | [API_REFERENCE.md](API_REFERENCE.md) |
| F10-027 | API | Propagate `resolvePublicApplication` DB errors as 5xx | Query errors currently map to `null` → **404**; outages look like missing apps (public GET + view/download). Keep missing-row → **404**; surface DB errors as **500**. | [API_REFERENCE.md](API_REFERENCE.md) |
| F11-028 | API | Escape `q` quotes for PostgREST list search | `"` in `q` can break `ilike."%…%"` → **500**. Escape/strip quotes and remaining reserved filter chars. | [API_REFERENCE.md](API_REFERENCE.md) |
| F10-029 | API | Distinguish missing CV vs HeadObject failure | `checkCvObjectExists` maps any R2 error to `cv_exists: false` (“CV missing”). Not-found → `false`; other failures → omit/unchecked. Shared by list, public, by-id GETs. | [API_REFERENCE.md](API_REFERENCE.md) |
| F10-030 | API | Harden `toPublicApplication` status handling | Helper always emits full DTO with `status: "active"`; JSDoc wrong. Enforce status check in helper / narrow types so direct use can’t leak archived/draft PII. | [API_REFERENCE.md](API_REFERENCE.md) |
| F12-031 | API | Repairable Auth name sync on PUT profile | Failed `updateUser` leaves Auth stale; same-name PUT skips re-sync. Also compare Auth `user_metadata` names (like `public_id`) so a no-op save can repair. | [API_REFERENCE.md](API_REFERENCE.md) |
| F13-032 | API | Atomic primary-library cap | Concurrent `POST /api/profile/primary-cvs` can exceed `PRIMARY_CV_MAX_PER_USER`. Enforce with DB trigger/lock; avoid hard-coding `5` if Premium raises the limit. | [API_REFERENCE.md](API_REFERENCE.md) |
| F14-033 | API | Preserve name when clamping long slugs | `generateSlug` can truncate the name segment away when company/role fills 128. Clamp after combining; keep requested name where possible. Affects `POST /api/slug` + form preview. | [API_REFERENCE.md](API_REFERENCE.md) |
| D2-034 | API | Route-scoped slug-validate rate-limit key | `SLUG_VALIDATE_RATE_LIMIT` shares the IP counter with other `checkRateLimit` callers. Namespace key (e.g. `slug-validate:${ip}`). | [API_REFERENCE.md](API_REFERENCE.md) |
| F7-035 | API | Auth before R2 config probe on CV upload | Unauthenticated callers get **500** “not configured” instead of **401** when env missing. Check auth first. | [API_REFERENCE.md](API_REFERENCE.md) |
| F7-036 | API | Stronger idempotent CV upload replay identity | Replay trusts size + PDF MIME only; same key/size can return non-matching/non-PDF bytes. Prefer content digest + validate body before accepting replay. | [API_REFERENCE.md](API_REFERENCE.md) |
| F9-037 | API | Defer profile-picture folder purge until after URL commit | Upload purges before `PUT /api/profile`; failed PUT can leave profile pointing at a deleted object. Clean up previous object only after URL commit succeeds. | [API_REFERENCE.md](API_REFERENCE.md) |
| C1-038 | API | Validate Auth metadata `public_id` format | Invalid metadata can be persisted; public resolution rejects → dead share URLs. Validate with `isValidPublicId` or regenerate. | [API_REFERENCE.md](API_REFERENCE.md) |
| F3-039 | Security | Waitlist bot protection | CAPTCHA, honeypot, or Turnstile — IP limits alone are weak. | [API_REFERENCE.md](API_REFERENCE.md) |
| F1-040 | Security | Harden auth login/signup responses | Validate email/password (format, max length); prefer generic errors (less enumeration); wrap malformed JSON → **400**; log unexpected Auth API failures. | [API_REFERENCE.md](API_REFERENCE.md) |
| F1-041 | Security | Enforce signup password rules | Require ≥ 8 characters and ≥ 1 special character on signup (client + `POST /api/auth/signup`). | — |
| F24-043 | Marketing | Landing product screenshots | Replace SVG placeholders when real shots exist. | [LANDING_PAGE_BRIEF.md](LANDING_PAGE_BRIEF.md) |
| F19-044 | UX | New-user onboarding checklist | Checklist / workflow for new users (e.g. fill profile, upload photo, create first application) — shown until steps are complete. | — |
| F15-045 | UX | Persist create-application form draft | Keep create-application form data until submit so refresh / navigation doesn’t lose progress (e.g. local draft or autosave). | — |
| F19-046 | UX | Explain Public id + show final URL | On `/admin/profile` (and `/admin/new`): short copy for what the Public id is and why it appears in the share URL. On `/admin/new`, also preview the final public URL (e.g. `/view/{publicId}/{slug}`) before submit so users know the link they will share. Relates to vanity Public id Could (after launch). | [PUBLIC_URL_OPTION_B.md](PUBLIC_URL_OPTION_B.md) |
| F19-047 | UX | Application card icon / badge legend | On `/admin`, each application card shows a left-side icon/badge with no explanation. Add UI (tooltip, legend, or inline help) so users know what each icon means. | — |
| F14-048 | UX | Create slug: allow auto-assign fallback | On `/admin/new`, a manually entered taken slug shows “save will use an auto-assigned slug instead,” and the page submit path does fall back to `POST /api/slug` — but `ApplicationForm` keeps Save disabled while `slugLiveStatus` is `unavailable`. Allow that create fallback through (or remove the unreachable recovery copy). | — |
| F14-099 | UX | Edit form overwrites saved custom slug | On `/admin/edit/[id]`, `slugManuallyEdited` starts `false`, so a mount effect re-runs `buildSlug(company, role, …)` and replaces the loaded `initialData.slug`. Custom slug saves correctly (DB + public URL), but re-opening edit shows company-role only; a careless re-save can revert the share URL. Don’t auto-rebuild until company/role/name-in-URL actually change, or treat a non-derived initial slug as manual. | [DATA_FLOW.md](DATA_FLOW.md) |
| F15-049 | UX | Preserve CV source choice while library loads | On create, choosing “Upload a different CV” while primary CVs are still loading is overwritten when the fetch finishes (`setCvMode("primary")`), so Save can attach the default primary instead of the tailored file. Preserve an explicit user mode choice, or disable the radios until initial defaulting completes. | — |
| F16-050 | Product | Preview before submitting an application | Decide UX on `/admin/new`: (1) Preview next to Save (optional); (2) Preview replaces Save — modal or route e.g. `/admin/preview/[id]` before submit; or (3) Save as `status = draft` then publish to `active`. **`status` / `archived_at` shipped** (see [CV_REUSE_AND_STORAGE.md](CV_REUSE_AND_STORAGE.md)); remaining work is preview UX + draft flows. Relates to local form-draft persistence above. | [CV_REUSE_AND_STORAGE.md](CV_REUSE_AND_STORAGE.md) |

### Could

| ID | Subcategory | Item | Notes | Source |
| -------- | -------------- | ---------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| F8-051 | UX | Upload form error + busy copy | Map CV / profile-picture upload **400** / **409** / **429** / **500** to friendly Save messages; show “Uploading…” during `POST /api/upload` and `POST /api/upload/profile-picture`. Deferred tables in [API_REFERENCE.md](API_REFERENCE.md#post-upload-cv). | [API_REFERENCE.md](API_REFERENCE.md) |
| F9-052 | UX | Surface avatar upload / save `warning` | `POST /api/upload/profile-picture` can return `{ warning }` on purge failure; ensure `ProfileForm` shows it. `ProfilePictureModal` also closes immediately after a successful PUT that returned `warnings`, so storage/Auth sync failures disappear — keep the modal open until acknowledged, or pass the warning through `onSaved` / a toast. | [API_REFERENCE.md](API_REFERENCE.md), [PROFILE_PICTURE.md](PROFILE_PICTURE.md) |
| F18-053 | UX | Keep primary-CV delete “still referenced” warning | After `DELETE /api/profile/primary-cvs`, `PrimaryCvLibrarySection` sets an `applications_affected` warning then calls `load()`, which clears `error` at start — so the “CV missing until updated” message never sticks. Refresh first, then set the warning from the delete response. | [API_REFERENCE.md](API_REFERENCE.md) |
| F18-054 | UX | Profile applications summary includes drafts | `/admin/profile` total application count includes drafts, but the parenthetical only shows active + archived, so drafts make the breakdown not add up. Include draft count (or exclude drafts from the total). | — |
| F8-055 | Code quality | FileUpload / save-time progress | Honest busy state on Save; optional real % later. | [CODE_REVIEW.md](CODE_REVIEW.md), [API_REFERENCE.md](API_REFERENCE.md) |
| F5-056 | API | Upload routes → `handleApiError` | Adopt shared helper + log-only `meta` (userId, size, storage status) on CV and profile-picture uploads. | [API_REFERENCE.md](API_REFERENCE.md), [CODE_REVIEW.md](CODE_REVIEW.md) |
| F2-057 | Code quality | Login / signup DRY | Shared layout, fields, and/or submit hook. | [CODE_REVIEW.md](CODE_REVIEW.md) |
| F25-058 | Code quality | ConfirmDialog single cancel path | Cancel / backdrop dismissal call `onCancel` directly, then controlled `open=false` closes the native `<dialog>` and the `close` listener calls `onCancel` again. Route dismissal through one path (or guard the listener) so each cancel emits once. | — |
| F2-059 | UX | Show password on login / signup | Toggle to reveal/hide password on `/login` and `/signup`. | — |
| F26-060 | Infrastructure | Middleware entry clarity | Ensure Next picks up session middleware (`proxy.ts` vs `middleware.ts`). | [CODE_REVIEW.md](CODE_REVIEW.md) |
| D1-061 | Infrastructure | Production base URL for SSR | `getBaseUrl()` falls back to `http://localhost:3000` when `NEXT_PUBLIC_SITE_URL` is unset. `/view/[publicId]/[slug]` SSR `fetch` then targets localhost and fails in production. Require the env in prod (fail fast) and/or derive the request origin (`Host` / `x-forwarded-host`) for server-side fetches; keep share-link builders on an explicit canonical site URL. | [API_REFERENCE.md](API_REFERENCE.md) |
| F9-062 | API | Serialize concurrent profile-picture replacements | Two concurrent uploads with different MIME/ext can purge each other’s returned URLs. Mitigate with per-user serialization or purge only the previously committed path. | [API_REFERENCE.md](API_REFERENCE.md) |
| F8-063 | UX | CV upload retry after failure (idempotency key) | On network/500, reuse the same idempotency key; generate a new key only when the file changes. | [API_REFERENCE.md](API_REFERENCE.md) |
| F3-064 | API | Cap waitlist `first_name` + tighten email validation | Length cap on `first_name`; stricter email validation (or small library). | [API_REFERENCE.md](API_REFERENCE.md) |

---

## After launch

Work to tackle once the product is live.

### Should

| ID | Subcategory | Item | Notes | Source |
| -------- | -------------- | ---------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| H1-065 | Product | In-app video recording | `MediaRecorder`; storage via Mux / Cloudflare Stream (or object storage). | [PROJECT_OVERVIEW.md](PROJECT_OVERVIEW.md) |
| H2-066 | Product | Teleprompter UI | Script field, auto-scroll, overlay that doesn’t hide the camera. | [PROJECT_OVERVIEW.md](PROJECT_OVERVIEW.md) |
| G6-067 | Product | Archive active apps when paid membership ends | When a user no longer has an active paid membership (cancelled, lapsed, or downgraded off paid), set their **active** applications to `status = archived`. Optionally hard-delete those rows after **1 / 2 / 3 months** (TBD) — align with or supersede the 90-day archived purge policy below. Depends on Payment / membership system. | [PRICING_AND_MEMBERSHIP.md](PRICING_AND_MEMBERSHIP.md) |
| G4-068 | Product | Dashboard 90-day archive retention tooltip | On archived `/admin` cards: remind that archived apps are permanently deleted after 90 days; show countdown from `archived_at`. Depends on purge policy being product-real. | [CV_REUSE_AND_STORAGE.md](CV_REUSE_AND_STORAGE.md) |
| G4-069 | Product | Email notifications for archived app retention | On archive (90-day notice), ~7 days before purge, and after permanent deletion. Include restore link. Needs transactional email provider. | [CV_REUSE_AND_STORAGE.md](CV_REUSE_AND_STORAGE.md) |
| G3-070 | Product | Feature flag: 90-day archived deletion | Env/config switch to turn archived-app purge **on/off** without redeploying logic. Default **off** until emails + dashboard tooltip are ready. | [CV_REUSE_AND_STORAGE.md](CV_REUSE_AND_STORAGE.md) |
| I1-071 | Infrastructure | Decide and implement caching strategies | Choose where caching pays off (public slug GET, profile, CDN/R2, Next `fetch`/`unstable_cache`, Redis/Upstash, etc.), invalidate correctly on writes, and ship. Relates to narrower “Cache or lazy `cv_exists`” Could item. | — |
| G2-072 | Infrastructure | Cron: purge applications archived ≥ 90 days | Hard-delete eligible rows (`status = archived` and `archived_at` older than 90 days). Delete **tailored** CVs from R2; **never** delete primary CVs. Idempotent; log failures. **Prerequisite:** DB `status` ↔ `archived_at` invariant (CHECK/trigger) so direct PostgREST updates cannot desync the retention clock — see PUT deferred in [API_REFERENCE.md](API_REFERENCE.md). | [CV_REUSE_AND_STORAGE.md](CV_REUSE_AND_STORAGE.md) |
| G5-073 | Legal / Docs | Retention copy in Terms / Privacy | Document 90-day archived deletion once the policy is product-real (even if the purge feature flag is still off). | [CV_REUSE_AND_STORAGE.md](CV_REUSE_AND_STORAGE.md) |
| L2-074 | API | Re-check slug uniqueness on create | Close race between client validate and insert; **409** on conflict. | [API_REFERENCE.md](API_REFERENCE.md) |
| L2-075 | API | Ownership checks on `excludeId` (slug routes) | Don’t let users exclude another user’s application id. | [API_REFERENCE.md](API_REFERENCE.md) |
| L1-076 | API | Rate-limit remaining public/auth’d reads | e.g. remaining public GETs if traffic warrants. View/download already use per-IP + per-path caps. | [API_REFERENCE.md](API_REFERENCE.md) |
| L1-077 | Security | Account-/email-level login throttling | Beyond per-IP (shared NATs). Relates to durable rate limiting but is separate work. | [API_REFERENCE.md](API_REFERENCE.md) |
| I2-078 | Code quality | Single source of truth for DB types | Derive/generate from schema; stop dual `application` / `database` shapes. | [CODE_REVIEW.md](CODE_REVIEW.md) |

### Could

| ID | Subcategory | Item | Notes | Source |
| -------- | -------------- | ---------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| J1-079 | Product | Custom vanity public id (premium) | Let users choose a branded public id (LinkedIn-style) instead of opaque id only. See [PUBLIC_URL_OPTION_B.md](PUBLIC_URL_OPTION_B.md#future-custom-public-id-vanity-handle). | [PUBLIC_URL_OPTION_B.md](PUBLIC_URL_OPTION_B.md) |
| L7-080 | Product | Admin dashboard stats section | Above the search bar on `/admin`: total applications, active, archived, viewed at least once, etc. | — |
| J3-081 | Marketing | Rebuild `/how-it-works` with dedicated content | Not a homepage duplicate — deeper, page-specific content. | [PROJECT_OVERVIEW.md](PROJECT_OVERVIEW.md) |
| J3-082 | Marketing | Rebuild `/blog` with real posts | Restore route + shipping content (not an empty placeholder). | [PROJECT_OVERVIEW.md](PROJECT_OVERVIEW.md) |
| I1-083 | API | Cache or lazy `cv_exists` | Skip HeadObject on every public/edit fetch if costly. | [API_REFERENCE.md](API_REFERENCE.md) |
| L3-084 | API | Middle-ground R2 delete UX + orphan cleanup | Fail-closed delete already ships on application/primary delete. Remaining: middle-ground delete UX + orphan tailored-CV cleanup cron — see [PDF_AND_R2.md](PDF_AND_R2.md). | [API_REFERENCE.md](API_REFERENCE.md) / [PDF_AND_R2.md](PDF_AND_R2.md) |
| L4-085 | API | Auth signup CAPTCHA | If signup spam appears. | [API_REFERENCE.md](API_REFERENCE.md) |
| L4-086 | API | Logout hardening | Log `signOut` failures; optional CSRF / auth requirement. | [API_REFERENCE.md](API_REFERENCE.md) |
| L4-098 | UX | In-app forgot-password flow | Ported from A2-016 follow-up. Wire UI to Supabase reset emails + `/auth/callback` (templates already documented in [SUPABASE_AUTH_SETUP.md](SUPABASE_AUTH_SETUP.md)). | [SUPABASE_AUTH_SETUP.md](SUPABASE_AUTH_SETUP.md) |
| L5-087 | Privacy | Avoid Auth `user_id` in profile-picture URLs | Store under `public_id/…` (or similar) and migrate RLS; signed/proxy URLs only if avatars become private. Plan a copy → rewrite DB URLs → delete old paths migration for existing objects. | [PROFILE_PICTURE.md](PROFILE_PICTURE.md) |
| L6-088 | Code quality | Central API client | Wrap client `fetch` with defaults / future interceptors. | [CODE_REVIEW.md](CODE_REVIEW.md) |
| L9-089 | Infrastructure | Replay-safe `profiles.public_id` backfill | Migration `020` added `public_id TEXT NOT NULL UNIQUE` without nullable→backfill→NOT NULL (safe here because data was reset — [PUBLIC_URL_OPTION_B.md](PUBLIC_URL_OPTION_B.md)). Only needed if replaying the chain on a DB that already has pre-`020` profile rows. Do **not** rewrite applied `020`; add a one-off forward script if that case appears. | [PUBLIC_URL_OPTION_B.md](PUBLIC_URL_OPTION_B.md) |
| K1-090 | Product | AI interview prep — Phase 1 MVP | CV vault, Q&A bank, job ingest, RAG Q&A generator. | [product-ideas/…](product-ideas/ai-powered-interview-preparation.md) |
| K2-091 | Product | AI interview prep — Phase 2 | Flashcards, cheat sheet export, embedding feedback loop. | [product-ideas/…](product-ideas/ai-powered-interview-preparation.md) |
| J2-092 | Product | Opaque-token-only public URLs (Option D) | Alternative to Option B: `/view/{opaqueToken}` only — no company/role in the path. Max privacy; harder for candidates to recognize links. Deferred future mode, not the default. See [PUBLIC_URL_OPTION_B.md](retrospectives/PUBLIC_URL_OPTION_B.md). | [PUBLIC_URL_OPTION_B.md](retrospectives/PUBLIC_URL_OPTION_B.md) |
| L10-093 | Infrastructure | Content-hash R2 CV deduplication | Key identical PDF bytes by SHA-256 so copies share one R2 object; reference-count on delete. Storage optimization only — does not improve reuse UX (primary library already does). Deferred alternative from [CV_REUSE_AND_STORAGE.md](retrospectives/CV_REUSE_AND_STORAGE.md). | [CV_REUSE_AND_STORAGE.md](retrospectives/CV_REUSE_AND_STORAGE.md) |
| L8-094 | API | Uniform **200** for waitlist duplicate emails | Trade-off vs current explicit **409** (enumeration). | [API_REFERENCE.md](API_REFERENCE.md) |
| L8-095 | API | Tighter profile-picture upload rate limit | Optional ~10/min like CV if abuse appears; default **60/min** is fine for now. | [API_REFERENCE.md](API_REFERENCE.md) |
| L8-096 | API | Upload metrics / correlation | Duration, size, idempotent/purge-warning rates, 5xx; optional request id in logs. Post-launch if support volume warrants (CV + profile-picture uploads). | [API_REFERENCE.md](API_REFERENCE.md) |

### Won’t (this time)

| ID | Subcategory | Item | Notes | Source |
| -------- | -------------- | ---------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| OUT-097 | API | Soft-delete applications | Archive soft-hides via `status = archived`. Hard delete remains user-driven for now. **Exception (after launch):** flagged 90-day hard-delete of long-archived apps — see After launch → Should. | [CV_REUSE_AND_STORAGE.md](CV_REUSE_AND_STORAGE.md) |

---

## How to use

1. Finish **Before launch → Must**, then work down MoSCoW in that section. Prefer the [Sprint plan](#sprint-plan) order below for PR grouping.
2. After launch, work down MoSCoW starting with **After launch → Should** (no open Must items today), using the after-launch epics in the sprint plan.
3. When starting a PR group, move its Trello cards from Pre/Post Launch → **Current Sprint** (then **In Progress** while coding).
4. When an item or PR ships, update **both** places: remove (or strike) the row here, note the id in the PR (e.g. `E1-012`), and move the matching Trello card(s) to **Done**. Do not maintain a parallel open checklist in other docs.
5. When adding a ticket, append a new `{PR}-{NNN}` with the next free number (see highest id above); never reuse a retired id. Add it to an existing PR group in the sprint plan (or create a new group), and create the matching Trello card on Pre Launch or Post Launch.

---

## Sprint plan

Organizes open tickets into **PR-sized groups** by shared code, dependencies, and risk. One PR ≈ one theme; migrations / Stripe / Redis each get their own PR chain. Cite ticket ids in PR titles/bodies (e.g. `B1-003`, `B1-004`).

**Branch names:** suggested feature branches use `{type}/{pr-id}-{short-slug}` (e.g. `chore/a1-ci-cd`). Types: `feat`, `fix`, `chore`, `docs`, `ops`. Create from `main` (or your default base); adjust the slug if you prefer.

**Order:** complete before-launch sprints **A → E** (Must first), interleave the “anytime” Should/Could batches when they touch the same files, then after-launch epics.

---

### Before launch

#### Sprint A — Quick wins & safety

| PR | Branch | Tickets | Scope |
| -- | ------ | ------- | ----- |
| A1 | `chore/a1-ci-cd` | `A1-002` | ~~CI/CD — run `pnpm test:ci` on push/PR~~ (shipped) |
| A2 | `fix/a2-auth-callback-rls` | `A2-016` | ~~Auth callback open-redirect fix + tighten `applications` public SELECT RLS~~ (shipped) |
| A3 | `ops/a3-confirm-email-prod` | `A3-015` | Ops: Confirm email ON in production Supabase (no app code) — **do just before launch** |
| A4 | `chore/a4-remove-placeholder-routes` | `A4-011`, `A4-023` | ~~Remove `/how-it-works` + `/blog`; clean `MarketingHero_Old` / nav~~ (shipped) |

#### Sprint B — CV / R2 correctness (Must)

| PR | Branch | Tickets | Scope |
| -- | ------ | ------- | ----- |
| B1 | `fix/b1-tailored-cv-integrity` | `B1-003`, `B1-004`, `B1-005` | ~~Canonical/atomic tailored `cv_url` uniqueness; allow-list tailored deletes; fail closed when `R2_PUBLIC_BASE_URL` unset~~ (shipped) |
| B2 | `fix/b2-primary-cv-filename-put` | `B2-006` | ~~Filename-only primary CV PUT~~ (shipped) |
| B3 | `feat/b3-primary-cv-ownership-fk` | `B3-042` | ~~DB same-user ownership for `primary_cv_id` (migration; pairs with B1 schema work)~~ (shipped) |

#### Sprint C — Profile / signup invariants

| PR | Branch | Tickets | Scope |
| -- | ------ | ------- | ----- |
| C1 | `fix/c1-signup-profile-invariants` | `C1-009`, `C1-010`, `C1-038` | Immediate-session profile retry; `23505` user_id vs public_id; validate Auth `public_id` format |
| C2 | `fix/c2-profile-picture-url-origin` | `C2-008` | Validate profile-picture URL origin |
| C3 | `fix/c3-picture-only-first-save` | `C3-026` | Picture-only first save without profiles row (after C1) |

#### Sprint D — Public view & rate limiting

| PR | Branch | Tickets | Scope |
| -- | ------ | ------- | ----- |
| D1 | `fix/d1-ssr-view-rate-limit` | `D1-007`, `D1-061` | SSR public view vs per-IP rate limit + production base URL for SSR |
| D2 | `fix/d2-slug-validate-rate-limit-key` | `D2-034` | Route-scoped slug-validate rate-limit key (can ship before Redis) |
| D3 | `feat/d3-durable-rate-limiting` | `D3-001` | Durable rate limiting (Redis/Upstash) + per-path Map growth / interim validate-before-key |

#### Sprint E — Monetization (Must epic)

| PR | Branch | Tickets | Scope |
| -- | ------ | ------- | ----- |
| E1 | `docs/e1-pricing-tiers` | `E1-012` | Define pricing & membership tiers (doc/product decisions) |
| E2 | `feat/e2-payment-membership` | `E2-013` | Payment / membership system — split into schema → checkout → webhooks → API/UI gates as needed |
| E3 | `feat/e3-pricing-page` | `E3-014` | Real `/pricing` page aligned with billing |

---

### Before launch — Should / Could batches (same-PR friendly)

Ship these when capacity allows; prefer attaching to a Must PR only if the same files are already open.

| PR | Branch | Tickets | Scope |
| -- | ------ | ------- | ----- |
| F1 | `fix/f1-harden-auth-signup` | `F1-040`, `F1-041` | Harden auth login/signup + enforce signup password rules |
| F2 | `refactor/f2-auth-pages-dry` | `F2-057`, `F2-059` | Login/signup DRY + show-password toggle (after or with F1) |
| F3 | `feat/f3-waitlist-bot-protection` | `F3-039`, `F3-064` | Waitlist bot protection + name/email validation |
| F4 | `refactor/f4-with-auth-helper` | `F4-025` | Shared `withAuth` helper |
| F5 | `refactor/f5-upload-handle-api-error` | `F5-056` | Upload routes → `handleApiError` (after F4) |
| F6 | `feat/f6-schema-validation-writes` | `F6-024` | Schema validation on remaining write routes |
| F7 | `fix/f7-upload-auth-and-replay` | `F7-035`, `F7-036` | Auth before R2 config probe; stronger CV upload replay identity |
| F8 | `feat/f8-upload-form-ux` | `F8-051`, `F8-055`, `F8-063` | Upload form errors / busy copy / progress / retry idempotency |
| F9 | `fix/f9-avatar-purge-and-warnings` | `F9-037`, `F9-052`, `F9-062` | Defer avatar purge; surface warnings; serialize concurrent replacements |
| F10 | `fix/f10-public-resolve-cv-exists` | `F10-027`, `F10-029`, `F10-030` | Resolve DB → 5xx; HeadObject vs missing CV; harden `toPublicApplication` |
| F11 | `fix/f11-escape-list-search-q` | `F11-028` | Escape `q` quotes for list search |
| F12 | `fix/f12-repairable-auth-name-sync` | `F12-031` | Repairable Auth name sync on PUT profile |
| F13 | `fix/f13-atomic-primary-cv-cap` | `F13-032` | Atomic primary-library cap |
| F14 | `fix/f14-slug-name-clamp-fallback` | `F14-033`, `F14-048`, `F14-099` | Preserve name when clamping slugs; create slug auto-assign fallback; edit form must keep saved custom slug on load |
| F15 | `feat/f15-create-app-draft-cv-mode` | `F15-045`, `F15-049` | Persist create-application draft + preserve CV source while library loads |
| F16 | `feat/f16-application-preview-draft` | `F16-050` | Preview / draft-before-publish UX (after F15) |
| F17 | `feat/f17-admin-view-auth-branding` | `F17-017`, `F17-018` | Brand `/admin`, `/view`, login, signup |
| F18 | `fix/f18-primary-cv-warning-draft-count` | `F18-053`, `F18-054` | Primary-CV delete warning sticks; profile apps summary includes drafts |
| F19 | `feat/f19-onboarding-public-id-legend` | `F19-044`, `F19-046`, `F19-047` | Onboarding checklist; Public id + URL copy; card icon legend |
| F20 | `feat/f20-legal-pages` | `F20-019` | Legal pages (Terms / Privacy / Cookies) |
| F21 | `feat/f21-delete-account` | `F21-020` | Delete account from profile |
| F22 | `docs/f22-refresh-readme` | `F22-021` | Refresh README |
| F23 | `feat/f23-tech-support-entry` | `F23-022` | Technical support entry point |
| F24 | `chore/f24-landing-screenshots` | `F24-043` | Landing product screenshots (when assets exist) |
| F25 | `fix/f25-confirm-dialog-cancel` | `F25-058` | ConfirmDialog single cancel path |
| F26 | `chore/f26-middleware-entry` | `F26-060` | Middleware entry clarity (`proxy.ts` vs `middleware.ts`) |

---

### After launch

#### Epic G — Archive retention (90-day)

Depends on product-real purge policy; ship in order.

| PR | Branch | Tickets | Scope |
| -- | ------ | ------- | ----- |
| G1 | `feat/g1-status-archived-at-invariant` | *(prerequisite)* | DB `status` ↔ `archived_at` invariant (CHECK/trigger) — called out on `G2-072` |
| G2 | `feat/g2-purge-archived-apps-cron` | `G2-072` | Cron: purge applications archived ≥ 90 days |
| G3 | `feat/g3-90-day-purge-feature-flag` | `G3-070` | Feature flag for 90-day deletion (default off) |
| G4 | `feat/g4-archive-retention-ux-email` | `G4-068`, `G4-069` | Dashboard retention tooltip + email notifications |
| G5 | `docs/g5-retention-legal-copy` | `G5-073` | Retention copy in Terms / Privacy |
| G6 | `feat/g6-archive-on-membership-end` | `G6-067` | Archive active apps when paid membership ends (needs `E2-013`) |

#### Epic H — In-app video

| PR | Branch | Tickets | Scope |
| -- | ------ | ------- | ----- |
| H1 | `feat/h1-in-app-video-recording` | `H1-065` | In-app video recording + storage (Mux / Cloudflare Stream / object storage) |
| H2 | `feat/h2-teleprompter-ui` | `H2-066` | Teleprompter UI (after H1) |

#### Epic I — Caching & types

| PR | Branch | Tickets | Scope |
| -- | ------ | ------- | ----- |
| I1 | `feat/i1-caching-and-cv-exists` | `I1-071`, `I1-083` | Caching strategy + cache/lazy `cv_exists` (better after `D3-001`) |
| I2 | `refactor/i2-db-types-single-source` | `I2-078` | Single source of truth for DB types |

#### Epic J — Public id & marketing content

| PR | Branch | Tickets | Scope |
| -- | ------ | ------- | ----- |
| J1 | `feat/j1-vanity-public-id` | `J1-079` | Custom vanity public id (premium; after billing) |
| J2 | `feat/j2-opaque-token-only-urls` | `J2-092` (related UX copy: `F19-046`) | Opaque-token-only URLs (Option D) — only if product wants it |
| J3 | `feat/j3-rebuild-how-it-works-blog` | `J3-081`, `J3-082` | Rebuild `/how-it-works` + `/blog` with real content (routes were removed in A4) |

#### Epic K — AI interview prep

| PR | Branch | Tickets | Scope |
| -- | ------ | ------- | ----- |
| K1 | `feat/k1-ai-interview-prep-mvp` | `K1-090` | Phase 1 MVP |
| K2 | `feat/k2-ai-interview-prep-phase-2` | `K2-091` | Phase 2 (after K1) |

#### Epic L — Auth / waitlist / upload polish (after launch)

| PR | Branch | Tickets | Scope |
| -- | ------ | ------- | ----- |
| L1 | `feat/l1-extended-rate-limits` | `L1-076`, `L1-077` | Rate-limit remaining reads; account/email login throttling (builds on `D3-001`) |
| L2 | `fix/l2-slug-uniqueness-exclude-id` | `L2-074`, `L2-075` | Slug uniqueness re-check on create; `excludeId` ownership |
| L3 | `feat/l3-r2-orphan-cleanup` | `L3-084` | Middle-ground R2 delete UX + orphan cleanup cron |
| L4 | `feat/l4-signup-captcha-logout` | `L4-085`, `L4-086`, `L4-098` | Signup CAPTCHA (if needed); logout hardening; in-app forgot-password flow |
| L5 | `feat/l5-avatar-public-id-paths` | `L5-087` | Avoid Auth `user_id` in profile-picture URLs |
| L6 | `refactor/l6-central-api-client` | `L6-088` | Central API client |
| L7 | `feat/l7-admin-dashboard-stats` | `L7-080` | Admin dashboard stats section |
| L8 | `chore/l8-waitlist-upload-ops-polish` | `L8-094`, `L8-095`, `L8-096` | Waitlist duplicate **200**; tighter picture upload limit; upload metrics |
| L9 | `chore/l9-public-id-backfill-script` | `L9-089` | Replay-safe `public_id` backfill — only if replaying migrations on old data |
| L10 | `feat/l10-content-hash-cv-dedupe` | `L10-093` | Content-hash R2 deduplication — optional storage optimization |

#### Out of plan

| Tickets | Notes |
| ------- | ----- |
| `OUT-097` | **Won’t (this time)** — soft-delete applications; archive + flagged 90-day hard-delete cover the need |

---

### Suggested next PRs (start here)

1. **C1** — `fix/c1-signup-profile-invariants` (`C1-009`, `C1-010`, `C1-038`)  
2. **D1** — `fix/d1-ssr-view-rate-limit` (`D1-007`, `D1-061`)  
3. **E1 → E2 → E3** — `docs/e1-pricing-tiers` → `feat/e2-payment-membership` → `feat/e3-pricing-page`  
