import { requireAuth } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import {
  checkRateLimit,
  DEFAULT_API_RATE_LIMIT,
  rateLimit429,
} from "@/lib/rate-limit";
import {
  PROFILE_PICTURES_BUCKET,
  canonicalProfilePicturePath,
  removeOtherProfilePicturesInFolder,
} from "@/lib/utils/profile-picture-storage";
import { NextRequest, NextResponse } from "next/server";

const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;

function extensionForMime(mime: string): string {
  if (mime === "image/png") return "png";
  if (mime === "image/webp") return "webp";
  return "jpg";
}

/**
 * Upload (or overwrite) the caller's canonical profile picture at
 * `{user_id}/avatar.{ext}`. Removes other objects in that folder so only one
 * file remains. Prefer calling from profile Save (upload-on-save), not on file pick.
 */
export async function POST(request: NextRequest) {
  const rate = checkRateLimit(request, DEFAULT_API_RATE_LIMIT);
  if (!rate.success) return rateLimit429(rate);

  try {
    const user = await requireAuth();
    const supabase = await createClient();

    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (!ALLOWED_TYPES.includes(file.type as (typeof ALLOWED_TYPES)[number])) {
      return NextResponse.json(
        { error: "Only JPEG, PNG and WebP images are allowed" },
        { status: 400 },
      );
    }

    if (file.size > MAX_SIZE_BYTES) {
      return NextResponse.json(
        { error: "File size must be less than 5MB" },
        { status: 400 },
      );
    }

    const ext = extensionForMime(file.type);
    const path = canonicalProfilePicturePath(user.id, ext);

    const { data, error } = await supabase.storage
      .from(PROFILE_PICTURES_BUCKET)
      .upload(path, file, { contentType: file.type, upsert: true });

    if (error) {
      console.error("Profile picture upload error:", error);
      return NextResponse.json(
        { error: error.message || "Failed to upload" },
        { status: 500 },
      );
    }

    const purge = await removeOtherProfilePicturesInFolder(
      supabase,
      user.id,
      data.path,
    );
    if (!purge.ok) {
      console.error(
        "Profile picture uploaded but failed to remove older objects:",
        user.id,
      );
    }

    const { data: urlData } = supabase.storage
      .from(PROFILE_PICTURES_BUCKET)
      .getPublicUrl(data.path);
    return NextResponse.json({
      url: urlData.publicUrl,
      ...(purge.ok ? {} : { warning: "Uploaded but could not remove older files" }),
    });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
