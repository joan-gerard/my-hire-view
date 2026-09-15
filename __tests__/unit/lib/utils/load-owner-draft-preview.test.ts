/**
 * Tests for owner draft preview builder (F16-050).
 * Production path: `loadViewPageApplication` → `buildOwnerDraftPreview`
 * (no separate resolve wrapper).
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import type { Application } from "@/lib/types/application";

const { mockCheckCvObjectExists } = vi.hoisted(() => ({
  mockCheckCvObjectExists: vi.fn(),
}));

vi.mock("@/lib/utils/cv-storage", () => ({
  checkCvObjectExists: mockCheckCvObjectExists,
}));

import { buildOwnerDraftPreview } from "@/lib/utils/load-owner-draft-preview";

const SLUG = "volvo-engineer";

const DRAFT_APP: Application = {
  id: "app-draft",
  slug: SLUG,
  user_id: "owner-id",
  company: "Volvo",
  role: "Engineer",
  cv_url: "https://r2.example.com/cv.pdf",
  video_url: "https://youtube.com/watch?v=abc",
  first_name: "Jane",
  last_name: "Doe",
  location: "Stockholm",
  portfolio_url: "https://jane.dev",
  linkedin_url: "https://linkedin.com/in/jane",
  profile_picture_url: "https://r2.example.com/avatar.jpg",
  cv_filename: "Jane-CV.pdf",
  use_original_cv_filename: true,
  status: "draft",
  view_count: 0,
  download_count: 0,
  last_viewed_at: null,
  archived_at: null,
  include_name_in_slug: null,
  show_profile_picture: true,
  cv_type: "tailored",
  primary_cv_id: null,
  created_at: "2026-01-01T00:00:00Z",
  updated_at: "2026-01-01T00:00:00Z",
};

function resolved(
  application: Application,
  ownerUserId = "owner-id",
) {
  return { application, ownerUserId };
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("buildOwnerDraftPreview", () => {
  it("returns null when the viewer is not the owner", async () => {
    await expect(
      buildOwnerDraftPreview(resolved(DRAFT_APP), "other-user"),
    ).resolves.toBeNull();
    expect(mockCheckCvObjectExists).not.toHaveBeenCalled();
  });

  it("returns null for active applications (public loader handles those)", async () => {
    await expect(
      buildOwnerDraftPreview(
        resolved({ ...DRAFT_APP, status: "active" }),
        "owner-id",
      ),
    ).resolves.toBeNull();
  });

  it("returns null for archived applications", async () => {
    await expect(
      buildOwnerDraftPreview(
        resolved({ ...DRAFT_APP, status: "archived" }),
        "owner-id",
      ),
    ).resolves.toBeNull();
  });

  it("returns the public DTO + application id for the owning viewer of a draft", async () => {
    mockCheckCvObjectExists.mockResolvedValue(true);

    const result = await buildOwnerDraftPreview(
      resolved(DRAFT_APP),
      "owner-id",
    );
    expect(result).toEqual({
      applicationId: "app-draft",
      application: {
        company: "Volvo",
        role: "Engineer",
        first_name: "Jane",
        last_name: "Doe",
        location: "Stockholm",
        portfolio_url: "https://jane.dev",
        linkedin_url: "https://linkedin.com/in/jane",
        profile_picture_url: "https://r2.example.com/avatar.jpg",
        cv_url: "https://r2.example.com/cv.pdf",
        cv_filename: "Jane-CV.pdf",
        use_original_cv_filename: true,
        video_url: "https://youtube.com/watch?v=abc",
        status: "active",
        cv_exists: true,
      },
    });
  });

  it("omits cv_exists and skips HeadObject when the draft has no cv_url", async () => {
    const result = await buildOwnerDraftPreview(
      resolved({ ...DRAFT_APP, cv_url: "" }),
      "owner-id",
    );
    expect(mockCheckCvObjectExists).not.toHaveBeenCalled();
    expect(result).not.toBeNull();
    expect(result!.application.cv_url).toBe("");
    expect(result!.application).not.toHaveProperty("cv_exists");
  });
});
