# SSR public view — in-process load

**Actionable work** lives in [Backlog.md](../Backlog.md). This retrospective is design/context only — not a second checklist.

This document records why the public share page (`/view/[publicId]/[slug]`) originally called its own HTTP API during server render, what broke in production, and what we changed in PR **D1** (`D1-007`, `D1-061`).

---

## The problem

Recruiters open share links at `/view/{publicId}/{slug}`. That page is a React Server Component (RSC) that must load application data before rendering.

The original implementation did this:

```
RSC page → fetch(getBaseUrl() + '/api/applications/...') → public GET route → resolvePublicApplication
```

That pattern is common in Next.js apps (reuse the API contract on the server), but it caused two launch-blocking issues:

### 1. Cross-visitor rate limiting (D1-007)

The public GET route applies **120 requests / minute / IP**. Server-side `fetch` calls do not carry the recruiter’s browser IP. They appear as one shared client (`unknown` or the server’s own address). Every SSR page load consumed the same bucket.

**Symptom:** After modest traffic, unrelated recruiters saw **429 Too Many Requests** on first paint — the product looked down even though no one was scraping.

Client-side refetches (e.g. after CV upload on the view page) still correctly hit the API and remain per-visitor limited.

### 2. Wrong base URL in production (D1-061)

`getBaseUrl()` fell back to `http://localhost:3000` when `NEXT_PUBLIC_SITE_URL` was unset. On the server in production, the RSC `fetch` therefore targeted localhost instead of the live API.

**Symptom:** Share pages could fail for **every** visitor when the env var was missing. Copied share links built on the server could also point at localhost.

---

## Options considered

### A — Exempt internal/server fetches from the rate limit

Add a header or internal flag so SSR loads skip the 120/min cap.

| Pros | Cons |
|------|------|
| Small API change | Still depends on SSR self-`fetch` and `getBaseUrl()` |
| Keeps one code path via HTTP | Does not fix localhost fallback (D1-061) |
| | Harder to reason about who counts toward limits |

**Rejected** — fixes the symptom, not the architecture.

### B — Load in-process on the RSC (chosen)

Call shared loader logic directly from the page (`loadPublicApplicationResponse` → `resolvePublicApplication` + optional R2 `cv_exists` check). Keep the public GET route for browsers and refetches; both use the same helper.

| Pros | Cons |
|------|------|
| SSR no longer consumes per-IP quota | Two entry points (page + API) must stay in sync — mitigated by shared helper |
| No HTTP hop; no base URL needed for first paint | |
| Faster first render | |
| Matches how other server code already uses service-role resolution | |

**Chosen** — fixes D1-007 and removes the SSR dependency on D1-061.

### C — Derive server fetch origin from request `Host` / `x-forwarded-host`

Keep self-`fetch` but build the URL from the incoming request.

| Pros | Cons |
|------|------|
| Works on preview deploys without env | Preview URL ≠ canonical URL for share links |
| | Still hits rate limit as one client |
| | Extra network round-trip on every page view |

**Rejected** for SSR load; canonical share links still require explicit `NEXT_PUBLIC_SITE_URL`.

---

## What we shipped

| Area | Change |
|------|--------|
| `lib/utils/load-public-application-response.ts` | Shared loader for public DTO (resolve + status + `cv_exists`) |
| `app/view/[publicId]/[slug]/page.tsx` | RSC calls loader directly; no SSR `fetch` |
| `app/api/applications/[publicId]/[slug]/route.ts` | GET uses same loader; rate limit unchanged for real clients |
| `lib/utils/url.ts` | Production server: **require** `NEXT_PUBLIC_SITE_URL` (fail fast if unset, non-http(s), or loopback hostname); dev keeps localhost fallback; client uses `window.location.origin`. Example env ships a blank value so copy-paste does not deploy localhost to production. |
| `lib/utils/resolve-public-application.ts` | DB query errors throw (→ **500**); missing rows still return null (→ **404**) |
| `lib/utils/cv-storage.ts` | `checkCvObjectExists`: object NotFound → `false`; NoSuchBucket and other HeadObject failures → omit `cv_exists` (not false) |
| Tests | Loader + resolver + URL helper tests; route tests mock loader |

**Unchanged:** Browser `fetch('/api/applications/...')` from `ViewPageContent` for refetch; view/download analytics POSTs; per-IP limits on those routes.

---

## Lessons

1. **Do not rate-limit your own SSR as if it were a single user.** Internal server work should not share a public scraping cap keyed by IP.
2. **Prefer in-process calls for RSC data that already lives in the same app.** Reuse a shared function, not an HTTP loopback, unless you need edge caching or a separate service boundary.
3. **Canonical site URL belongs in env for share links.** Fail fast in production when the var is unset **or still set to localhost** — copying `.env.local.example` must not silently ship localhost URLs.
4. **Distinguish not-found from outage in shared loaders.** DB errors should surface as **500**, not **404**; R2 HeadObject outages should omit `cv_exists`, not claim the CV is missing.

---

## Related docs

- [API_REFERENCE.md](../API_REFERENCE.md) — public GET contract
- [ARCHITECTURE.md](../ARCHITECTURE.md) — public view sequence diagram
- [PUBLIC_URL_OPTION_B.md](PUBLIC_URL_OPTION_B.md) — share URL shape
