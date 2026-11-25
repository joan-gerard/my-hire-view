import { extractVideoId } from "@/lib/utils/youtube";

export type YouTubePreviewSuccess = {
  ok: true;
  videoId: string;
  title: string;
  thumbnailUrl: string;
};

export type YouTubePreviewFailure = {
  ok: false;
  code: "invalid_url" | "unavailable" | "upstream";
  error: string;
};

export type YouTubePreviewResult = YouTubePreviewSuccess | YouTubePreviewFailure;

export const YOUTUBE_UNAVAILABLE_MESSAGE =
  "This video is private or can't be embedded.";

export const YOUTUBE_UPSTREAM_MESSAGE =
  "Could not check this YouTube video. Try again.";

/** Canonical watch URL for oEmbed (works for shorts / youtu.be / embed inputs). */
export function toYouTubeWatchUrl(videoId: string): string {
  return `https://www.youtube.com/watch?v=${videoId}`;
}

/** Fallback thumbnail when oEmbed omits `thumbnail_url`. */
export function youtubeThumbnailUrl(videoId: string): string {
  return `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
}

/**
 * Asks YouTube's oEmbed endpoint whether a URL is public/unlisted and embeddable.
 * Private videos and videos that block embedding typically return 401/403/404.
 */
export async function fetchYouTubeOEmbedPreview(
  url: string,
  fetchImpl: typeof fetch = fetch,
): Promise<YouTubePreviewResult> {
  const trimmed = typeof url === "string" ? url.trim() : "";
  const videoId = extractVideoId(trimmed);
  if (!videoId) {
    return {
      ok: false,
      code: "invalid_url",
      error: "Please enter a valid YouTube URL",
    };
  }

  const watchUrl = toYouTubeWatchUrl(videoId);
  const oembedUrl = `https://www.youtube.com/oembed?url=${encodeURIComponent(watchUrl)}&format=json`;

  try {
    const res = await fetchImpl(oembedUrl, {
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(8_000),
    });

    if (res.status === 401 || res.status === 403 || res.status === 404) {
      return {
        ok: false,
        code: "unavailable",
        error: YOUTUBE_UNAVAILABLE_MESSAGE,
      };
    }

    if (!res.ok) {
      return {
        ok: false,
        code: "upstream",
        error: YOUTUBE_UPSTREAM_MESSAGE,
      };
    }

    const data = (await res.json()) as {
      title?: unknown;
      thumbnail_url?: unknown;
    };
    const title =
      typeof data.title === "string" && data.title.trim()
        ? data.title.trim()
        : "YouTube video";
    const thumbnailUrl =
      typeof data.thumbnail_url === "string" && data.thumbnail_url.trim()
        ? data.thumbnail_url.trim()
        : youtubeThumbnailUrl(videoId);

    return { ok: true, videoId, title, thumbnailUrl };
  } catch {
    return {
      ok: false,
      code: "upstream",
      error: YOUTUBE_UPSTREAM_MESSAGE,
    };
  }
}
