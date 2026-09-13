import { withAuth } from "@/lib/api/with-auth";
import { namesFromUserMetadata } from "@/lib/auth/ensure-profile";
import { publicIdFromUserMetadata } from "@/lib/auth/ensure-public-id";
import { generatePublicId } from "@/lib/utils/public-id";
import { createClient } from "@/lib/supabase/server";
import {
  deleteProfilePictureIfOurs,
  getProfilePictureStoragePath,
  isOwnedProfilePictureUrl,
  removeOtherProfilePicturesInFolder,
} from "@/lib/utils/profile-picture-storage";
import { checkRateLimit, DEFAULT_API_RATE_LIMIT, rateLimit429 } from "@/lib/rate-limit";
import {
  formatProfileUpdateZodError,
  PROFILE_NAME_MAX_LENGTH,
  profileUpdateSchema,
} from "@/lib/validation/profile";
import { NextRequest, NextResponse } from "next/server";

/** Treat null/undefined/blank stored names as missing so metadata can seed. */
function storedNameOrNull(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

/**
 * Read-only: returns the current user's profiles row, or 404 if none exists.
 * Profiles are normally created at signup; GET never creates a row.
 */
export async function GET(request: NextRequest) {
  const rate = await checkRateLimit(request, DEFAULT_API_RATE_LIMIT);
  if (!rate.success) return rateLimit429(rate);

  const auth = await withAuth();
  if (!auth.ok) return auth.response;
  const { user } = auth;

  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return NextResponse.json(
          { error: "Profile not found" },
          { status: 404 },
        );
      }
      console.error("GET /api/profile:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data });
  } catch (error) {
    console.error("GET /api/profile:", error);
    return NextResponse.json(
      { error: "Failed to fetch profile" },
      { status: 500 },
    );
  }
}

export async function PUT(request: NextRequest) {
  const rate = await checkRateLimit(request, DEFAULT_API_RATE_LIMIT);
  if (!rate.success) return rateLimit429(rate);

  const auth = await withAuth();
  if (!auth.ok) return auth.response;
  const { user } = auth;

  try {
    const supabase = await createClient();
    const raw: unknown = await request.json();
    const parsed = profileUpdateSchema.safeParse(raw);
    if (!parsed.success) {
      return NextResponse.json(
        { error: formatProfileUpdateZodError(parsed.error) },
        { status: 400 },
      );
    }
    const body = parsed.data;

    if (
      body.profile_picture_url !== undefined &&
      body.profile_picture_url !== null &&
      !isOwnedProfilePictureUrl(body.profile_picture_url, user.id)
    ) {
      return NextResponse.json(
        {
          error:
            "Profile picture URL must be an image you uploaded to profile storage",
        },
        { status: 400 },
      );
    }

    const { data: existing } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", user.id)
      .single();

    const newPictureUrl =
      body.profile_picture_url !== undefined
        ? body.profile_picture_url?.trim() || null
        : (existing?.profile_picture_url ?? null);

    const oldPictureUrl = existing?.profile_picture_url ?? null;

    // Seed omitted names from Auth metadata so a picture-only PUT works when
    // the profiles row is missing or has blank names (e.g. minimal ensureProfilePublicId
    // insert). Stored non-blank names still win (C3-026).
    const metaNames = namesFromUserMetadata(user);
    const storedFirst = storedNameOrNull(existing?.first_name);
    const storedLast = storedNameOrNull(existing?.last_name);

    const publicId =
      existing?.public_id ??
      publicIdFromUserMetadata(user) ??
      generatePublicId();

    const merged = {
      user_id: user.id,
      public_id: publicId,
      first_name:
        body.first_name !== undefined
          ? (body.first_name ?? null)
          : (storedFirst ?? metaNames?.first_name ?? null),
      last_name:
        body.last_name !== undefined
          ? (body.last_name ?? null)
          : (storedLast ?? metaNames?.last_name ?? null),
      location:
        body.location !== undefined
          ? (body.location ?? null)
          : (existing?.location ?? null),
      portfolio_url:
        body.portfolio_url !== undefined
          ? (body.portfolio_url ?? null)
          : (existing?.portfolio_url ?? null),
      linkedin_url:
        body.linkedin_url !== undefined
          ? (body.linkedin_url ?? null)
          : (existing?.linkedin_url ?? null),
      profile_picture_url: newPictureUrl,
    };

    const firstName =
      typeof merged.first_name === "string" ? merged.first_name.trim() : "";
    const lastName =
      typeof merged.last_name === "string" ? merged.last_name.trim() : "";
    if (!firstName || !lastName) {
      return NextResponse.json(
        { error: "First name and last name are required" },
        { status: 400 },
      );
    }
    // Cap names this request introduces (body or metadata seed). Preserve legacy
    // over-long stored values so picture-only PUTs still succeed.
    const firstFromStored =
      body.first_name === undefined && storedFirst !== null;
    const lastFromStored =
      body.last_name === undefined && storedLast !== null;
    if (!firstFromStored && firstName.length > PROFILE_NAME_MAX_LENGTH) {
      return NextResponse.json(
        {
          error: `First name must be at most ${PROFILE_NAME_MAX_LENGTH} characters`,
        },
        { status: 400 },
      );
    }
    if (!lastFromStored && lastName.length > PROFILE_NAME_MAX_LENGTH) {
      return NextResponse.json(
        {
          error: `Last name must be at most ${PROFILE_NAME_MAX_LENGTH} characters`,
        },
        { status: 400 },
      );
    }
    merged.first_name = firstName;
    merged.last_name = lastName;

    const { data, error } = await supabase
      .from("profiles")
      .upsert(merged, { onConflict: "user_id" })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    const warnings: string[] = [];

    // Keep Auth user_metadata in sync when names/public_id change, or when Auth is
    // already stale (e.g. a prior updateUser failed). Same-name PUT must still repair
    // so a no-op save can heal drift — compare Auth names like we do for public_id (F12-031).
    // Cap names for Auth only — profiles may still hold a legacy over-long stored value.
    const prevFirst = existing?.first_name ?? null;
    const prevLast = existing?.last_name ?? null;
    const authFirstName = firstName.slice(0, PROFILE_NAME_MAX_LENGTH);
    const authLastName = lastName.slice(0, PROFILE_NAME_MAX_LENGTH);
    const metaPublicId = publicIdFromUserMetadata(user);
    const namesOutOfSyncWithAuth =
      !metaNames ||
      metaNames.first_name !== authFirstName ||
      metaNames.last_name !== authLastName;
    if (
      prevFirst !== firstName ||
      prevLast !== lastName ||
      metaPublicId !== publicId ||
      namesOutOfSyncWithAuth
    ) {
      const { error: metaError } = await supabase.auth.updateUser({
        data: {
          first_name: authFirstName,
          last_name: authLastName,
          public_id: publicId,
        },
      });
      if (metaError) {
        console.error(
          "Failed to sync name to user_metadata:",
          metaError.message,
        );
        warnings.push("Saved profile but failed to sync name to account metadata");
      }
    }

    // After successful write: only clean Storage when this request changed the
    // picture URL (avoids name-only saves sweeping a freshly uploaded but not
    // yet committed other-extension file). Re-read before delete/purge so a
    // concurrent PUT that won cannot have its committed avatar deleted by us.
    const pictureUrlChanged = oldPictureUrl !== newPictureUrl;
    if (pictureUrlChanged) {
      const { data: latestPicture } = await supabase
        .from("profiles")
        .select("profile_picture_url")
        .eq("user_id", user.id)
        .single();
      const livePictureUrl =
        typeof latestPicture?.profile_picture_url === "string"
          ? latestPicture.profile_picture_url.trim() || null
          : (latestPicture?.profile_picture_url ?? null);
      const stillCurrentPicture = livePictureUrl === newPictureUrl;

      if (stillCurrentPicture) {
        if (oldPictureUrl) {
          const deleted = await deleteProfilePictureIfOurs(
            supabase,
            oldPictureUrl,
          );
          if (!deleted.ok) {
            warnings.push(
              "Saved profile but failed to delete the previous profile picture from storage",
            );
          }
        }

        if (newPictureUrl) {
          const keepPath = getProfilePictureStoragePath(newPictureUrl);
          if (keepPath) {
            const purged = await removeOtherProfilePicturesInFolder(
              supabase,
              user.id,
              keepPath,
            );
            if (!purged.ok) {
              warnings.push(
                "Saved profile but could not remove older profile picture files from storage",
              );
            }
          }
        }
      }
    }

    return NextResponse.json(
      warnings.length > 0 ? { data, warnings } : { data },
    );
  } catch (error) {
    console.error("PUT /api/profile:", error);
    return NextResponse.json(
      { error: "Failed to update profile" },
      { status: 500 },
    );
  }
}
