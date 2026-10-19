import { describe, expect, it } from "vitest";
import { applicationFormStepForErrors } from "@/components/forms/application-form-steps";

describe("applicationFormStepForErrors", () => {
  it("returns null when there are no errors", () => {
    expect(applicationFormStepForErrors({})).toBeNull();
  });

  it("maps field errors to the owning step", () => {
    expect(applicationFormStepForErrors({ company: "required" })).toBe("role");
    expect(applicationFormStepForErrors({ cv_url: "Upload a CV" })).toBe(
      "materials",
    );
    expect(applicationFormStepForErrors({ slug: "taken" })).toBe("share");
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
    ).toBe("materials");
  });
});
