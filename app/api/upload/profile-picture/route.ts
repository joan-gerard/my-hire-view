import { requireAuth } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import {
  checkRateLimit,
  DEFAULT_API_RATE_LIMIT,
  rateLimit429,
} from "@/lib/rate-limit";
import {
  ALLOWED_IMAGE_MIMES,
  detectAllowedImageMime,
  extensionForImageMime,
  type AllowedImageMime,
} from "@/lib/utils/image";
import {
  PROFILE_PICTURES_BUCKET,
  canonicalProfilePicturePath,
  removeOtherProfilePicturesInFolder,
} from "@/lib/utils/profile-picture-storage";
import { NextRequest, NextResponse } from "next/server";

const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

function logStorageError(context: string, error: unknown): void {
  const e = error as {
    message?: string;
    name?: string;
    status?: number;
    statusCode?: string | number;
  };
  console.error(context, {
    message: e.message,
    name: e.name,
    status: e.status,
    statusCode: e.statusCode,
  });
}

/**
 * Upload (or overwrite) the caller's canonical profile picture at
 * `{user_id}/avatar.{ext}`. Removes other objects in that folder so only one
 * file remains. Prefer calling from profile Save (upload-on-save), not on file pick.
 */
export async function POST(request: NextRequest) {
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

    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (
      !ALLOWED_IMAGE_MIMES.includes(file.type as AllowedImageMime)
    ) {
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

    const body = Buffer.from(await file.arrayBuffer());
    const detected = detectAllowedImageMime(body);
    if (!detected) {
      return NextResponse.json(
        { error: "Only JPEG, PNG and WebP images are allowed" },
        { status: 400 },
      );
    }

    const ext = extensionForImageMime(detected);
    const path = canonicalProfilePicturePath(user.id, ext);

    const { data, error } = await supabase.storage
      .from(PROFILE_PICTURES_BUCKET)
      .upload(path, body, { contentType: detected, upsert: true });

    if (error) {
      logStorageError("Profile picture upload error:", error);
      return NextResponse.json(
        { error: "Failed to upload" },
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
  } catch (error) {
    console.error("Profile picture upload unexpected error:", error);
    return NextResponse.json(
      { error: "Failed to upload" },
      { status: 500 },
    );
  }
}
