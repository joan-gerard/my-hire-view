import { describe, it, expect, vi } from "vitest";
import {
  fetchYouTubeOEmbedPreview,
  toYouTubeWatchUrl,
  youtubeThumbnailUrl,
  YOUTUBE_UNAVAILABLE_MESSAGE,
} from "@/lib/utils/youtube-preview";

describe("youtube-preview helpers", () => {
  it("builds watch and thumbnail URLs from a video id", () => {
    expect(toYouTubeWatchUrl("abc123")).toBe(
      "https://www.youtube.com/watch?v=abc123",
    );
    expect(youtubeThumbnailUrl("abc123")).toBe(
      "https://i.ytimg.com/vi/abc123/hqdefault.jpg",
    );
  });

  it("rejects non-YouTube URLs before calling fetch", async () => {
    const fetchImpl = vi.fn();
    const result = await fetchYouTubeOEmbedPreview(
      "https://vimeo.com/123",
      fetchImpl as unknown as typeof fetch,
    );
    expect(result).toEqual({
      ok: false,
      code: "invalid_url",
      error: "Please enter a valid YouTube URL",
    });
    expect(fetchImpl).not.toHaveBeenCalled();
  });

  it("returns title and thumbnail from oEmbed JSON", async () => {
    const fetchImpl = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        title: "My pitch",
        thumbnail_url: "https://i.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg",
      }),
    });

    const result = await fetchYouTubeOEmbedPreview(
      "https://youtu.be/dQw4w9WgXcQ",
      fetchImpl as unknown as typeof fetch,
    );

    expect(result).toEqual({
      ok: true,
      videoId: "dQw4w9WgXcQ",
      title: "My pitch",
      thumbnailUrl: "https://i.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg",
    });
    expect(fetchImpl).toHaveBeenCalledWith(
      expect.stringContaining(
        encodeURIComponent("https://www.youtube.com/watch?v=dQw4w9WgXcQ"),
      ),
      expect.any(Object),
    );
  });

  it("maps 401/403/404 to unavailable (private or non-embeddable)", async () => {
    for (const status of [401, 403, 404]) {
      const fetchImpl = vi.fn().mockResolvedValue({
        ok: false,
        status,
        json: async () => ({}),
      });
      const result = await fetchYouTubeOEmbedPreview(
        "https://www.youtube.com/watch?v=private1",
        fetchImpl as unknown as typeof fetch,
      );
      expect(result).toEqual({
        ok: false,
        code: "unavailable",
        error: YOUTUBE_UNAVAILABLE_MESSAGE,
      });
    }
  });

  it("maps other upstream failures to a retryable error", async () => {
    const fetchImpl = vi.fn().mockResolvedValue({
      ok: false,
      status: 503,
      json: async () => ({}),
    });
    const result = await fetchYouTubeOEmbedPreview(
      "https://www.youtube.com/watch?v=abc123XY",
      fetchImpl as unknown as typeof fetch,
    );
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.code).toBe("upstream");
    }
  });
});
