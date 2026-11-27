/**
 * Tests for GET /api/youtube/preview — oEmbed title/thumbnail for the form.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import { authOk, authUnauthorized } from "../../helpers/auth-mock";

const {
  mockWithAuth,
  mockCheckRateLimit,
  mockFetchYouTubeOEmbedPreview,
} = vi.hoisted(() => ({
  mockWithAuth: vi.fn(),
  mockCheckRateLimit: vi.fn(),
  mockFetchYouTubeOEmbedPreview: vi.fn(),
}));

vi.mock("@/lib/api/with-auth", () => ({ withAuth: mockWithAuth }));
vi.mock("@/lib/rate-limit", () => ({
  checkRateLimit: mockCheckRateLimit,
  YOUTUBE_PREVIEW_RATE_LIMIT: {
    limit: 30,
    windowMs: 60_000,
    keyPrefix: "youtube-preview",
  },
  rateLimit429: vi.fn().mockReturnValue(
    new Response(JSON.stringify({ error: "Too many requests" }), {
      status: 429,
    }),
  ),
}));
vi.mock("@/lib/utils/youtube-preview", async (importOriginal) => {
  const actual =
    await importOriginal<typeof import("@/lib/utils/youtube-preview")>();
  return {
    ...actual,
    fetchYouTubeOEmbedPreview: mockFetchYouTubeOEmbedPreview,
  };
});

import { GET } from "@/app/api/youtube/preview/route";

const MOCK_USER = { id: "user-abc" };

function makeGetRequest(urlParam?: string): NextRequest {
  const url =
    urlParam === undefined
      ? "http://localhost/api/youtube/preview"
      : `http://localhost/api/youtube/preview?url=${encodeURIComponent(urlParam)}`;
  return new NextRequest(url, { method: "GET" });
}

beforeEach(() => {
  vi.clearAllMocks();
  mockWithAuth.mockResolvedValue(authOk(MOCK_USER));
  mockCheckRateLimit.mockResolvedValue({
    success: true,
    remaining: 29,
    resetAt: Date.now() + 60_000,
  });
});

describe("GET /api/youtube/preview", () => {
  it("returns 401 when unauthenticated", async () => {
    mockWithAuth.mockResolvedValue(authUnauthorized());
    const response = await GET(makeGetRequest("https://youtu.be/abc"));
    expect(response.status).toBe(401);
  });

  it("returns 400 when url is missing", async () => {
    const response = await GET(makeGetRequest());
    expect(response.status).toBe(400);
  });

  it("returns 200 with title and thumbnail on success", async () => {
    mockFetchYouTubeOEmbedPreview.mockResolvedValue({
      ok: true,
      videoId: "dQw4w9WgXcQ",
      title: "Pitch",
      thumbnailUrl: "https://i.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg",
    });

    const response = await GET(
      makeGetRequest("https://www.youtube.com/watch?v=dQw4w9WgXcQ"),
    );
    expect(response.status).toBe(200);
    const json = await response.json();
    expect(json.data).toEqual({
      video_id: "dQw4w9WgXcQ",
      title: "Pitch",
      thumbnail_url: "https://i.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg",
    });
  });

  it("returns 422 when the video is private or not embeddable", async () => {
    mockFetchYouTubeOEmbedPreview.mockResolvedValue({
      ok: false,
      code: "unavailable",
      error: "This video is private or can't be embedded.",
    });

    const response = await GET(
      makeGetRequest("https://www.youtube.com/watch?v=private1"),
    );
    expect(response.status).toBe(422);
    const json = await response.json();
    expect(json.code).toBe("unavailable");
  });

  it("returns 400 for invalid YouTube URLs", async () => {
    mockFetchYouTubeOEmbedPreview.mockResolvedValue({
      ok: false,
      code: "invalid_url",
      error: "Please enter a valid YouTube URL",
    });

    const response = await GET(makeGetRequest("https://example.com"));
    expect(response.status).toBe(400);
  });
});
