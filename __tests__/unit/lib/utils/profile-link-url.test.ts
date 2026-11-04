import { describe, expect, it } from "vitest";
import {
  LINKEDIN_DOES_NOT_LOOK_LIKE_LINKEDIN_WARNING,
  PORTFOLIO_LOOKS_LIKE_LINKEDIN_WARNING,
  PROFILE_URL_FORMAT_WARNING,
  linkedInUrlFieldWarning,
  looksLikeLinkedInUrl,
  portfolioUrlFieldWarning,
  profileHttpUrlFormatWarning,
  profileLinkFieldWarning,
} from "@/lib/utils/profile-link-url";

describe("looksLikeLinkedInUrl", () => {
  it("detects common LinkedIn hosts", () => {
    expect(looksLikeLinkedInUrl("https://www.linkedin.com/in/jane")).toBe(true);
    expect(looksLikeLinkedInUrl("linkedin.com/in/jane")).toBe(true);
    expect(looksLikeLinkedInUrl("https://lnkd.in/abc123")).toBe(true);
  });

  it("rejects non-LinkedIn URLs", () => {
    expect(looksLikeLinkedInUrl("https://jane.dev")).toBe(false);
    expect(looksLikeLinkedInUrl("https://github.com/jane")).toBe(false);
    expect(looksLikeLinkedInUrl("https://notlinkedin.com/in/jane")).toBe(
      false,
    );
  });

  it("is false for empty input", () => {
    expect(looksLikeLinkedInUrl("")).toBe(false);
    expect(looksLikeLinkedInUrl("   ")).toBe(false);
  });
});

describe("portfolioUrlFieldWarning", () => {
  it("warns when the portfolio value looks like LinkedIn", () => {
    expect(
      portfolioUrlFieldWarning("https://www.linkedin.com/in/jane"),
    ).toBe(PORTFOLIO_LOOKS_LIKE_LINKEDIN_WARNING);
  });

  it("stays quiet for a normal portfolio URL or early typing", () => {
    expect(portfolioUrlFieldWarning("https://jane.dev")).toBeNull();
    expect(portfolioUrlFieldWarning("ja")).toBeNull();
    expect(portfolioUrlFieldWarning("")).toBeNull();
  });

  it("warns when the portfolio value is URL-shaped but not a full http(s) URL", () => {
    expect(portfolioUrlFieldWarning("jane.dev")).toBe(
      PROFILE_URL_FORMAT_WARNING,
    );
  });
});

describe("linkedInUrlFieldWarning", () => {
  it("warns when the LinkedIn value does not look like LinkedIn", () => {
    expect(linkedInUrlFieldWarning("https://jane.dev")).toBe(
      LINKEDIN_DOES_NOT_LOOK_LIKE_LINKEDIN_WARNING,
    );
  });

  it("stays quiet for LinkedIn URLs or early typing", () => {
    expect(
      linkedInUrlFieldWarning("https://www.linkedin.com/in/jane"),
    ).toBeNull();
    expect(linkedInUrlFieldWarning("li")).toBeNull();
    expect(linkedInUrlFieldWarning("")).toBeNull();
  });

  it("warns when a LinkedIn-looking value is missing http(s)", () => {
    expect(linkedInUrlFieldWarning("linkedin.com/in/jane")).toBe(
      PROFILE_URL_FORMAT_WARNING,
    );
  });
});

describe("profileHttpUrlFormatWarning", () => {
  it("accepts http(s) URLs and ignores empty or early typing", () => {
    expect(
      profileHttpUrlFormatWarning("https://jane.dev"),
    ).toBeNull();
    expect(profileHttpUrlFormatWarning("")).toBeNull();
    expect(profileHttpUrlFormatWarning("ja")).toBeNull();
  });

  it("warns for URL-shaped values without a valid http(s) scheme", () => {
    expect(profileHttpUrlFormatWarning("jane.dev")).toBe(
      PROFILE_URL_FORMAT_WARNING,
    );
    expect(profileHttpUrlFormatWarning("ftp://files.example")).toBe(
      PROFILE_URL_FORMAT_WARNING,
    );
  });
});

describe("profileLinkFieldWarning", () => {
  it("routes by field and ignores location", () => {
    expect(
      profileLinkFieldWarning(
        "portfolio_url",
        "https://linkedin.com/in/jane",
      ),
    ).toBe(PORTFOLIO_LOOKS_LIKE_LINKEDIN_WARNING);
    expect(
      profileLinkFieldWarning("linkedin_url", "https://example.com"),
    ).toBe(LINKEDIN_DOES_NOT_LOOK_LIKE_LINKEDIN_WARNING);
    expect(profileLinkFieldWarning("location", "Paris")).toBeNull();
  });
});
