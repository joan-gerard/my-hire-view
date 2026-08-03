import { createClient } from "@/lib/supabase/server";

export type ExcludeIdOwnershipResult =
  | { ok: true }
  | { ok: false; status: 404 | 500; error: string };

/**
 * Ensures `excludeId` refers to an application owned by `userId`.
 * Used by slug reserve/validate so callers cannot ignore another user’s row.
 */
export async function assertExcludeIdOwnedByUser(
  excludeId: string,
  userId: string,
): Promise<ExcludeIdOwnershipResult> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("applications")
    .select("id")
    .eq("id", excludeId)
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    console.error("assertExcludeIdOwnedByUser:", error);
    return {
      ok: false,
      status: 500,
      error: "Failed to verify application",
    };
  }
  if (!data) {
    return { ok: false, status: 404, error: "Application not found" };
  }
  return { ok: true };
}
