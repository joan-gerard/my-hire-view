import { afterEach, describe, expect, it } from "vitest";
import {
  getMarketingAssetsBaseUrl,
  marketingAssetUrl,
} from "@/lib/marketing-assets";

const ORIGINAL_PUBLIC = process.env.NEXT_PUBLIC_MARKETING_ASSETS_BASE_URL;

afterEach(() => {
  if (ORIGINAL_PUBLIC === undefined) {
    delete process.env.NEXT_PUBLIC_MARKETING_ASSETS_BASE_URL;
  } else {
    process.env.NEXT_PUBLIC_MARKETING_ASSETS_BASE_URL = ORIGINAL_PUBLIC;
  }
});

describe("getMarketingAssetsBaseUrl", () => {
  it("returns NEXT_PUBLIC_MARKETING_ASSETS_BASE_URL without a trailing slash", () => {
    process.env.NEXT_PUBLIC_MARKETING_ASSETS_BASE_URL =
      "https://cdn.example.com/marketing/";
    expect(getMarketingAssetsBaseUrl()).toBe("https://cdn.example.com/marketing");
  });

  it("returns undefined when unset", () => {
    delete process.env.NEXT_PUBLIC_MARKETING_ASSETS_BASE_URL;
    expect(getMarketingAssetsBaseUrl()).toBeUndefined();
  });
});

describe("marketingAssetUrl", () => {
  it("joins the base and filename", () => {
    process.env.NEXT_PUBLIC_MARKETING_ASSETS_BASE_URL =
      "https://cdn.example.com/marketing";
    expect(marketingAssetUrl("hero-video.mp4")).toBe(
      "https://cdn.example.com/marketing/hero-video.mp4",
    );
  });

  it("strips a leading slash on the filename", () => {
    process.env.NEXT_PUBLIC_MARKETING_ASSETS_BASE_URL =
      "https://cdn.example.com/marketing";
    expect(marketingAssetUrl("/step-1.mp4")).toBe(
      "https://cdn.example.com/marketing/step-1.mp4",
    );
  });

  it("falls back to a root-relative path when no base is configured", () => {
    delete process.env.NEXT_PUBLIC_MARKETING_ASSETS_BASE_URL;
    expect(marketingAssetUrl("hero-video.mp4")).toBe("/hero-video.mp4");
  });
});
