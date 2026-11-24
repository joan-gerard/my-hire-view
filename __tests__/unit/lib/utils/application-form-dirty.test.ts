/**
 * Tests for edit-form dirty snapshots (Save disabled when unchanged).
 */
import { describe, expect, it } from "vitest";
import {
  applicationFormDirtySnapshot,
  hasApplicationFormDirtyChanges,
  type ApplicationFormDirtyInput,
} from "@/lib/utils/application-form-dirty";

const base: ApplicationFormDirtyInput = {
  company: "Acme",
  role: "Engineer",
  slug: "acme-engineer",
  video_url: "https://youtube.com/watch?v=abc",
  first_name: "Ada",
  last_name: "Lovelace",
  location: "London",
  portfolio_url: "https://ada.dev",
  linkedin_url: "https://linkedin.com/in/ada",
  email: "ada@example.com",
  phone: "",
  includeEmail: true,
  includePhone: false,
  includeLocation: true,
  includePortfolio: true,
  includeLinkedin: false,
  slugSegmentOrder: "company_role",
  showProfilePicture: true,
  cvMode: "primary",
  selectedPrimaryId: "cv-1",
  cv_url: "https://files.example/cv.pdf",
  cv_filename: "cv.pdf",
  use_original_cv_filename: false,
  hasPendingCvFile: false,
};

describe("applicationFormDirtySnapshot", () => {
  it("treats trimmed whitespace as unchanged", () => {
    const a = applicationFormDirtySnapshot(base);
    const b = applicationFormDirtySnapshot({
      ...base,
      company: "  Acme  ",
      role: "Engineer ",
    });
    expect(a).toBe(b);
  });

  it("detects field and include changes", () => {
    const baseline = applicationFormDirtySnapshot(base);
    expect(
      hasApplicationFormDirtyChanges(baseline, {
        ...base,
        company: "Beta",
      }),
    ).toBe(true);
    expect(
      hasApplicationFormDirtyChanges(baseline, {
        ...base,
        includeLinkedin: true,
      }),
    ).toBe(true);
    expect(hasApplicationFormDirtyChanges(baseline, base)).toBe(false);
  });

  it("treats a pending CV file as dirty", () => {
    const baseline = applicationFormDirtySnapshot(base);
    expect(
      hasApplicationFormDirtyChanges(baseline, {
        ...base,
        hasPendingCvFile: true,
      }),
    ).toBe(true);
  });
});
