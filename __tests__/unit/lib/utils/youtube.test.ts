import { describe, it, expect } from "vitest";
import {
  extractVideoId,
  generateEmbedUrl,
  isYouTubeShortUrl,
  validateYouTubeUrl,
} from "@/lib/utils/youtube";

describe("youtube utils", () => {
  it("extracts ids from watch, short, embed, and shorts URLs", () => {
    expect(
      extractVideoId("https://www.youtube.com/watch?v=dQw4w9WgXcQ"),
    ).toBe("dQw4w9WgXcQ");
    expect(extractVideoId("https://youtu.be/dQw4w9WgXcQ")).toBe("dQw4w9WgXcQ");
    expect(
      extractVideoId("https://www.youtube.com/embed/dQw4w9WgXcQ"),
    ).toBe("dQw4w9WgXcQ");
    expect(
      extractVideoId("https://www.youtube.com/shorts/dQw4w9WgXcQ"),
    ).toBe("dQw4w9WgXcQ");
  });

  it("validateYouTubeUrl requires a parseable id", () => {
    expect(validateYouTubeUrl("https://youtu.be/dQw4w9WgXcQ")).toBe(true);
    expect(validateYouTubeUrl("https://vimeo.com/123")).toBe(false);
    expect(validateYouTubeUrl("")).toBe(false);
  });

  it("detects Shorts URLs and builds embed URLs", () => {
    expect(
      isYouTubeShortUrl("https://www.youtube.com/shorts/dQw4w9WgXcQ"),
    ).toBe(true);
    expect(
      generateEmbedUrl("https://www.youtube.com/watch?v=dQw4w9WgXcQ"),
    ).toBe("https://www.youtube.com/embed/dQw4w9WgXcQ");
  });
});
