# PDFs and Cloudflare R2

This document describes how the application handles CV PDFs and **Cloudflare R2** object storage (S3-compatible API).

## Overview

- **What we store:** CV PDFs in Cloudflare R2.
  - **Master CVs** — up to 5 per user, managed on the profile (`master_cvs` table, keys `cvs/masters/{userId}/…`).
  - **Custom CVs** — one optional per-application upload (keys via idempotent upload).
- **Where:** Cloudflare R2. Objects are uploaded with a **public URL** so the shareable application page can load the PDF.
- **Policy:** Upload on save for custom CVs. Application delete/replace removes **custom** objects only; master CVs are deleted only from the profile library. See [CV_REUSE_AND_STORAGE.md](CV_REUSE_AND_STORAGE.md).

## Flow

### Create application

1. Prefer selecting a **master CV** from the profile library (default when any exist).
2. Or choose **custom**: select a PDF (held in memory until Save), then upload on submit via `POST /api/upload`.
3. Application row stores `cv_url`, `cv_kind` (`master` | `custom`), and optional `master_cv_id`.

### Edit application

1. Form shows current mode (master vs custom) and filename.
2. Switching **custom → master** shows a confirm modal; the custom R2 object is deleted on save when `cv_url` changes.
3. Switching **master → custom** uploads a new custom file; the master library entry is unchanged.

### Delete application

1. If `cv_kind = custom`, delete the R2 object (`deleteApplicationCvIfCustom`).
2. If `cv_kind = master`, leave the R2 object (still in the library).

### Delete master CV (profile)

1. Confirm dialog (allowed even when applications still reference it).
2. Delete library row + R2 object. Applications keep the old URL and show **CV missing** on the dashboard until edited.

## API and code

| Piece | Role |
|-------|------|
| `POST /api/upload` | Custom CV upload (auth + idempotency). Keys `cvs/idempotency/<key>.pdf`. |
| `GET/POST/DELETE /api/profile/master-cvs` | Master CV library (max 5). Keys `cvs/masters/{userId}/{id}.pdf`. |
| `lib/storage/r2-client.ts` | S3-compatible R2 client. |
| `lib/utils/cv-storage.ts` | `deleteCvIfOurs`, `deleteApplicationCvIfCustom`, `checkCvObjectExists`. |

## Idempotency

- Send **`Idempotency-Key: <opaque>`** on each CV upload (the application form uses a new UUID whenever the user picks a PDF).
- Retries or duplicate submits with the **same** key reuse the **same** R2 object URL; the server short-circuits with `HeadObject` when the object already exists.

## Safety

- **URL check:** Deletes run only when the URL prefix matches `R2_PUBLIC_BASE_URL`, so arbitrary URLs in `cv_url` are not passed to the delete API.
- **Errors:** Delete failures are logged and do not block DB updates or deletes.

## Environment variables

| Variable | Purpose |
|----------|---------|
| `R2_ACCOUNT_ID` | Cloudflare account ID (R2 overview / dashboard URL). |
| `R2_ACCESS_KEY_ID` | R2 API token access key. |
| `R2_SECRET_ACCESS_KEY` | R2 API token secret. |
| `R2_BUCKET_NAME` | Bucket name for CV PDFs. |
| `R2_PUBLIC_BASE_URL` | Public origin for objects, **no trailing slash** (e.g. `https://pub-xxxxx.r2.dev` or `https://cv.yourdomain.com`). Must match how browsers resolve CV URLs. |

Create an R2 bucket, enable **public access** on that bucket (custom hostname or r2.dev), and create an **API token** with permission to read/write objects in that bucket. See [Cloudflare R2 documentation](https://developers.cloudflare.com/r2/).

Object keys are stored as `cvs/<uuid>.pdf`.

## Local development

Copy `.env.local.example` to `.env.local` and set all `R2_*` variables. Without them, `POST /api/upload` responds with 500 (“File upload is not configured”). Without a session, it responds with **401** (“Unauthorized”).
