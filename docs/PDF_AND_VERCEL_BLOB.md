# PDFs and Vercel Blob

This document describes how the application handles CV PDFs and Vercel Blob storage.

## Overview

- **What we store:** One PDF per application (the CV), referenced by `applications.cv_url`.
- **Where:** Vercel Blob. Files are uploaded with public access so the shareable application page can display the PDF.
- **Policy:** We use **upload on save** (Option A). The file is only sent to Vercel Blob when the user saves the application. Replacing or deleting an application triggers deletion of the corresponding blob so we avoid orphan files.

## Flow

### Create application

1. User fills the form and selects a PDF in the CV field. The file is kept in memory (browser `File` object); nothing is uploaded yet.
2. User sees a **preview** of the PDF via a blob URL (`URL.createObjectURL(file)`). They can change the file (or remove the selection) without creating blobs.
3. When the user clicks **Save Application**, the form:
   - If a file is selected: uploads it once to `POST /api/upload`, receives a Blob URL, then sends that URL in `POST /api/applications` with the rest of the data.
   - If editing an existing application and no new file was selected: the existing `cv_url` is sent as-is.
4. The application row is created with `cv_url` pointing to the new blob. Only one blob exists per saved application.

### Edit application

1. The form loads with the existing `cv_url` (saved CV). User can open it via the “View” link.
2. If the user selects a **new** PDF, that file is held in memory and a preview is shown. On **Save**:
   - The new file is uploaded to `/api/upload`; the API returns the new Blob URL.
   - The applications API (`PUT /api/applications`) updates the row with the new `cv_url` and **deletes the previous blob** from Vercel Blob (so the old CV is not left orphaned).

### Delete application

1. When the user deletes an application (`DELETE /api/applications?id=...`), the API:
   - Fetches the application’s `cv_url`.
   - If it is a Vercel Blob URL, deletes that blob via `del(url)`.
   - Then deletes the application row from the database.

So deleting an application also removes its CV file from Blob storage.

## API and code

| Piece | Role |
|-------|------|
| `POST /api/upload` | Accepts a PDF (FormData), validates type (PDF) and size (max 10MB), uploads with `put()` to Vercel Blob, returns `{ url }`. |
| `lib/utils/blob.ts` | `isVercelBlobUrl(url)` – returns true only for our Blob store URLs. `deleteBlobIfOurs(url)` – calls `del(url)` from `@vercel/blob` only when the URL is ours; logs and swallows errors so DB operations are not blocked. |
| `DELETE /api/applications` | Reads `cv_url` from the application, calls `deleteBlobIfOurs(cv_url)`, then deletes the row. |
| `PUT /api/applications` | If the incoming `cv_url` is different from the existing one, calls `deleteBlobIfOurs(existing.cv_url)` before updating, so the old blob is removed when the user replaces the CV. |
| `FileUpload` | Holds the selected `File`, shows preview via object URL, does not upload until the form is submitted. |
| `ApplicationForm` | On submit: if there is a pending file, uploads it to `/api/upload`, then passes the returned URL as `cv_url` to `onSubmit`. |

## Safety

- **URL check:** We only call Vercel Blob’s `del()` for URLs whose hostname ends with `public.blob.vercel-storage.com`. This avoids deleting arbitrary URLs if `cv_url` were ever wrong or manipulated.
- **Errors:** Blob delete failures are logged but do not prevent the database update or delete. The application row is still updated/deleted; orphan blobs can be cleaned up later if needed.

## Environment

- `BLOB_READ_WRITE_TOKEN` must be set for uploads and deletes. See [Vercel Blob](https://vercel.com/docs/storage/vercel-blob) and the project README for setup.
