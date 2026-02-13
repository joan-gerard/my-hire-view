> **Note:** This document is just for me. Do not edit or delete.

Question:
When creating a new application, when adding a CV, the pdf gets added to Vercel Blog automatically even if the application has not been saved. The issue is that if a users chooses to upload a new file, a second file is added to Vercel blob and so on.
We need to either make sure a file gets added to Vercel blob when saving/completing the application or make sure we the file is deleted when uploading a new one.

What would be the best approach?

Answer:
Current behavior
FileUpload.tsx (lines 16–56): On every file selection, handleFileChange runs and immediately POSTs to /api/upload, which calls Vercel Blob’s put(). The returned URL is stored in form state (cv_url).
There is no call to delete the previous blob when the user picks a new file, and no cleanup of blobs that were never saved (e.g. user leaves the create form without submitting).
So:
Create: Each “Choose file” adds a new blob; if the user changes their mind and picks another file, previous blobs stay in Blob forever.
Edit: If the user replaces the CV, the old blob (still referenced in the DB until save) is never deleted; after save you have an orphan blob.
Option A: Upload only when saving
Idea: Keep the file in memory (e.g. File object in state) until the user submits. On submit, upload once to Blob, then create/update the application with the returned URL.
Pros:
Only one blob per application; no orphans from “replace file” or abandoned creates.
No need for a delete API or del() logic.
Blob storage usage matches “saved” applications only.
Cons:
User doesn’t get an instant “View” link before saving (you’d show something like “CV selected: filename.pdf” and maybe a client-side preview instead of the current “File uploaded: View” link).
Slightly more state in the form (hold the File, optional preview URL).
If the user fills the form over a long time, the file stays in browser memory (usually fine for a single PDF).
Option B: Delete previous blob when uploading a new one
Idea: Keep “upload on file select”, but when the user selects a new file and there is already a value (previous blob URL), call a delete API that uses Vercel Blob’s del(url) before (or after) uploading the new file.
Pros:
UX unchanged: user still gets an immediate “File uploaded: View” link.
No accumulation when replacing the file (create or edit).
Cons:
Orphans if the user never saves: e.g. upload CV on create, then close the tab. That one blob is never referenced by any application and never deleted (unless you add a separate “draft/orphan cleanup” job).
You need a delete API (e.g. POST /api/upload/delete or DELETE /api/upload?url=...) that:
Accepts the blob URL (or a signed token).
Validates that the caller is allowed to delete it (e.g. same user who “owns” the application or the upload).
Calls del(url) from @vercel/blob.
On edit, you must only delete the old blob when it’s actually being replaced (new upload), and ideally only after the new upload succeeds so you don’t delete the current CV and then fail to upload the new one.
Recommendation
Preferred: Option A (upload on save)
One blob per saved application, no delete API, no orphan blobs from create flow or from replacing the file.
You only need to change the form to keep a File (and optional preview) until submit, then do a single upload in the submit handler (create and edit).
If you want to keep instant “upload on select”:
Use Option B and add a small delete API that:
Accepts the previous blob URL.
Checks auth (and optionally that the URL is a blob from your store).
Calls del(previousUrl) from @vercel/blob.
Then in FileUpload, when there is a value and the user selects a new file, call this delete API with value before uploading the new file (and handle delete failures so you don’t leave two blobs).
Option B still leaves orphans when the user never saves after uploading; cleaning those would require a periodic job or “draft” TTL, which is more work.
So: best approach is Option A (upload on save); use Option B only if you explicitly want to keep the current “instant upload + View link” UX and are okay adding a delete API and possibly orphan cleanup later.

Question:
Until I choose between A and B we should consider other things we need to improve. For example when deleting an application, we also need to make sure that the file gets deleted.

Answer:
Current behavior
In app/api/applications/route.ts, the DELETE handler (lines 135–178):
Validates auth and that the application belongs to the user
Deletes the application row from Supabase
Does not read cv_url or delete the file from Vercel Blob
So when an application is deleted, its CV PDF remains in Blob indefinitely (orphan blob).
What to add (independent of A vs B)
When deleting an application, you should also delete the associated CV from Blob. That’s a separate improvement from “upload on select” vs “upload on save”:
In the DELETE handler (before or after the DB delete):
Fetch the application’s cv_url (you already load the row for ownership check; you can add cv_url to the select).
If cv_url is present and looks like your Blob URL (e.g. your store’s domain), call del(cv_url) from @vercel/blob.
Optionally catch and log blob delete errors so a failed blob delete doesn’t block the DB delete (you still remove the application; the blob can be cleaned up later or by a job).
Safety: Only call del() for URLs that belong to your Vercel Blob store (e.g. check the hostname or a known prefix). That avoids deleting arbitrary URLs if cv_url were ever wrong or malicious.
So yes: when deleting an application, the CV file should be deleted from Vercel Blob as well. Implementing that is a separate, consistent improvement whether you go with Option A or B for the create/edit flow.

Question:
So If I choose option A can users still see a preview of the file?

Answer:
Yes. With Option A you can still show a preview before the file is uploaded.
How: Keep the selected file as a File in state. Use the browser’s object URL API:
When the user picks a file: const previewUrl = URL.createObjectURL(file)
Use previewUrl in an <iframe src={previewUrl} /> or with a PDF viewer (e.g. react-pdf) to show a preview.
When they clear the file or leave the page: revoke it with URL.revokeObjectURL(previewUrl) so the browser can free the memory.
So the flow is: user selects PDF → you store the File and a short‑lived blob:https://yoursite.com/... URL → you show a preview with that URL → on Save you upload the File to Vercel Blob once and store the returned URL.
Caveat: The preview URL only works in the same browser tab/session; it’s not a shareable link. The “View” link that opens the real PDF would only appear after save (using the Vercel Blob URL). So: preview before save = yes; permanent “View” link before save = no.
