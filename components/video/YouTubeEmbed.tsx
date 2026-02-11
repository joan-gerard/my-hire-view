'use client';

import { extractVideoId } from '@/lib/utils/youtube';

interface YouTubeEmbedProps {
  url: string;
}

export default function YouTubeEmbed({ url }: YouTubeEmbedProps) {
  const videoId = extractVideoId(url);

  if (!videoId) {
    return (
      <div className="rounded-lg bg-gray-100 p-8 text-center">
        <p className="text-gray-600">Invalid YouTube URL</p>
      </div>
    );
  }

  return (
    <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-black">
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
