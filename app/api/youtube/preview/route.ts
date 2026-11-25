import { withAuth } from "@/lib/api/with-auth";
import {
  checkRateLimit,
  rateLimit429,
  YOUTUBE_PREVIEW_RATE_LIMIT,
} from "@/lib/rate-limit";
import { fetchYouTubeOEmbedPreview } from "@/lib/utils/youtube-preview";
import { NextRequest, NextResponse } from "next/server";

/**
 * Resolve a YouTube URL to title + thumbnail via oEmbed, or report that the
 * video is private / not embeddable. Auth required (create/edit form only).
 */
export async function GET(request: NextRequest) {
  const rate = await checkRateLimit(request, YOUTUBE_PREVIEW_RATE_LIMIT);
  if (!rate.success) return rateLimit429(rate);

  const auth = await withAuth();
  if (!auth.ok) return auth.response;

  const url = request.nextUrl.searchParams.get("url")?.trim() ?? "";
  if (!url) {
    return NextResponse.json(
      { error: "Please enter a valid YouTube URL" },
      { status: 400 },
    );
  }

  try {
    const result = await fetchYouTubeOEmbedPreview(url);
    if (!result.ok) {
      const status =
        result.code === "invalid_url"
          ? 400
          : result.code === "unavailable"
            ? 422
            : 502;
      return NextResponse.json(
        { error: result.error, code: result.code },
        { status },
      );
    }

    return NextResponse.json({
      data: {
        video_id: result.videoId,
        title: result.title,
        thumbnail_url: result.thumbnailUrl,
      },
    });
  } catch (error) {
    console.error("GET /api/youtube/preview:", error);
    return NextResponse.json(
      { error: "Could not check this YouTube video. Try again." },
      { status: 500 },
    );
  }
}
