import type { SupabaseClient } from "@supabase/supabase-js";
import { namesFromUserMetadata } from "@/lib/auth/ensure-profile";
import {
  choosePreferredPublicId,
  repairProfilePublicId,
} from "@/lib/auth/repair-profile-public-id";
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
 * Read-only: valid profiles.public_id if present, else Auth user_metadata
 * only when no profiles row exists yet.
 *
 * When a profiles row exists but its `public_id` is invalid, returns null
 * (does not fall back to Auth metadata — that id may belong to another user
 * and would build cross-user share links). Use ensureProfilePublicId to repair.
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

  if (existing) {
    if (
      typeof existing.public_id === "string" &&
      isValidPublicId(existing.public_id)
    ) {
      return existing.public_id;
    }
    return null;
  }

  return publicIdFromUserMetadata(user);
}

async function syncPublicIdToUserMetadata(
  supabase: SupabaseClient,
  publicId: string,
): Promise<void> {
  const { error: metaError } = await supabase.auth.updateUser({
    data: { public_id: publicId },
  });
  if (metaError) {
    console.error(
      "Failed to sync public_id to user_metadata:",
      metaError.message,
    );
  }
}

/**
 * Ensures the user has a valid profiles.public_id (and metadata copy when needed).
 * Creates or repairs a minimal profiles row when missing/invalid so public URLs
 * can resolve. Call on application create (not on dashboard list GET).
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

  if (
    typeof existing?.public_id === "string" &&
    isValidPublicId(existing.public_id)
  ) {
    const fromMeta = publicIdFromUserMetadata(user);
    if (fromMeta !== existing.public_id) {
      await syncPublicIdToUserMetadata(supabase, existing.public_id);
    }
    return existing.public_id;
  }

  const fromMeta = publicIdFromUserMetadata(user);
  const names = namesFromUserMetadata(user);

  if (existing) {
    const repaired = await repairProfilePublicId(supabase, {
      userId: user.id,
      stalePublicId:
        typeof existing.public_id === "string" ? existing.public_id : null,
      preferredPublicId: fromMeta ?? "",
      ...(names && {
        extraUpdateFields: {
          first_name: names.first_name,
          last_name: names.last_name,
        },
      }),
    });

    if (repaired.error || !repaired.publicId) {
      throw new Error(
        `Failed to repair public id: ${repaired.error ?? "could not assign a unique id"}`,
      );
    }

    if (publicIdFromUserMetadata(user) !== repaired.publicId) {
      await syncPublicIdToUserMetadata(supabase, repaired.publicId);
    }
    return repaired.publicId;
  }

  const publicId = await choosePreferredPublicId(supabase, user.id, fromMeta);

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
    // Collision on create: retry with a fresh id once via generate (upsert rare race).
    if (upsertError.code === "23505") {
      const retryId = generatePublicId();
      const { error: retryError } = await supabase.from("profiles").upsert(
        {
          user_id: user.id,
          public_id: retryId,
          ...(names && {
            first_name: names.first_name,
            last_name: names.last_name,
          }),
        },
        { onConflict: "user_id" },
      );
      if (retryError) {
        throw new Error(`Failed to assign public id: ${retryError.message}`);
      }
      await syncPublicIdToUserMetadata(supabase, retryId);
      return retryId;
    }
    throw new Error(`Failed to assign public id: ${upsertError.message}`);
  }

  if (publicIdFromUserMetadata(user) !== publicId) {
    await syncPublicIdToUserMetadata(supabase, publicId);
  }

  return publicId;
}
