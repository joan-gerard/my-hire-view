# Public URL design — Option B

This document records why MyHireView adopted **Option B** for shareable application URLs, what problem it solves, alternatives we considered, and what we shipped.

---

## The problem

Originally, each application had a single global slug and a public URL:

```
/view/{slug}
→ /view/acme-software-engineer
```

Slugs were **globally unique** in the database (`applications.slug UNIQUE`). That created two issues:

1. **Collision** — Two candidates applying to the same company and role could not both use `acme-software-engineer`. The product pushed “name in URL” as a workaround so slugs became `john-doe-acme-software-engineer`, but that was a collision strategy, not a preference.
2. **Privacy / GDPR** — Putting a candidate’s name in the URL by default (or as the only way to disambiguate) increases risk: URLs appear in browser history, referrer logs, analytics, and forwarded messages. Names in the page body are easier to control; names in paths are personal data in a more exposed form.

We still wanted human-readable slugs (`company-role`) for sharing and recognition, and we still wanted users to **optionally** include their name in the slug when they choose to.

---

## Options considered

### Option A — Force name in URL

Require first/last name in every slug so global uniqueness holds.

| Pros | Cons |
|------|------|
| Simple schema change | Name in URL by default; poor GDPR posture |
| Readable links | Awkward when users do not want their name in the link |
| | Does not scale if display names duplicate |

**Rejected** — too privacy-hostile as a default.

### Option B — Opaque public id + per-user slug (chosen)

```
/view/{publicId}/{applicationSlug}
→ /view/k7x2m9ab/acme-software-engineer
```

| Pros | Cons |
|------|------|
| Two users can share the same `acme-software-engineer` | URLs are slightly longer |
| Default path has no name; name in slug stays **optional** | Requires `profiles.public_id` and routing changes |
| Opaque `publicId` is not derived from PII | Profile row needed (or metadata) to resolve `publicId` |
| Familiar pattern (opaque id + human segment) | |

**Chosen** — best balance of collision freedom, privacy defaults, and readable slugs.

### Option C — Numeric / random suffix on global slug

Keep `/view/{slug}` but append `-2`, `-3`, or a random suffix on collision.

| Pros | Cons |
|------|------|
| Minimal URL shape change | Ugly or unpredictable suffixes |
| | Still global namespace; collisions feel arbitrary |
| | Name-in-URL pressure remains for “nice” URLs |

**Rejected** — does not fix the namespace or privacy story cleanly.

### Option D — Fully opaque single token

`/view/{opaqueToken}` only — no company/role in the path.

| Pros | Cons |
|------|------|
| Maximum privacy in the URL | Loses human-readable share links |
| | Harder for candidates to recognize which link is which |

**Deferred** — possible future mode; not the default experience.

### Option E — Vanity handle (LinkedIn-style)

`/view/{customHandle}/{slug}` where the user picks `customHandle`.

| Pros | Cons |
|------|------|
| Brandable, memorable | Global uniqueness + moderation + squatting |
| Strong premium feature | More product and legal surface |

**Deferred** — see [Future: custom public id](#future-custom-public-id-vanity-handle) below.

---

## Decision

We implemented **Option B**:

| Piece | Behaviour |
|-------|-----------|
| **`profiles.public_id`** | Short random opaque id (8 chars, lowercase alphanumeric). Assigned at signup in Auth `user_metadata`, persisted on `profiles` on first profile save or first application create. |
| **`applications.slug`** | Still `company-role` (optionally with name at start/end via **Name in URL**). |
| **Uniqueness** | `UNIQUE (user_id, slug)` — not global. |
| **Public URL** | `/view/{publicId}/{slug}` |
| **Name in URL** | **Kept** as optional (`include_name_in_slug`: `null` \| `start` \| `end`). |
| **Privacy defaults** | `noindex` / `X-Robots-Tag` and `Referrer-Policy: no-referrer` on `/view/*` |
| **Migration** | No backfill or legacy redirects required for this rollout (data was reset). |

---

## What we implemented (technical summary)

### Database (`020_profiles_public_id_per_user_slug.sql`)

- `profiles.public_id TEXT NOT NULL UNIQUE`
- Drop global `applications.slug` unique constraint; add `UNIQUE (user_id, slug)`
- RPCs `increment_application_view_count` and `increment_application_download_count` take `(p_public_id, p_slug)`

### Auth & profile

- Signup writes `public_id` into `user_metadata` via `generatePublicId()`
- `PUT /api/profile` stores `public_id` on the profile row and syncs metadata
- `ensureProfilePublicId()` runs before creating an application so public resolution works even before a full profile save. Dashboard list (`GET /api/applications`) only **reads** `public_id` (profiles, then Auth metadata) and does not create a profiles row.

### Routing & APIs

| Before | After |
|--------|--------|
| `/view/[slug]` | `/view/[publicId]/[slug]` |
| `/api/applications/[slug]` | `/api/applications/[publicId]/[slug]` |
| Slug uniqueness global | Slug uniqueness per authenticated user |
| `POST /api/slug` unauthenticated | `POST /api/slug` requires auth |

Public resolution: `public_id` → profile (`user_id`) → application by `(user_id, slug)`. Profile lookup uses the service-role client because RLS does not expose `profiles` to anonymous callers.

### Client

- `getApplicationUrl(publicId, slug)` for share links
- Dashboard list includes `public_id` on each item
- Application form share preview uses `publicId` + slug

---

## Future: custom public id (vanity handle)

A planned enhancement (potentially **premium**):

- Let users choose a custom **public id** (e.g. `joan-gerard`) instead of the assigned opaque id (`k7x2m9ab`), similar to a LinkedIn custom URL.
- URLs would become `/view/joan-gerard/acme-software-engineer` while the opaque id remains the fallback or internal canonical key until the user claims a vanity id.

**Considerations for that feature:**

| Area | Notes |
|------|--------|
| **Uniqueness** | Global uniqueness on vanity handles; reserved/blocked words |
| **Validation** | Format rules, profanity, impersonation, trademark |
| **Migration** | Old opaque links should keep working (redirect or dual lookup) |
| **Privacy** | Vanity ids are more identifying than opaque ids — clear consent and UI copy |
| **Tiering** | Natural fit for a paid tier (custom branding) |
| **Implementation** | Likely `profiles.vanity_public_id` nullable + unique, or `public_id` type enum (`opaque` \| `vanity`) |

This is **out of scope** for the initial Option B release; opaque ids are the only public id type today.

---

## Related docs

- [API_REFERENCE.md](API_REFERENCE.md) — endpoint paths and behaviour
- [DATA_FLOW.md](DATA_FLOW.md) — create/edit/view flows and slug checks
- [ARCHITECTURE.md](ARCHITECTURE.md) — routes and data model
- [USER_GUIDE.md](USER_GUIDE.md) — what candidates see when sharing links
