# PR #5 — Fix: View count does not get updated

Commit-by-commit detail for PR #5 (fix-view-count-does-not-update): commits `1824d5e` and `68f019e`, plus merge. See [BUILD_SUMMARY.md](../BUILD_SUMMARY.md) for the full index.

---

## 39. fix: view count via SECURITY DEFINER RPC and service_role-only admin client

**Commit:** `1824d5e`  
**Intent:** Fix view count and last_viewed_at not updating for anonymous and non-owner viewers (RLS was blocking direct UPDATE on applications).

**Created:**

- `supabase/migrations/009_increment_view_count_security_definer.sql` — `increment_application_view_count(p_slug)` SECURITY DEFINER function; updates only `view_count` and `last_viewed_at`; EXECUTE granted to `service_role` only.
- `docs/VIEW_COUNT_FIX.md` — problem, root cause (RLS), options, and solution (SECURITY DEFINER + service-role backend).

**Updated:**

- `lib/supabase/env.ts` — `getSupabaseServiceRoleKey()` helper for server-side `SUPABASE_SERVICE_ROLE_KEY`.
- `lib/supabase/admin.ts` — `createAdminClient()` using service role key (server-side only).
- `app/api/applications/[slug]/view/route.ts` — for non-owner viewers, call `increment_application_view_count` via admin client instead of direct UPDATE.
- `docs/ARCHITECTURE.md`, `docs/DATA_FLOW.md` — document view-count RPC and admin client usage.

**Bug fixed:** View count and last viewed now update correctly when recruiters or anonymous users open the public application page; only the backend (service role) can run the RPC.

---

## 40. fix: download count via SECURITY DEFINER RPC for anon and non-owner

**Commit:** `68f019e`  
**Intent:** Apply the same pattern to CV download count so it increments for anonymous and non-owner downloaders (RLS was blocking direct UPDATE).

**Created:**

- `supabase/migrations/010_increment_download_count_security_definer.sql` — `increment_application_download_count(p_slug)` SECURITY DEFINER function; updates only `download_count`; EXECUTE granted to `service_role` only.

**Updated:**

- `app/api/applications/[slug]/download/route.ts` — for non-owner downloaders, call `increment_application_download_count` via admin client instead of direct UPDATE.
- `docs/VIEW_COUNT_FIX.md` — extended to cover download count fix (same SECURITY DEFINER pattern).

**Bug fixed:** CV download count now increments when anonymous or non-owner users download the CV; only the backend can run the RPC.

---

## 41. Merge pull request #5 — fix-view-count-does-not-update

**Commit:** `11a3a16`  
**Intent:** Merge the "Fix: View count does not get updated" branch into main.

**Scope:** All changes from commits 38–40: BUILD_SUMMARY doc update, view count via SECURITY DEFINER RPC and service_role-only admin client (migration 009, VIEW_COUNT_FIX.md, env/admin, view route), and download count via SECURITY DEFINER RPC (migration 010, download route). No new files; merge only.

---
