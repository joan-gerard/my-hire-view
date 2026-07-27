# CV reuse and storage design

This document records why MyHireView moved from **one uploaded PDF per application** to a **master CV library + optional custom CV**, what problem that solves, alternatives we considered, and what we ship now versus later (archive retention).

---

## The problem

Each application stores a `cv_url` pointing at a PDF in Cloudflare R2. On create, the form always started with an empty CV field: the user had to select a file again, and `POST /api/upload` wrote a **new** object keyed by a fresh idempotency UUID (`cvs/idempotency/<key>.pdf`).

That meant:

1. **Duplication** — Ten applications with the same résumé created ten identical (or near-identical) R2 objects.
2. **Friction** — Candidates re-uploaded the same file for every company/role.
3. **Cost growth** — Storage compounds with applications × file size. R2 is cheap at small scale, but the architecture did not encourage reuse.
4. **Lifecycle risk** — Archive kept CVs forever; there was no account-deletion path yet; deleting an application always called `deleteCvIfOurs`, which is unsafe if multiple rows share one URL.

Idempotency only deduped **retries within one form session**, not the same file across applications.

---

## Options considered

### Option A — Keep one CV upload per application (status quo)

| Pros | Cons |
|------|------|
| Simple: one app ↔ one object | Storage waste; poor UX for reuse |
| Delete app = delete object is trivial | Encourages re-upload every time |

**Rejected** as the long-term model — fine for MVP, not for growth.

### Option B — Content-hash deduplication only

Key objects by SHA-256 so identical bytes share one R2 key; reference-count on delete.

| Pros | Cons |
|------|------|
| Automatic storage savings | No UX improvement (still pick a file each time) |
| | Hash collisions / rename UX; complex delete bookkeeping |

**Deferred** — useful later as an optimization; does not teach reuse.

### Option C — “Reuse last CV” shortcut only

Prefill `cv_url` from the user’s most recent application.

| Pros | Cons |
|------|------|
| Small change | No library; hard to maintain several résumé versions |
| | Delete of the “source” app can break others if URLs are shared carelessly |

**Rejected** as the sole solution — too thin for multi-version CVs.

### Option D — Master CV library + optional custom CV (chosen)

| Piece | Behaviour |
|-------|-----------|
| **Master CVs** | Up to **5** PDFs managed on the **profile** only. Stored under a master key prefix; URLs listed on the profile (or `master_cvs` table). |
| **Custom CVs** | Per-application upload when the candidate needs a one-off version. |
| **Create UX** | Default: pick from master library. Override: “Upload a different CV for this application.” |
| **Edit UX** | Show current mode (master vs custom) and filename; allow switching either way. |
| **Switch custom → master** | Confirm modal (“I Understand”) → delete the custom R2 object. |
| **Switch master → custom** | Upload custom; do **not** delete the master. |
| **Delete application** | Custom → delete R2 object. Master → leave object (still owned by profile). |
| **Delete master from profile** | Warn if applications still reference it; allow delete after confirm. Those apps then show **missing CV** on the dashboard. |

**Chosen** — balances storage, UX, and clear ownership (profile owns masters; applications own customs).

### Option E — Single profile CV only (like profile picture)

One CV on the profile, copied to every application.

| Pros | Cons |
|------|------|
| Matches picture model | Too rigid for tailored résumés |
| | No room for role-specific PDFs without breaking the model |

**Rejected** — five masters + custom override is more realistic for job search.

---

## Application status and archive clock

Separately from storage, we replace `is_active` (boolean) with:

| Value | Meaning |
|-------|---------|
| `active` | Live shareable application |
| `draft` | Reserved for preview / save-before-publish (preview backlog) |
| `archived` | Soft-hidden on the public page; CV/video not shown to recruiters |

**`archived_at`** is set when status becomes `archived`. Restoring to `active` clears it; archiving again **resets** the 90-day retention clock.

This prepares for a future hard-delete of long-archived applications without encoding that purge in the first ship.

---

## Decision (what we implement now)

| Area | Ship now |
|------|----------|
| Schema | `applications.status`, `applications.archived_at`; master CV storage on profile; `cv_kind` (`master` \| `custom`) and optional `master_cv_id` on applications |
| Profile UI | Upload / list / delete masters (max 5); confirm when in use |
| Application form | Master picker by default; custom override; edit shows mode + name; custom→master confirmation + R2 cleanup |
| Delete rules | Master-aware `deleteCvIfOurs` / application DELETE and CV replace |
| Dashboard | Missing-CV signal when the object is gone (e.g. master deleted while apps still point at it) |
| Docs | This retrospective + backlog tickets for retention |

---

## Deferred (after launch)

| Item | Why later |
|------|-----------|
| Auto-purge archived apps after **90 days** | Needs cron, safe delete rules, and user communication |
| Dashboard **90-day tooltip** / countdown | Depends on product-real purge policy |
| **Email** on archive, ~7 days before purge, after delete | Needs transactional email provider |
| **Feature flag** for 90-day deletion | Default off until emails + UX are ready |
| Terms / Privacy retention copy | When the policy is live (even if flag is off) |

Until then: archive remains soft-hide; hard delete stays a user action (or future flagged job).

---

## Technical summary (target shape)

### Storage keys

- Masters: `cvs/masters/{userId}/{id}.pdf`
- Customs: keep idempotent upload path (or `cvs/custom/{userId}/…`) so custom objects are distinguishable

### Delete helper

On application delete or CV replace:

1. If `cv_kind === 'master'` (or `cv_url` is in the user’s master list) → **do not** delete the R2 object.
2. If `cv_kind === 'custom'` → `deleteCvIfOurs(cv_url)`.

### Master delete from profile

1. Count applications referencing that master.
2. If count > 0 → confirm dialog, then delete R2 + remove from library; apps keep the URL but dashboard/`cv_exists` show missing.
3. If count = 0 → delete immediately.

### List API

Extend dashboard list with a CV existence signal (HeadObject or equivalent) so cards can show missing-CV without opening edit.

### Application form UX

One **CV** fieldset (`CvSourceField`): on edit, a **Current** summary (filename, master/custom badge, View / missing); **Change CV** via radios with progressive disclosure (master dropdown or custom upload); **Download name** for recruiters in the same section. Switching custom → master confirms before the custom object is dropped on save.

---

## Related docs

- [PDF_AND_R2.md](PDF_AND_R2.md) — upload/delete mechanics
- [PROFILE_PICTURE.md](PROFILE_PICTURE.md) — analogous profile-owned asset pattern
- [API_REFERENCE.md](API_REFERENCE.md) — endpoints
- [Backlog.md](Backlog.md) — after-launch retention tickets
- [DATA_FLOW.md](DATA_FLOW.md) — create/edit flows
