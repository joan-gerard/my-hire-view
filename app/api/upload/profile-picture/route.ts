import { handleApiError } from "@/lib/api/handle-api-error";
import { withAuth } from "@/lib/api/with-auth";
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

function storageStatusOf(error: unknown): number | string | undefined {
  if (error == null || typeof error !== "object") return undefined;
  const e = error as { status?: number; statusCode?: string | number };
  return e.status ?? e.statusCode;
}

/** Server-only log fields for unexpected profile-picture upload failures. */
function pictureUploadErrorMeta(
  userId: string,
  size?: number,
  error?: unknown,
): Record<string, unknown> {
  const storageStatus = error != null ? storageStatusOf(error) : undefined;
  return {
    userId,
    ...(size !== undefined ? { size } : {}),
    ...(storageStatus !== undefined ? { storageStatus } : {}),
  };
}

/**
 * Upload (or overwrite) the caller's canonical profile picture at
 * `{user_id}/avatar.{ext}`. Removes other objects in that folder so only one
 * file remains. Prefer calling from profile Save (upload-on-save), not on file pick.
 */
export async function POST(request: NextRequest) {
  const rate = await checkRateLimit(request, DEFAULT_API_RATE_LIMIT);
  if (!rate.success) return rateLimit429(rate);

  const auth = await withAuth();
  if (!auth.ok) return auth.response;
  const { user } = auth;

  let uploadSize: number | undefined;

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

    uploadSize = file.size;
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
      return handleApiError(
        "POST /api/upload/profile-picture Storage",
        error,
        {
          message: "Failed to upload",
          meta: pictureUploadErrorMeta(user.id, file.size, error),
        },
      );
    }

    const purge = await removeOtherProfilePicturesInFolder(
      supabase,
      user.id,
      data.path,
    );
    if (!purge.ok) {
      console.error(
        "POST /api/upload/profile-picture purge",
        pictureUploadErrorMeta(user.id, file.size),
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
    return handleApiError("POST /api/upload/profile-picture", error, {
      message: "Failed to upload",
      meta: pictureUploadErrorMeta(user.id, uploadSize, error),
    });
  }
}
