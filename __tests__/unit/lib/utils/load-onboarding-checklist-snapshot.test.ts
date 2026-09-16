import { describe, expect, it } from "vitest";
import { buildOnboardingChecklistSnapshot } from "@/lib/utils/load-onboarding-checklist-snapshot";
import type { Profile } from "@/lib/types/profile";

describe("buildOnboardingChecklistSnapshot", () => {
  it("maps a full profile and counts", () => {
    const profile = {
      user_id: "u1",
      first_name: "Ada",
      last_name: "Lovelace",
      location: "London",
      portfolio_url: "https://ada.dev",
      linkedin_url: null,
      profile_picture_url: "https://example.com/a.jpg",
      public_id: "abc123xy",
      updated_at: "2026-01-01T00:00:00Z",
    } satisfies Profile;

    expect(
      buildOnboardingChecklistSnapshot({
        profile,
        primaryCvCount: 2,
        applicationTotal: 3,
        activeApplicationCount: 1,
      }),
    ).toEqual({
      firstName: "Ada",
      lastName: "Lovelace",
      location: "London",
      portfolioUrl: "https://ada.dev",
      linkedinUrl: null,
      profilePictureUrl: "https://example.com/a.jpg",
      primaryCvCount: 2,
      applicationTotal: 3,
      activeApplicationCount: 1,
    });
  });

  it("treats a missing profile as an empty name/details snapshot", () => {
    expect(
      buildOnboardingChecklistSnapshot({
        profile: null,
        primaryCvCount: 0,
        applicationTotal: 0,
        activeApplicationCount: 0,
      }),
    ).toEqual({
      firstName: null,
      lastName: null,
      location: null,
      portfolioUrl: null,
      linkedinUrl: null,
      profilePictureUrl: null,
      primaryCvCount: 0,
      applicationTotal: 0,
      activeApplicationCount: 0,
    });
  });
});
