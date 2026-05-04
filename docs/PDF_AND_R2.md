# PDFs and Cloudflare R2

This document describes how the application handles CV PDFs and **Cloudflare R2** object storage (S3-compatible API).

## Overview

- **What we store:** One PDF per application (the CV), referenced by `applications.cv_url`.
- **Where:** Cloudflare R2. Objects are uploaded with a **public URL** (custom domain or [R2.dev public bucket URL](https://developers.cloudflare.com/r2/buckets/public-buckets/)) so the shareable application page can load the PDF.
- **Policy:** We use **upload on save**. The file is only sent to R2 when the user saves the application. Replacing or deleting an application deletes the previous object so we avoid orphan files.

## Flow

### Create application

1. User fills the form and selects a PDF in the CV field. The file is kept in memory (browser `File` object); nothing is uploaded yet.
2. User sees a **preview** of the PDF via a blob URL (`URL.createObjectURL(file)`). They can change the file (or remove the selection) without touching R2.
3. When the user clicks **Save Application**, the form:
   - If a file is selected: uploads it once to `POST /api/upload`, receives a public HTTPS URL, then sends that URL in `POST /api/applications` with the rest of the data.
   - If editing an existing application and no new file was selected: the existing `cv_url` is sent as-is.
4. The application row is created with `cv_url` pointing to the new object. Only one CV object exists per saved application.

### Edit application

1. The form loads with the existing `cv_url`. User can open it via the “View” link.
2. If the user selects a **new** PDF, that file is held in memory and a preview is shown. On **Save**:
   - The new file is uploaded to `/api/upload`; the API returns the new URL.
   - `PUT /api/applications` updates the row with the new `cv_url` and **deletes the previous object** in R2 when the URL changes.

### Delete application

1. `DELETE /api/applications?id=...` reads `cv_url`, deletes the object if it belongs to our public base URL (`deleteCvIfOurs`), then deletes the database row.

## API and code

| Piece | Role |
|-------|------|
| `POST /api/upload` | **Requires a signed-in session** (`requireAuth()`; **401** without). Accepts a PDF (`FormData`), validates type (PDF) and size (max 10MB). Requires **`Idempotency-Key`** (HTTP header) or **`idempotency_key`** (form field): 8–128 chars, `[a-zA-Z0-9_-]` only (e.g. a UUID). Object key is `cvs/idempotency/<key>.pdf`. If that object already exists, returns the same `{ url }` without uploading again (`idempotent: true`). Otherwise `PutObject` and returns `{ url, idempotent: false }`. |
| `lib/storage/r2-client.ts` | Builds S3-compatible client (`endpoint`: `https://<R2_ACCOUNT_ID>.r2.cloudflarestorage.com`, region `auto`). |
| `lib/utils/cv-storage.ts` | `isCvStorageUrl(url)` — true only for URLs under `R2_PUBLIC_BASE_URL`. `deleteCvIfOurs` / `checkCvObjectExists` — `DeleteObject` / `HeadObject` when the URL is ours. |

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
