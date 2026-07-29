import { requireAuth } from "@/lib/auth";
import { publicIdFromUserMetadata } from "@/lib/auth/ensure-public-id";
import { generatePublicId } from "@/lib/utils/public-id";
import { createClient } from "@/lib/supabase/server";
import type { ProfileUpdateInput } from "@/lib/types/profile";
import { deleteProfilePictureIfOurs } from "@/lib/utils/profile-picture-storage";
import { checkRateLimit, DEFAULT_API_RATE_LIMIT, rateLimit429 } from "@/lib/rate-limit";
import { NextRequest, NextResponse } from "next/server";

/** Validates URL format; allows http/https only. Returns error message or null. */
function validateUrl(value: string | null | undefined): string | null {
  if (value == null || value.trim() === "") return null;
  try {
    const url = new URL(value.trim());
    if (!["http:", "https:"].includes(url.protocol)) {
      return "URL must use http or https";
    }
    return null;
  } catch {
    return "Please enter a valid URL";
  }
}

/**
 * Read-only: returns the current user's profiles row, or 404 if none exists.
 * Profiles are created on first PUT (not on GET).
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

  try {
    const user = await requireAuth();
    const supabase = await createClient();
    const body: ProfileUpdateInput = await request.json();

    const portfolioError = validateUrl(body.portfolio_url);
    if (portfolioError) {
      return NextResponse.json(
        { error: `Portfolio URL: ${portfolioError}` },
        { status: 400 },
      );
    }
    const linkedinError = validateUrl(body.linkedin_url);
    if (linkedinError) {
      return NextResponse.json(
        { error: `LinkedIn URL: ${linkedinError}` },
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
    if (oldPictureUrl && oldPictureUrl !== newPictureUrl) {
      await deleteProfilePictureIfOurs(supabase, oldPictureUrl);
    }

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
          : (existing?.first_name ?? null),
      last_name:
        body.last_name !== undefined
          ? (body.last_name ?? null)
          : (existing?.last_name ?? null),
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
        data: { first_name: firstName, last_name: lastName, public_id: publicId },
      });
      if (metaError) {
        console.error("Failed to sync name to user_metadata:", metaError.message);
      }
    }

    // When profile picture URL changed, sync applications where user chose to show picture
    if (oldPictureUrl !== newPictureUrl) {
      await supabase
        .from("applications")
        .update({ profile_picture_url: newPictureUrl })
        .eq("user_id", user.id)
        .eq("show_profile_picture", true);
    }

    return NextResponse.json({ data });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
