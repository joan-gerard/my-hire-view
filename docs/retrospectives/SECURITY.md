# Security — what we protect and how

**Actionable work** lives in [Backlog.md](../Backlog.md). This retrospective is a living record of safety concerns we addressed (or plan to address) for MyHireView — not a second checklist.

MyHireView holds career-sensitive data: CVs, profile pictures, application details, and share links recruiters open. Security work focuses on **who can access what**, **stopping abuse**, and **not leaking hints** that help attackers.

---

## Principles

1. **Least privilege** — public share links expose only what an active application should show; everything else needs a signed-in owner.
2. **Fail closed on ownership** — deletes and uploads that touch storage or another user’s row should not “succeed” into a broken or stolen state.
3. **Generic errors at the front door** — login/signup must not reveal whether an email is registered.
4. **Rate limits that survive scale** — throttles must work across serverless instances, not only in one process’s memory.
5. **Validate what we accept** — emails, passwords, file bytes, and URLs are checked before they hit Auth, DB, or object storage.

---

## Shipped concerns

### Auth & sessions

| Concern | How we addressed it | Tickets / refs |
| -------- | ------------------- | -------------- |
| Session cookies must land on API responses so middleware sees the user | Route handlers use `createSupabaseRouteClient` (+ cookie copy for signup PKCE) | Auth routes; [SUPABASE_AUTH_SETUP.md](../SUPABASE_AUTH_SETUP.md) |
| Post-login redirect could be abused as an open redirect | `safeNextPath` allows only safe same-origin relative paths | **A2-016** |
| Admin UI without a session | Middleware refreshes session; `/admin` redirects to `/login`; APIs use `requireAuth()` | Middleware / `lib/auth` |
| Login / signup / logout flooding | Per-IP rate limits (login **15**/min, signup **5**/min, logout **20**/min) | Auth routes + **D3** durable limits |
| Weak signup passwords | Require ≥ **8** Unicode code points, ≤ **72** UTF-8 bytes, and ≥ **1** special character that is not a Unicode letter, number, or whitespace (client + `POST /api/auth/signup`) | **F1-041** |
| Auth error messages revealing account existence | Generic client messages for non-duplicate Auth failures; duplicate signup returns the same **200** + `requiresConfirmation` **and** PKCE/`Set-Cookie` headers as a new confirmation signup; malformed JSON → **400** | **F1-040** |
| Profiles row missing after signup/confirm glitches | Service-role `createInitialProfile`; callback + login bootstrap retries | **C1-009**, **C1-010**, **C1-038** |

### Database / RLS

| Concern | How we addressed it | Tickets / refs |
| -------- | ------------------- | -------------- |
| Users reading or writing others’ applications | Owner-only RLS for application CRUD | Early migrations |
| Anyone with anon key could `SELECT` all applications | Dropped open public SELECT; public resolve uses service role with intentional filters | **A2-016**, migration **025** |
| Profiles / waitlist abuse via client DB | Profiles own-row RLS; waitlist has RLS on and **no** client policies (service-role inserts only) | Waitlist / profiles migrations |
| View/download counters under RLS | `SECURITY DEFINER` RPCs callable as `service_role` only | Migrations **009** / **010** |
| Avatar Storage open to other users | Own-folder upload/update/delete; public read for display | Migration **014** |
| Tailored CV URL collisions / wrong primary CV ownership | Partial unique index; same-user ownership triggers | **B1-003**, **B3-042** |

### Uploads & files

| Concern | How we addressed it | Tickets / refs |
| -------- | ------------------- | -------------- |
| Unauthenticated uploads | CV upload and slug routes require auth | Upload / slug APIs |
| Fake “PDF” / image payloads | `%PDF` magic bytes; JPEG/PNG/WebP header checks; size caps | Upload routes |
| Upload replay / burst abuse | Per-user idempotency keys; tight rate limits; concurrency caps | Upload routes |
| Deleting or pointing at storage outside our allow-list | Allow-listed tailored keys; fail closed when R2 / public base URL missing | **B1-004**, **B1-005** |
| Profile picture URL pointing at another origin or user folder | Origin + caller-folder checks | **C2-008** |

### Public share links & analytics

| Concern | How we addressed it | Tickets / refs |
| -------- | ------------------- | -------------- |
| Guessable global slug URLs | Opaque `public_id` in path: `/view/{publicId}/{slug}` (Option B) | [PUBLIC_URL_OPTION_B.md](PUBLIC_URL_OPTION_B.md) |
| Archived/draft apps leaking via share URL | Active-only content; shared empty state; `noindex` + referrer policy on `/view/*` | Public view |
| SSR burning the public rate-limit bucket for everyone | In-process public load (no self-HTTP); production site URL fail-fast | **D1-007**, **D1-061** — [SSR_PUBLIC_VIEW.md](SSR_PUBLIC_VIEW.md) |
| View/download analytics spam | Per-IP + per-path caps; same-origin checks; httpOnly dedupe cookies; owner actions not counted | View/download routes |
| Junk paths growing in-memory rate-limit maps | Validate `publicId`/slug before per-path keys; soft cap / sweep on memory fallback | **D3-001** |
| Limits not shared across serverless instances | Upstash Redis when configured; in-memory fallback otherwise (documented) | **D3-001** |

### Rate limiting (platform)

| Concern | How we addressed it | Tickets / refs |
| -------- | ------------------- | -------------- |
| Default API write abuse | Shared `lib/rate-limit.ts` (default **60**/min/IP, tighter on sensitive routes) | Pre-launch + **D2** / **D3** |
| Slug-validate sharing the general write budget | Dedicated `keyPrefix: "slug-validate"` (**30**/min) | **D2-034** |

---

## Planned / open concerns

Keep these visible so product and engineering share one security story. Status is owned in [Backlog.md](../Backlog.md).

| Concern | Planned approach | Tickets |
| -------- | ---------------- | ------- |
| Unconfirmed emails getting sessions in production | Ops: Confirm email ON; production Site URL + redirect URLs | **A3-015** (near launch) |
| Waitlist bot / spam signups | CAPTCHA / Turnstile / honeypot; tighter name/email validation | **F3-039**, **F3-064** |
| Unauth callers learning R2 is misconfigured (**500** vs **401**) | Check auth before config probe; stronger upload replay identity | **F7-035**, **F7-036** |
| Misuse of `toPublicApplication` leaking non-active PII | Enforce status in helper / narrow types | **F10-030** |
| Broader read limits; account-/email-level login throttling; Redis outage noise | Extend limits; circuit breaker after repeated Upstash failures | **L1-076**, **L1-077**, **L1-100** |
| Signup CAPTCHA; logout hardening (CSRF); in-app forgot-password | After-launch auth polish | **L4-085**, **L4-086**, **L4-098** |
| Auth `user_id` visible in avatar public URLs | Store under `public_id` (or similar) + migrate | **L5-087** |
| Waitlist duplicate email **409** vs **200** (enumeration trade-off) | Product decision + uniform success response if chosen | **L8-094** |
| Account deletion / legal pages (privacy & compliance adjacent) | User-driven delete; Terms / Privacy / Cookies | **F21-020**, **F20-019** |

---

## F1 deep dive (this PR)

**Problem:** Login and signup forwarded Auth provider messages (e.g. “User already registered”) and only required a short password. Attackers could probe which emails had accounts; users could create weak passwords.

**What we shipped**

- Shared Zod schemas and helpers in `lib/validation/auth.ts`
- Signup: ≥ 8 Unicode code points, ≤ 72 UTF-8 bytes (length short-circuit before encode; no HTML `maxLength` byte illusion), ≥ 1 special char via `/[^\p{L}\p{N}\s]/u`; auth JSON capped at 8 KiB (streamed bytes, fatal UTF-8); duplicates → confirmation-style **200**
- Login/signup: email format and max lengths; password max length; malformed JSON → **400**
- Generic Auth failure messages (non-duplicate); unexpected Auth throws logged with a safe client **500**
- API contract updated in [API_REFERENCE.md](../API_REFERENCE.md)

---

## How to extend this doc

When a security-related ticket ships (or a new concern is accepted into the backlog):

1. Add or move a row under **Shipped** or **Planned** with the concern, approach, and ticket id.
2. Keep [Backlog.md](../Backlog.md) as the only open checklist — strike or remove rows there when work ships.
3. Prefer linking to focused retrospectives (e.g. [SSR_PUBLIC_VIEW.md](SSR_PUBLIC_VIEW.md)) for deep design notes; keep this file as the index of *what* and *why*.

---

## Related docs

- [Backlog.md](../Backlog.md) — open / shipped ticket tracker
- [API_REFERENCE.md](../API_REFERENCE.md) — route contracts, rate limits, auth errors
- [SUPABASE_AUTH_SETUP.md](../SUPABASE_AUTH_SETUP.md) — Auth provider configuration
- [CODE_REVIEW.md](../CODE_REVIEW.md) — historical review notes
- [SSR_PUBLIC_VIEW.md](SSR_PUBLIC_VIEW.md) — public view SSR vs rate limits
- [PUBLIC_URL_OPTION_B.md](PUBLIC_URL_OPTION_B.md) — opaque share URLs
