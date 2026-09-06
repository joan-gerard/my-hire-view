import { requireAuth } from "@/lib/auth";
import { namesFromUserMetadata } from "@/lib/auth/ensure-profile";
import { publicIdFromUserMetadata } from "@/lib/auth/ensure-public-id";
import { generatePublicId } from "@/lib/utils/public-id";
import { createClient } from "@/lib/supabase/server";
import {
  deleteProfilePictureIfOurs,
  isOwnedProfilePictureUrl,
} from "@/lib/utils/profile-picture-storage";
import { checkRateLimit, DEFAULT_API_RATE_LIMIT, rateLimit429 } from "@/lib/rate-limit";
import {
  formatProfileUpdateZodError,
  profileUpdateSchema,
} from "@/lib/validation/profile";
import { NextRequest, NextResponse } from "next/server";

/**
 * Read-only: returns the current user's profiles row, or 404 if none exists.
 * Profiles are normally created at signup; GET never creates a row.
 */
export async function GET(request: NextRequest) {
  const rate = checkRateLimit(request, DEFAULT_API_RATE_LIMIT);
  if (!rate.success) return rateLimit429(rate);

  let user;
  try {
    user = await requireAuth();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

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
  const rate = checkRateLimit(request, DEFAULT_API_RATE_LIMIT);
  if (!rate.success) return rateLimit429(rate);

  let user;
  try {
    user = await requireAuth();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

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

    // Create-on-first-save: seed names/public_id from Auth metadata so a
    // picture-only PUT works when signup bootstrap did not create a row (C3-026).
    const metaNames = !existing ? namesFromUserMetadata(user) : null;

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
          : (existing?.first_name ?? metaNames?.first_name ?? null),
      last_name:
        body.last_name !== undefined
          ? (body.last_name ?? null)
          : (existing?.last_name ?? metaNames?.last_name ?? null),
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

    // Keep Auth user_metadata in sync when names or public_id change (or on first save).
    const prevFirst = existing?.first_name ?? null;
    const prevLast = existing?.last_name ?? null;
    const metaPublicId = publicIdFromUserMetadata(user);
    if (
      prevFirst !== firstName ||
      prevLast !== lastName ||
      metaPublicId !== publicId
    ) {
      const { error: metaError } = await supabase.auth.updateUser({
        data: {
          first_name: firstName,
          last_name: lastName,
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

    // After successful write: delete previous Storage object when the URL changed.
    // Applications no longer store a copy — they read profiles.profile_picture_url live.
    if (oldPictureUrl && oldPictureUrl !== newPictureUrl) {
      const deleted = await deleteProfilePictureIfOurs(supabase, oldPictureUrl);
      if (!deleted.ok) {
        warnings.push(
          "Saved profile but failed to delete the previous profile picture from storage",
        );
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
