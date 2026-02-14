# View Count Fix — Summary

This document summarizes the view-count behaviour issue, the analysis, and the solution implemented so that view counts update correctly for anonymous and non-owner viewers while remaining secure.

---

## 1. Problem

When recruiters or anonymous visitors opened a public application page (e.g. `/view/voyado-developer`), the **view count did not increment** in the database. The API returned success and the client marked the view as tracked in `sessionStorage`, but the `applications.view_count` and `applications.last_viewed_at` columns were not updated.

**Observed behaviour:**

- Viewing the pitch page in another browser **while not logged in**: view count sometimes appeared to change (e.g. due to caching or prior tests), but reliably the count was **not** updating for anonymous or non-owner viewers.
- Viewing as a **non-owner** (e.g. logged in as a different user): view count did **not** update.

---

## 2. Root Cause: RLS

The application uses Supabase **Row Level Security (RLS)** on the `applications` table. The only UPDATE policy was:

- **"Users can update their own applications"** — `USING (auth.uid() = user_id)` and `WITH CHECK (auth.uid() = user_id)`.

So:

- **Anonymous viewers:** `auth.uid()` is `NULL` → no row satisfies the policy → UPDATE affects **0 rows**.
- **Logged-in non-owners:** `auth.uid()` is user A, row `user_id` is B → no match → UPDATE affects **0 rows**.
- **Owner:** The API correctly skips incrementing when the viewer is the owner, so no update is attempted.

The API logic (increment for non-owners, skip for owner) was correct, but the **database** was rejecting the update for everyone except the owner. Because RLS can result in “0 rows updated” without a hard error, the API often returned 200 and the client assumed the view was counted, even though the count did not change.

---

## 3. Options Considered

| Approach | Pros | Cons |
|----------|------|------|
| **New RLS policy** allowing UPDATE when `auth.uid() IS DISTINCT FROM user_id OR auth.uid() IS NULL` | No new DB object; stays within RLS. | Would allow any non-owner to UPDATE any column on that row; we’d rely entirely on the API to send only `view_count` and `last_viewed_at`. |
| **SECURITY DEFINER function** | Function does one thing (increment + set timestamp); can restrict **who** can run it (e.g. only `service_role`). API sends no sensitive data; function only takes `slug`. | Requires a migration and a server-only client using the service role key. |

We chose the **SECURITY DEFINER** approach to keep the capability minimal and to ensure only the backend (service role) can perform the increment, avoiding RPC abuse from the client.

---

## 4. Solution Implemented

### 4.1 Design principles

- **Minimal function:** The database function only updates `view_count` and `last_viewed_at` for the given slug. No other columns or logic.
- **Service-role only:** Only the backend (using `SUPABASE_SERVICE_ROLE_KEY`) can execute the function. The RPC is **not** callable by `anon` or `authenticated`.
- **No client exposure:** The service role key and the admin client are used only in server-side code (API route). The RPC is never called from the browser or with the anon key.

### 4.2 Components

1. **Migration `009_increment_view_count_security_definer.sql`**
   - Defines `increment_application_view_count(p_slug text)`:
     - `SECURITY DEFINER` so it runs with definer rights and bypasses RLS.
     - `SET search_path = public` for safety.
     - Body: single `UPDATE applications SET view_count = COALESCE(view_count, 0) + 1, last_viewed_at = now() WHERE slug = p_slug`.
   - **Revokes** `EXECUTE` from `PUBLIC`, `anon`, and `authenticated`.
   - **Grants** `EXECUTE` to `service_role` only.

2. **Env helper `getSupabaseServiceRoleKey()`** (`lib/supabase/env.ts`)
   - Reads `SUPABASE_SERVICE_ROLE_KEY` (server-side only; not `NEXT_PUBLIC_`).
   - Used only when creating the admin client.

3. **Admin client** (`lib/supabase/admin.ts`)
   - `createAdminClient()` builds a Supabase client with the service role key.
   - Used only in server-side code (e.g. the view API route). Never imported in client components.

4. **View API route** (`app/api/applications/[slug]/view/route.ts`)
   - Still uses the **cookie-based** Supabase client to:
     - Fetch the application by slug and get `user_id`.
     - Get the current viewer via `auth.getUser()`.
   - If the viewer is the **owner**, returns success without incrementing.
   - If the viewer is **not** the owner (or is anonymous), calls **`increment_application_view_count`** via the **admin client** (service role). No direct UPDATE from the anon/authenticated client.

### 4.3 Security

- **No new database vulnerability:** The function is minimal and only updates the two tracking columns. The only way to run it is via the API route, which uses the service role key (server-only).
- **RPC not callable by anon/authenticated:** Revoke/grant ensures that even if someone has the project URL and anon key, they cannot call this RPC. Only the backend with the service role key can.
- **Owner check remains in the app:** The decision to skip incrementing for the owner is done in the API (cookie-based user vs. `application.user_id`); the function does not need to know about the viewer.

### 4.4 Why the service role key is never client-side

- **Env var:** `SUPABASE_SERVICE_ROLE_KEY` is **not** prefixed with `NEXT_PUBLIC_`. In Next.js, only `NEXT_PUBLIC_*` env vars are inlined into the client bundle. So the service role key is never sent to the browser, even if some module that reads it were bundled for the client.
- **Usage:** The only code that reads this key is `getSupabaseServiceRoleKey()` in `lib/supabase/env.ts`. That function is only called from `lib/supabase/admin.ts`, and the only importer of `admin.ts` is the view API route (`app/api/applications/[slug]/view/route.ts`). API routes run only on the server and are never part of the client bundle, so the chain that uses the service role key is never imported client-side.
- **Vercel (or other host):** When you add `SUPABASE_SERVICE_ROLE_KEY` in Vercel’s environment variables (Project → Settings → Environment Variables), it is injected only into the **server runtime** (API routes, Server Components, build). Vercel does not expose non-`NEXT_PUBLIC_` variables to the client, so the key is never available in the browser.
- **Result:** The service role key is used only in server-side code and is never included in or exposed to the client bundle.

---

## 5. Deployment Notes

- **Vercel:** Add **`SUPABASE_SERVICE_ROLE_KEY`** in your Vercel project’s environment variables (Settings → Environment Variables). It is required for the view-count RPC (and any future server-only admin operations). This variable is only available to the server at runtime and is never exposed to the client.
- Run the migration **`009_increment_view_count_security_definer.sql`** on your Supabase project (e.g. via Supabase CLI or dashboard) so the function and permissions are in place before or at deploy.

---

## 6. Related Docs

- **Public view and view count flow:** [DATA_FLOW.md](DATA_FLOW.md) (§ 6).
- **API and RLS context:** [ARCHITECTURE.md](ARCHITECTURE.md) (API table, RLS, view count behaviour).
- **Excluding the applicant from view count:** [BUILD_SUMMARY.md](BUILD_SUMMARY.md) (commit 33).

After this fix, view count and last-viewed time update correctly when:
- An **anonymous** visitor opens the public view page (once per session, as before).
- A **logged-in non-owner** opens the public view page.
The **owner** viewing their own page still does **not** increment the count.
