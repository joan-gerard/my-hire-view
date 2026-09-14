/**
 * Tests for owner draft preview loader (F16-050).
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import type { Application } from "@/lib/types/application";

const { mockResolvePublicApplication, mockCheckCvObjectExists } = vi.hoisted(
  () => ({
    mockResolvePublicApplication: vi.fn(),
    mockCheckCvObjectExists: vi.fn(),
  }),
);

vi.mock("@/lib/utils/resolve-public-application", () => ({
  resolvePublicApplication: mockResolvePublicApplication,
}));
vi.mock("@/lib/utils/cv-storage", () => ({
  checkCvObjectExists: mockCheckCvObjectExists,
}));

import { loadOwnerDraftPreview } from "@/lib/utils/load-owner-draft-preview";

const PUBLIC_ID = "k7x2m9ab";
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

beforeEach(() => {
  vi.clearAllMocks();
});

describe("loadOwnerDraftPreview", () => {
  it("returns null when the public id + slug do not resolve", async () => {
    mockResolvePublicApplication.mockResolvedValue(null);

    await expect(
      loadOwnerDraftPreview(PUBLIC_ID, SLUG, "owner-id"),
    ).resolves.toBeNull();
  });

  it("returns null when the viewer is not the owner", async () => {
    mockResolvePublicApplication.mockResolvedValue({
      application: DRAFT_APP,
      ownerUserId: "owner-id",
    });

    await expect(
      loadOwnerDraftPreview(PUBLIC_ID, SLUG, "other-user"),
    ).resolves.toBeNull();
    expect(mockCheckCvObjectExists).not.toHaveBeenCalled();
  });

  it("returns null for active applications (public loader handles those)", async () => {
    mockResolvePublicApplication.mockResolvedValue({
      application: { ...DRAFT_APP, status: "active" },
      ownerUserId: "owner-id",
    });

    await expect(
      loadOwnerDraftPreview(PUBLIC_ID, SLUG, "owner-id"),
    ).resolves.toBeNull();
  });

  it("returns null for archived applications", async () => {
    mockResolvePublicApplication.mockResolvedValue({
      application: { ...DRAFT_APP, status: "archived" },
      ownerUserId: "owner-id",
    });

    await expect(
      loadOwnerDraftPreview(PUBLIC_ID, SLUG, "owner-id"),
    ).resolves.toBeNull();
  });

  it("returns the public DTO + application id for the owning viewer of a draft", async () => {
    mockResolvePublicApplication.mockResolvedValue({
      application: DRAFT_APP,
      ownerUserId: "owner-id",
    });
    mockCheckCvObjectExists.mockResolvedValue(true);

    const result = await loadOwnerDraftPreview(PUBLIC_ID, SLUG, "owner-id");
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
});
