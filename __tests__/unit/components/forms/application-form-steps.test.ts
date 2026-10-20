import { describe, expect, it } from "vitest";
import {
  applicationFormStepForErrors,
  isWizardStepCompleted,
  isWizardStepReachable,
} from "@/components/forms/application-form-steps";

describe("applicationFormStepForErrors", () => {
  it("returns null when there are no errors", () => {
    expect(applicationFormStepForErrors({})).toBeNull();
  });

  it("maps field errors to the owning step", () => {
    expect(applicationFormStepForErrors({ company: "required" })).toBe("role");
    expect(applicationFormStepForErrors({ cv_url: "Upload a CV" })).toBe(
      "materials",
    );
    expect(applicationFormStepForErrors({ video_url: "required" })).toBe(
      "video",
    );
    expect(applicationFormStepForErrors({ slug: "taken" })).toBe("role");
  });

  it("prefers earlier steps when several fields fail", () => {
    expect(
      applicationFormStepForErrors({
        slug: "taken",
        cv_url: "missing",
        company: "required",
      }),
    ).toBe("role");
    expect(
      applicationFormStepForErrors({
        slug: "taken",
        video_url: "required",
      }),
    ).toBe("role");
    // Candidate is before materials — must win over cv_url.
    expect(
      applicationFormStepForErrors({
        first_name: "required",
        cv_url: "missing",
      }),
    ).toBe("candidate");
    // CV is before video.
    expect(
      applicationFormStepForErrors({
        cv_url: "missing",
        video_url: "required",
      }),
    ).toBe("materials");
  });
});

describe("isWizardStepReachable", () => {
  it("allows steps up to the create frontier after going back", () => {
    const furthest = 1; // reached About you
    expect(isWizardStepReachable(0, furthest, false)).toBe(true);
    expect(isWizardStepReachable(1, furthest, false)).toBe(true);
    expect(isWizardStepReachable(2, furthest, false)).toBe(false);
  });

  it("allows every step on edit", () => {
    for (const stepIndex of [0, 1, 2, 3, 4]) {
      expect(isWizardStepReachable(stepIndex, 0, true)).toBe(true);
    }
  });
});

describe("isWizardStepCompleted", () => {
  it("marks earlier steps complete only while they stay ready", () => {
    const current = 3; // on Video
    expect(isWizardStepCompleted(0, current, true)).toBe(true);
    expect(isWizardStepCompleted(0, current, false)).toBe(false);
    expect(isWizardStepCompleted(2, current, true)).toBe(true);
    expect(isWizardStepCompleted(3, current, true)).toBe(false);
  });
});
