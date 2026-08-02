# CV reuse and storage design

This document records why MyHireView moved from **one uploaded PDF per application** to a **primary CV library + optional tailored CV**, what problem that solves, alternatives we considered, and what we ship now versus later (archive retention).

> **Terminology:** Current product language is **primary** / **tailored** (`cv_type`, `primary_cvs`, keys under `cvs/{userId}/primary/…` and `cvs/{userId}/tailored/…`). Historical option labels below may still say “master” / “custom” where they reflect the original decision record; migrations `022_master_cvs.sql` → `024_primary_cvs_rename.sql` performed the rename.

---

## The problem

Each application stores a `cv_url` pointing at a PDF in Cloudflare R2. On create, the form always started with an empty CV field: the user had to select a file again, and `POST /api/upload` wrote a **new** object keyed by a fresh idempotency UUID.

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

### Option D — Primary CV library + optional tailored CV (chosen)

*(Originally discussed as “Master CV library + optional custom CV.”)*

| Piece | Behaviour |
|-------|-----------|
| **Primary CVs** | Up to **5** PDFs managed from the **profile** or from **New** / **Edit application** (same library). Stored under `cvs/{userId}/primary/…`; URLs listed via `primary_cvs`. |
| **Tailored CVs** | Per-application upload when the candidate needs a one-off version (`cvs/{userId}/tailored/…`). |
| **Create UX** | Default: pick from primary library. Override: “Upload a different CV for this application.” |
| **Edit UX** | Show current mode (primary vs tailored) and filename; allow switching either way. |
| **Switch tailored → primary** | Confirm modal (“I Understand”) → delete the tailored R2 object. |
| **Switch primary → tailored** | Upload tailored; do **not** delete the primary library entry. |
| **Delete application** | Tailored → delete R2 object. Primary → leave object (still owned by profile). |
| **Delete primary from profile / New / Edit** | If unused, delete immediately. If applications still reference it, confirm with the **count** of those apps; after delete they show **missing CV** on the dashboard. |

**Chosen** — balances storage, UX, and clear ownership (profile owns primaries; applications own tailored uploads).

### Option E — Single profile CV only (like profile picture)

One CV on the profile, copied to every application.

| Pros | Cons |
|------|------|
| Matches picture model | Too rigid for tailored résumés |
| | No room for role-specific PDFs without breaking the model |

**Rejected** — five primaries + tailored override is more realistic for job search.

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
| Schema | `applications.status`, `applications.archived_at`; primary CV storage on profile (`primary_cvs`); `cv_type` (`primary` \| `tailored`) and optional `primary_cv_id` on applications |
| Profile UI | Upload / list / delete primaries (max 5); confirm when in use (`PrimaryCvLibrarySection`, modal, used-by preview) |
| Application form | Primary picker by default; tailored override; edit shows mode + name; tailored→primary confirmation + R2 cleanup |
| Delete rules | Primary-aware `deleteCvIfOurs` / `deleteApplicationCvIfTailored` on application DELETE and CV replace |
| Dashboard | Missing-CV signal when the object is gone (e.g. primary deleted while apps still point at it) |
| API | `GET/POST/DELETE /api/profile/primary-cvs` |
| Docs | This retrospective + backlog tickets for retention |

**Migrations:** `021_application_status_and_archived_at.sql`, `022_master_cvs.sql`, `024_primary_cvs_rename.sql`.

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

## Technical summary (current shape)

### Storage keys

- **Primary library:** `cvs/{userId}/primary/{id}.pdf`
- **Tailored uploads:** `cvs/{userId}/tailored/{id}.pdf` (via `POST /api/upload`)

### Delete helper

On application delete or CV replace:

1. If `cv_type === 'primary'` (or `cv_url` is in the user’s primary library) → **do not** delete the R2 object.
2. If `cv_type === 'tailored'` → `deleteApplicationCvIfTailored` → `deleteCvIfOurs(cv_url, userId)`.

### Primary delete from profile

1. Count applications referencing that primary (`primary_cv_id`).
2. If count > 0 → confirm dialog, then delete R2 + remove from library; apps keep the URL but dashboard/`cv_exists` show missing.
3. If count = 0 → delete immediately.

### List API

Extend dashboard list with a CV existence signal (HeadObject or equivalent) so cards can show missing-CV without opening edit.

### Application form UX

One **CV** fieldset (`CvSourceField`): on edit, a **Current** summary (filename, primary/tailored badge, View / missing); **Change CV** via radios with progressive disclosure (primary dropdown or tailored upload); **Download name** for recruiters in the same section. Switching tailored → primary confirms before the tailored object is dropped on save.

---

## Related docs

- [PDF_AND_R2.md](../PDF_AND_R2.md) — upload/delete mechanics
- [PROFILE_PICTURE.md](../PROFILE_PICTURE.md) — analogous profile-owned asset pattern
- [API_REFERENCE.md](../API_REFERENCE.md) — endpoints
- [Backlog.md](../Backlog.md) — after-launch retention tickets
- [DATA_FLOW.md](../DATA_FLOW.md) — create/edit flows
- [manual-testing/MANUAL_TEST_PRIMARY_CV_AND_STATUS.md](../manual-testing/MANUAL_TEST_PRIMARY_CV_AND_STATUS.md) — manual QA checklist
