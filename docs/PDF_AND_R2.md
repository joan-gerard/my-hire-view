# PDFs and Cloudflare R2

**Actionable work** lives in [Backlog.md](Backlog.md). This doc is storage design/context only — not a second checklist.

This document describes how the application handles CV PDFs and **Cloudflare R2** object storage (S3-compatible API).

## Overview

- **What we store:** CV PDFs in Cloudflare R2.
  - **Primary CVs** — up to 5 per user, managed from the profile or from **New** / **Edit application** (`primary_cvs` table, keys `cvs/{userId}/primary/…`).
  - **Tailored CVs** — one optional per-application upload (keys `cvs/{userId}/tailored/…` via idempotent upload).
- **Where:** Cloudflare R2. Objects are uploaded with a **public URL** so the shareable application page can load the PDF.
- **Policy:** Upload on save for tailored CVs. Application delete/replace removes **tailored** objects only; primary CVs are deleted only from the library (profile or in-form modal). See [CV_REUSE_AND_STORAGE.md](retrospectives/CV_REUSE_AND_STORAGE.md).

## Flow

### Create application

1. Prefer selecting a **primary CV** from the library (default when any exist). Upload or manage primaries via **Manage library** without leaving the form.
2. Or choose **tailored**: select a PDF (held in memory until Save), then upload on submit via `POST /api/upload`.
3. Application row stores `cv_url`, `cv_type` (`primary` | `tailored`), and optional `primary_cv_id`.

### Edit application

1. Form shows current mode (primary vs tailored) and filename.
2. Switching **tailored → primary** shows a confirm modal; the tailored R2 object is deleted on save when `cv_url` changes.
3. Switching **primary → tailored** uploads a new tailored file; the primary library entry is unchanged.

### Delete application

1. If `cv_type = tailored`, delete the R2 object (`deleteApplicationCvIfTailored`). **Fail closed:** if R2 delete fails, the API returns **500** and does **not** delete the applications row (avoids “deleted” apps that still have a PDF in storage).
2. If R2 succeeds (or `cv_type = primary`, leave the library object), delete the applications row.

### Delete primary CV (library)

1. If **no** applications reference it (`applications_count = 0`), delete immediately (no confirm).
2. If **N ≥ 1** applications reference it, confirm with a message that includes **N** plus a preview list of those applications (company — role, status; links to edit), then delete.
3. Delete library row + R2 object. Affected applications keep the old URL and show **CV missing** on the dashboard until edited.

## API and code

| Piece | Role |
|-------|------|
| `POST /api/upload` | Tailored CV upload (auth + idempotency). Keys `cvs/{userId}/tailored/<key>.pdf`. |
| `GET/POST/DELETE /api/profile/primary-cvs` | Primary CV library (max 5). Keys `cvs/{userId}/primary/{id}.pdf`. GET includes `applications_count` and a `used_by` preview per row. |
| `lib/storage/r2-client.ts` | S3-compatible R2 client. |
| `lib/utils/cv-storage.ts` | `getCvObjectKeyFromPublicUrl`, `toCanonicalCvPublicUrl`, `isOwnedTailoredCvUrl`, `isOwnedCvUrl`, `deleteCvIfOurs(url, userId)`, `deleteApplicationCvIfTailored` (allow-list tailored only; fail closed if `R2_PUBLIC_BASE_URL` unset), `checkCvObjectExists` (`true` / `false` for R2 URLs; `undefined` when the URL is outside our R2 public base). |

## Idempotency

- Send **`Idempotency-Key: <opaque>`** on each tailored CV upload (the application form uses a new UUID whenever the user picks a PDF).
- Object keys are scoped per user: `cvs/{userId}/tailored/<key>.pdf`.
- Retries or duplicate submits with the **same** key reuse the **same** R2 object URL; the server short-circuits with `HeadObject` when the object already exists and its size/content-type match the request (mismatch → **409**).
- Creates use a conditional `PutObject` (`IfNoneMatch: "*"`). If another request already created the object, R2 returns **412** and the API re-checks HeadObject, then responds with `{ url, idempotent: true }` or **409** instead of overwriting.
- Upload rate limit is **10/min** per IP and per user; at most **2** concurrent uploads per user (in-memory, per instance).

## Safety

- **PDF content:** Upload routes check MIME type and that the body starts with `%PDF` before writing to R2.
- **URL check:** Deletes run only when the URL prefix matches `R2_PUBLIC_BASE_URL` **and** the object key belongs to the authenticated user. Application cleanup (`deleteApplicationCvIfTailored`) allow-lists `cv_type === "tailored"` **and** `cvs/{userId}/tailored/…` only — never primary library keys. `deleteCvIfOurs` may delete primary or tailored keys (library delete path).
- **Attach check:** Creating/updating a tailored application CV rejects `cv_url` values that are not under `cvs/{userId}/tailored/…`, stores a **canonical** public URL (decoded object key), and rejects URLs already used by another of the user’s applications (**409**, object-key compare). Partial unique index `applications_user_id_tailored_cv_url_key` backs races. Re-uploading the same PDF for a second app creates a distinct object. Primary CVs remain intentionally shareable via `cv_type: "primary"`.
- **Delete errors (fail closed):** `deleteCvIfOurs` / `deleteApplicationCvIfTailored` log and **rethrow** by default. Missing `R2_PUBLIC_BASE_URL` also throws when a non-empty URL needs cleanup (no silent skip). Application delete and primary-library delete remove the R2 object **before** the DB row; if R2 fails, the API returns **500** and leaves the row. After a successful application **update** that replaces a tailored CV, cleanup of the *previous* object uses `{ onError: "log" }` so a stuck old file does not fail the save.

## Future option: middle ground + orphan cleanup

Today we prefer fail-closed deletes so a “deleted” application never leaves its tailored PDF behind while the row is gone. A possible later alternative:

1. **Middle ground on delete** — always delete the applications row (and return success) even if R2 cleanup fails.
2. **Orphan tailored CV cron** — periodically list/delete R2 objects under `cvs/{userId}/tailored/…` that are not referenced by any `applications.cv_url` (and never touch `primary/…`).

That improves delete UX during R2 outages at the cost of temporary orphans and a scheduled job. Keep fail-closed until that cron exists.

## Environment variables

| Variable | Purpose |
|----------|---------|
| `R2_ACCOUNT_ID` | Cloudflare account ID (R2 overview / dashboard URL). |
| `R2_ACCESS_KEY_ID` | R2 API token access key. |
| `R2_SECRET_ACCESS_KEY` | R2 API token secret. |
| `R2_BUCKET_NAME` | Bucket name for CV PDFs. |
| `R2_PUBLIC_BASE_URL` | Public origin for objects, **no trailing slash** (e.g. `https://pub-xxxxx.r2.dev` or `https://cv.yourdomain.com`). Must match how browsers resolve CV URLs. |

Create an R2 bucket, enable **public access** on that bucket (custom hostname or r2.dev), and create an **API token** with permission to read/write objects in that bucket. See [Cloudflare R2 documentation](https://developers.cloudflare.com/r2/).

Object keys use per-user prefixes: `cvs/{userId}/tailored/<key>.pdf` (tailored) and `cvs/{userId}/primary/{id}.pdf` (primary library).

## Local development

Copy `.env.local.example` to `.env.local` and set all `R2_*` variables. Without them, `POST /api/upload` responds with 500 (“File upload is not configured”). Without a session, it responds with **401** (“Unauthorized”).
