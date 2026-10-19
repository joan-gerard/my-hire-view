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

/** Stalled upload/PUT ceiling before the user is unblocked with a retry message. */
export const PROFILE_PICTURE_REQUEST_TIMEOUT_MS = 30_000;

function asUploadJson(value: unknown): {
  error?: string;
  url?: string;
  warning?: string;
} {
  if (value && typeof value === "object") {
    return value as {
      error?: string;
      url?: string;
      warning?: string;
    };
  }
  return {};
}

function isAbortError(error: unknown): boolean {
  return (
    (error instanceof DOMException && error.name === "AbortError") ||
    (error instanceof Error && error.name === "AbortError")
  );
}

/**
 * POST /api/upload/profile-picture and map failures to friendly Save copy.
 * Aborts after {@link PROFILE_PICTURE_REQUEST_TIMEOUT_MS} if the server is silent.
 */
export async function uploadProfilePictureFile(
  file: File,
): Promise<ProfilePictureUploadResult> {
  const fd = new FormData();
  fd.append("file", file);

  const controller = new AbortController();
  const timeoutId = setTimeout(() => {
    controller.abort();
  }, PROFILE_PICTURE_REQUEST_TIMEOUT_MS);

  let uploadRes: Response;
  try {
    uploadRes = await fetch("/api/upload/profile-picture", {
      method: "POST",
      body: fd,
      signal: controller.signal,
    });
  } catch (error) {
    if (isAbortError(error) || controller.signal.aborted) {
      return {
        ok: false,
        error: "That took too long. Check your connection and try again.",
      };
    }
    return { ok: false, error: messageForUploadNetworkError("profile-picture") };
  } finally {
    clearTimeout(timeoutId);
  }

  const uploadJson = asUploadJson(
    await uploadRes.json().catch(() => ({})),
  );

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

/**
 * PUT helper with the same timeout ceiling as upload (profile picture save).
 */
export async function putProfilePictureUrl(
  profilePictureUrl: string | null,
): Promise<
  | { ok: true; data: unknown; warnings: string[] }
  | { ok: false; error: string }
> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => {
    controller.abort();
  }, PROFILE_PICTURE_REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch("/api/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ profile_picture_url: profilePictureUrl }),
      signal: controller.signal,
    });
    const json = (await response.json().catch(() => ({}))) as {
      error?: string;
      data?: unknown;
      warnings?: unknown;
    };
    if (!response.ok) {
      return {
        ok: false,
        error:
          typeof json.error === "string" && json.error.trim()
            ? json.error
            : "Couldn’t save your picture. Check your connection and try again.",
      };
    }
    const warnings = Array.isArray(json.warnings)
      ? json.warnings.filter(
          (w): w is string => typeof w === "string" && Boolean(w.trim()),
        )
      : [];
    return { ok: true, data: json.data, warnings };
  } catch (error) {
    if (isAbortError(error) || controller.signal.aborted) {
      return {
        ok: false,
        error: "That took too long. Check your connection and try again.",
      };
    }
    return {
      ok: false,
      error:
        "Couldn’t save your picture. Check your connection and try again.",
    };
  } finally {
    clearTimeout(timeoutId);
  }
}
