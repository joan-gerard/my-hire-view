/**
 * Supported URL formats:
 * - youtube.com/watch?v=VIDEO_ID
 * - youtu.be/VIDEO_ID
 * - youtube.com/embed/VIDEO_ID
 * - youtube.com/shorts/VIDEO_ID (YouTube Shorts)
 */
export function extractVideoId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/shorts\/)([^&\n?#\/]+)/,
    /youtube\.com\/watch\?.*v=([^&\n?#]+)/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }

  return null;
}

/** Returns true if the URL is a YouTube Shorts URL (youtube.com/shorts/...). */
export function isYouTubeShortUrl(url: string): boolean {
  if (!url || typeof url !== 'string') return false;
  return /youtube\.com\/shorts\//i.test(url);
}

export function validateYouTubeUrl(url: string): boolean {
  if (!url || typeof url !== 'string') {
    return false;
  }

  const videoId = extractVideoId(url);
  return videoId !== null;
}

export function generateEmbedUrl(url: string): string {
  const videoId = extractVideoId(url);
  if (!videoId) {
    throw new Error('Invalid YouTube URL');
  }
  return `https://www.youtube.com/embed/${videoId}`;
}
