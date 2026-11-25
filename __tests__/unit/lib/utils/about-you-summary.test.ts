import { describe, it, expect } from "vitest";
import {
  buildAboutYouSummary,
  shouldCollapseAboutYouByDefault,
  type AboutYouSummaryFieldKey,
} from "@/lib/utils/about-you-summary";

const emptyValues: Record<AboutYouSummaryFieldKey, string> = {
  first_name: "",
  last_name: "",
  email: "",
  phone: "",
  location: "",
  portfolio_url: "",
  linkedin_url: "",
};

const allHidden: Record<AboutYouSummaryFieldKey, boolean> = {
  first_name: true,
  last_name: true,
  email: false,
  phone: false,
  location: false,
  portfolio_url: false,
  linkedin_url: false,
};

describe("buildAboutYouSummary", () => {
  it("lists photo, name, and visible optional fields", () => {
    expect(
      buildAboutYouSummary({
        hasProfilePicture: true,
        showProfilePicture: true,
        firstName: "Ada",
        lastName: "Lovelace",
        values: {
          ...emptyValues,
          first_name: "Ada",
          last_name: "Lovelace",
          portfolio_url: "https://ada.dev",
          email: "ada@example.com",
        },
        include: {
          ...allHidden,
          portfolio_url: true,
          email: false,
        },
      }),
    ).toBe("Showing photo, name, portfolio");
  });

  it("omits photo when hidden or missing", () => {
    expect(
      buildAboutYouSummary({
        hasProfilePicture: true,
        showProfilePicture: false,
        firstName: "Ada",
        lastName: "",
        values: { ...emptyValues, first_name: "Ada" },
        include: allHidden,
      }),
    ).toBe("Showing name");
  });

  it("returns a fallback when nothing is shown", () => {
    expect(
      buildAboutYouSummary({
        hasProfilePicture: false,
        showProfilePicture: false,
        firstName: "",
        lastName: "",
        values: emptyValues,
        include: allHidden,
      }),
    ).toBe("Nothing shown yet");
  });
});

describe("shouldCollapseAboutYouByDefault", () => {
  it("expands until a live application count is known", () => {
    expect(
      shouldCollapseAboutYouByDefault({
        liveApplicationCount: null,
      }),
    ).toBe(false);
  });

  it("stays expanded when only drafts exist (no live apps)", () => {
    expect(
      shouldCollapseAboutYouByDefault({
        liveApplicationCount: 0,
      }),
    ).toBe(false);
  });

  it("collapses once there is at least one live application", () => {
    expect(
      shouldCollapseAboutYouByDefault({
        liveApplicationCount: 1,
      }),
    ).toBe(true);
  });

  it("stays expanded when the profile preference is off", () => {
    expect(
      shouldCollapseAboutYouByDefault({
        liveApplicationCount: 3,
        collapseAboutYou: false,
      }),
    ).toBe(false);
  });
});
