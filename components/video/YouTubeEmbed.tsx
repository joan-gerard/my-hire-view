"use client";

import { extractVideoId, isYouTubeShortUrl } from "@/lib/utils/youtube";

interface YouTubeEmbedProps {
  url: string;
}

export default function YouTubeEmbed({ url }: YouTubeEmbedProps) {
  const videoId = extractVideoId(url);
  const isShort = isYouTubeShortUrl(url);

  if (!videoId) {
    return (
      <div className="rounded-lg bg-[var(--background)] p-8 text-center">
        <p className="text-[var(--foreground)]/80">Invalid YouTube URL</p>
      </div>
    );
  }

  return (
    <div
      className={`relative w-full overflow-hidden rounded-lg bg-black ${
        isShort ? "mx-auto max-w-sm aspect-9/16" : "aspect-video"
      }`}
    >
      <iframe
        className="h-full w-full"
        src={`https://www.youtube.com/embed/${videoId}`}
        title="YouTube video player"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
      />
    </div>
  );
}
