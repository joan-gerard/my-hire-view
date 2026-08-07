import type { SupabaseClient } from "@supabase/supabase-js";
import { namesFromUserMetadata } from "@/lib/auth/ensure-profile";
import {
  generatePublicId,
  isValidPublicId,
} from "@/lib/utils/public-id";

type AuthUserLike = {
  id: string;
  user_metadata?: Record<string, unknown> | null;
};

/**
 * Reads a valid public_id from Supabase Auth user_metadata.
 * Invalid or empty values return null so callers regenerate (C1-038).
 */
export function publicIdFromUserMetadata(user: AuthUserLike): string | null {
  const meta = user.user_metadata ?? {};
  const raw = typeof meta.public_id === "string" ? meta.public_id.trim() : "";
  if (!raw || !isValidPublicId(raw)) return null;
  return raw;
}

/**
 * Read-only: profiles.public_id if present, else Auth user_metadata.
 * Does not create or update a profiles row (use ensureProfilePublicId for that).
 */
export async function resolvePublicIdReadOnly(
  supabase: SupabaseClient,
  user: AuthUserLike,
): Promise<string | null> {
  const { data: existing } = await supabase
    .from("profiles")
    .select("public_id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (existing?.public_id) {
    return existing.public_id;
  }

  return publicIdFromUserMetadata(user);
}

/**
 * Ensures the user has a profiles.public_id (and metadata copy when newly generated).
 * Creates or updates a minimal profiles row when needed so public URLs can resolve.
 * Call on application create (not on dashboard list GET).
 */
export async function ensureProfilePublicId(
  supabase: SupabaseClient,
  user: AuthUserLike,
): Promise<string> {
  const { data: existing } = await supabase
    .from("profiles")
    .select("public_id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (existing?.public_id) {
    return existing.public_id;
  }

  const fromMeta = publicIdFromUserMetadata(user);
  const publicId = fromMeta ?? generatePublicId();
  const names = namesFromUserMetadata(user);

  const { error: upsertError } = await supabase.from("profiles").upsert(
    {
      user_id: user.id,
      public_id: publicId,
      ...(names && {
        first_name: names.first_name,
        last_name: names.last_name,
      }),
    },
    { onConflict: "user_id" },
  );

  if (upsertError) {
    throw new Error(`Failed to assign public id: ${upsertError.message}`);
  }

  if (!fromMeta) {
    const { error: metaError } = await supabase.auth.updateUser({
      data: { public_id: publicId },
    });
    if (metaError) {
      console.error("Failed to sync public_id to user_metadata:", metaError.message);
    }
  }

  return publicId;
}
