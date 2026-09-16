import { describe, expect, it } from "vitest";
import {
  buildOnboardingSteps,
  hasOptionalProfileDetails,
  isOnboardingStepSatisfied,
  liveCompletedStepIds,
  mergeStepIdLists,
  onboardingProgress,
  parseStoredStepIds,
} from "@/lib/utils/onboarding-checklist";

const emptyInput = {
  firstName: null as string | null,
  lastName: null as string | null,
  location: null as string | null,
  portfolioUrl: null as string | null,
  linkedinUrl: null as string | null,
  profilePictureUrl: null as string | null,
  primaryCvCount: 0,
  applicationTotal: 0,
  activeApplicationCount: 0,
};

describe("buildOnboardingSteps", () => {
  it("marks all steps incomplete for an empty account", () => {
    const steps = buildOnboardingSteps(emptyInput);
    expect(steps).toHaveLength(6);
    expect(steps.every((step) => !step.done && !step.skipped)).toBe(true);
    expect(onboardingProgress(steps)).toEqual({
      completed: 0,
      total: 6,
      allDone: false,
    });
  });

  it("requires both names for Create your profile and treats whitespace as empty", () => {
    const steps = buildOnboardingSteps({
      ...emptyInput,
      firstName: "Ada",
      lastName: "  ",
    });
    expect(steps.find((s) => s.id === "create_profile")?.done).toBe(false);
    expect(steps.find((s) => s.id === "create_profile")?.label).toBe(
      "Create your profile",
    );
  });

  it("completes Add location or a link when any optional detail is set", () => {
    expect(
      hasOptionalProfileDetails({
        location: "Paris",
        portfolioUrl: null,
        linkedinUrl: null,
      }),
    ).toBe(true);
    expect(
      hasOptionalProfileDetails({
        location: "  ",
        portfolioUrl: null,
        linkedinUrl: "https://linkedin.com/in/ada",
      }),
    ).toBe(true);
    expect(
      hasOptionalProfileDetails({
        location: null,
        portfolioUrl: null,
        linkedinUrl: null,
      }),
    ).toBe(false);

    const steps = buildOnboardingSteps({
      ...emptyInput,
      firstName: "Ada",
      lastName: "Lovelace",
      location: "London",
    });
    expect(steps.find((s) => s.id === "create_profile")?.done).toBe(true);
    expect(steps.find((s) => s.id === "finish_profile")?.done).toBe(true);
  });

  it("marks each step done from live signals", () => {
    const steps = buildOnboardingSteps({
      firstName: "Ada",
      lastName: "Lovelace",
      location: null,
      portfolioUrl: "https://ada.dev",
      linkedinUrl: null,
      profilePictureUrl: "https://example.com/pic.jpg",
      primaryCvCount: 2,
      applicationTotal: 1,
      activeApplicationCount: 1,
    });
    expect(steps.every((step) => step.done)).toBe(true);
    expect(onboardingProgress(steps).allDone).toBe(true);
  });

  it("treats a draft-only account as missing publish/share", () => {
    const steps = buildOnboardingSteps({
      firstName: "Ada",
      lastName: "Lovelace",
      location: "Paris",
      portfolioUrl: null,
      linkedinUrl: null,
      profilePictureUrl: "https://example.com/pic.jpg",
      primaryCvCount: 1,
      applicationTotal: 3,
      activeApplicationCount: 0,
    });
    expect(steps.find((s) => s.id === "first_application")?.done).toBe(true);
    expect(steps.find((s) => s.id === "publish_share")?.done).toBe(false);
    expect(onboardingProgress(steps)).toEqual({
      completed: 5,
      total: 6,
      allDone: false,
    });
  });

  it("counts skipped steps toward progress without marking them done", () => {
    const steps = buildOnboardingSteps(emptyInput, ["photo", "primary_cv"]);
    const photo = steps.find((s) => s.id === "photo");
    const primaryCv = steps.find((s) => s.id === "primary_cv");
    expect(photo).toMatchObject({ done: false, skipped: true });
    expect(primaryCv).toMatchObject({ done: false, skipped: true });
    expect(isOnboardingStepSatisfied(photo!)).toBe(true);
    expect(onboardingProgress(steps)).toEqual({
      completed: 2,
      total: 6,
      allDone: false,
    });
  });

  it("prefers live completion over skip for the same step", () => {
    const steps = buildOnboardingSteps(
      { ...emptyInput, profilePictureUrl: "https://example.com/pic.jpg" },
      ["photo"],
    );
    const photo = steps.find((s) => s.id === "photo");
    expect(photo).toMatchObject({ done: true, skipped: false });
  });

  it("treats skip-all as checklist complete", () => {
    const steps = buildOnboardingSteps(emptyInput, [
      "create_profile",
      "finish_profile",
      "photo",
      "primary_cv",
      "first_application",
      "publish_share",
    ]);
    expect(onboardingProgress(steps).allDone).toBe(true);
  });

  it("keeps a step done from persisted completion after live data is gone", () => {
    expect(liveCompletedStepIds(emptyInput)).toEqual([]);
    const steps = buildOnboardingSteps(emptyInput, [], [
      "first_application",
      "publish_share",
    ]);
    expect(steps.find((s) => s.id === "publish_share")).toMatchObject({
      done: true,
      skipped: false,
    });
    expect(steps.find((s) => s.id === "first_application")?.done).toBe(true);
    expect(onboardingProgress(steps).completed).toBe(2);
  });

  it("prefers persisted completion over skip for the same step", () => {
    const steps = buildOnboardingSteps(emptyInput, ["publish_share"], [
      "publish_share",
    ]);
    expect(steps.find((s) => s.id === "publish_share")).toMatchObject({
      done: true,
      skipped: false,
    });
  });
});

describe("liveCompletedStepIds / mergeStepIdLists", () => {
  it("lists only live-satisfied ids", () => {
    expect(
      liveCompletedStepIds({
        ...emptyInput,
        firstName: "Ada",
        lastName: "Lovelace",
        activeApplicationCount: 1,
      }),
    ).toEqual(["create_profile", "publish_share"]);
  });

  it("merges id lists in checklist order", () => {
    expect(
      mergeStepIdLists(["publish_share"], ["photo", "publish_share"]),
    ).toEqual(["photo", "publish_share"]);
  });
});

describe("parseStoredStepIds", () => {
  it("keeps known ids in checklist order and drops invalid values", () => {
    expect(
      parseStoredStepIds(["photo", "nope", "create_profile", "photo", 3]),
    ).toEqual(["create_profile", "photo"]);
  });

  it("returns empty for non-arrays", () => {
    expect(parseStoredStepIds(null)).toEqual([]);
    expect(parseStoredStepIds({ photo: true })).toEqual([]);
  });
});
