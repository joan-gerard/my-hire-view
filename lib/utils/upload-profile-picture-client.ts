/**
 * Shared client helper for profile-picture upload-on-save (F8).
 * Used by ProfileForm and ProfilePictureModal so error mapping stays in sync.
 */

import {
  messageForUploadFailure,
  messageForUploadNetworkError,
} from "@/lib/utils/upload-form-messages";

export type ProfilePictureUploadResult =
  | { ok: true; url: string; warning?: string }
  | { ok: false; error: string };

/**
 * POST /api/upload/profile-picture and map failures to friendly Save copy.
 */
export async function uploadProfilePictureFile(
  file: File,
): Promise<ProfilePictureUploadResult> {
  const fd = new FormData();
  fd.append("file", file);

  let uploadRes: Response;
  try {
    uploadRes = await fetch("/api/upload/profile-picture", {
      method: "POST",
      body: fd,
    });
  } catch {
    return { ok: false, error: messageForUploadNetworkError("profile-picture") };
  }

  const uploadJson = (await uploadRes.json().catch(() => ({}))) as {
    error?: string;
    url?: string;
    warning?: string;
  };

  if (!uploadRes.ok) {
    return {
      ok: false,
      error: messageForUploadFailure(
        "profile-picture",
        uploadRes.status,
        uploadJson.error,
      ),
    };
  }

  const url = typeof uploadJson.url === "string" ? uploadJson.url : null;
  if (!url) {
    return {
      ok: false,
      error: messageForUploadFailure("profile-picture", 500, null),
    };
  }

  const warning =
    typeof uploadJson.warning === "string" && uploadJson.warning.trim()
      ? uploadJson.warning.trim()
      : undefined;

  return warning ? { ok: true, url, warning } : { ok: true, url };
}
