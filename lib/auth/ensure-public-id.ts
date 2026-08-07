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

/** Max update attempts when repairing an invalid `public_id` collides. */
const MAX_PUBLIC_ID_ATTEMPTS = 3;

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
 * Read-only: valid profiles.public_id if present, else Auth user_metadata.
 * Does not create or update a profiles row (use ensureProfilePublicId for that).
 * Invalid stored values are ignored so callers do not build dead share URLs.
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

  if (
    typeof existing?.public_id === "string" &&
    isValidPublicId(existing.public_id)
  ) {
    return existing.public_id;
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
  let publicId = fromMeta ?? generatePublicId();
  const names = namesFromUserMetadata(user);
  const stalePublicId =
    typeof existing?.public_id === "string" ? existing.public_id : null;

  if (existing) {
    // Row exists with invalid/empty public_id — conditional repair.
    let expectedStale = stalePublicId;
    let repaired = false;

    for (let attempt = 0; attempt < MAX_PUBLIC_ID_ATTEMPTS; attempt++) {
      let query = supabase
        .from("profiles")
        .update({
          public_id: publicId,
          ...(names && {
            first_name: names.first_name,
            last_name: names.last_name,
          }),
        })
        .eq("user_id", user.id);

      if (expectedStale === null) {
        query = query.is("public_id", null);
      } else {
        query = query.eq("public_id", expectedStale);
      }

      const { data, error } = await query.select("public_id").maybeSingle();

      if (error) {
        if (error.code === "23505") {
          publicId = generatePublicId();
          continue;
        }
        throw new Error(`Failed to repair public id: ${error.message}`);
      }

      if (data?.public_id && isValidPublicId(data.public_id)) {
        publicId = data.public_id;
        repaired = true;
        break;
      }

      const { data: current, error: readError } = await supabase
        .from("profiles")
        .select("public_id")
        .eq("user_id", user.id)
        .maybeSingle();

      if (readError) {
        throw new Error(`Failed to repair public id: ${readError.message}`);
      }

      if (current?.public_id && isValidPublicId(current.public_id)) {
        publicId = current.public_id;
        repaired = true;
        break;
      }

      expectedStale =
        typeof current?.public_id === "string" ? current.public_id : null;
      publicId = generatePublicId();
    }

    if (!repaired) {
      throw new Error("Failed to repair public id: could not assign a unique id");
    }
  } else {
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
  }

  const metaNow = publicIdFromUserMetadata(user);
  if (metaNow !== publicId) {
    await syncPublicIdToUserMetadata(supabase, publicId);
  }

  return publicId;
}
