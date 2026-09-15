/**
 * Tests for the single-resolve view page loader (F16-050).
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import type { Application } from "@/lib/types/application";

const {
  mockResolvePublicApplication,
  mockCheckCvObjectExists,
  mockGetUser,
} = vi.hoisted(() => ({
  mockResolvePublicApplication: vi.fn(),
  mockCheckCvObjectExists: vi.fn(),
  mockGetUser: vi.fn(),
}));

vi.mock("@/lib/utils/resolve-public-application", () => ({
  resolvePublicApplication: mockResolvePublicApplication,
}));
vi.mock("@/lib/utils/cv-storage", () => ({
  checkCvObjectExists: mockCheckCvObjectExists,
}));
vi.mock("@/lib/auth", () => ({
  getUser: mockGetUser,
}));

import { loadViewPageApplication } from "@/lib/utils/load-view-page-application";

const PUBLIC_ID = "k7x2m9ab";
const SLUG = "volvo-engineer";

const BASE_APP: Application = {
  id: "app-1",
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
  status: "active",
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
  mockGetUser.mockResolvedValue(null);
});

describe("loadViewPageApplication", () => {
  it("returns not_found when the pair does not resolve (single resolve call)", async () => {
    mockResolvePublicApplication.mockResolvedValue(null);

    await expect(loadViewPageApplication(PUBLIC_ID, SLUG)).resolves.toEqual({
      kind: "not_found",
    });
    expect(mockResolvePublicApplication).toHaveBeenCalledTimes(1);
    expect(mockGetUser).not.toHaveBeenCalled();
  });

  it("returns live DTO for active apps without checking the session", async () => {
    mockResolvePublicApplication.mockResolvedValue({
      application: BASE_APP,
      ownerUserId: "owner-id",
    });
    mockCheckCvObjectExists.mockResolvedValue(true);

    const result = await loadViewPageApplication(PUBLIC_ID, SLUG);
    expect(result.kind).toBe("live");
    if (result.kind === "live") {
      expect(result.application).toMatchObject({
        status: "active",
        company: "Volvo",
        cv_exists: true,
      });
    }
    expect(mockResolvePublicApplication).toHaveBeenCalledTimes(1);
    expect(mockGetUser).not.toHaveBeenCalled();
  });

  it("returns owner_draft_preview with a single resolve when the owner views a draft", async () => {
    mockResolvePublicApplication.mockResolvedValue({
      application: { ...BASE_APP, status: "draft" },
      ownerUserId: "owner-id",
    });
    mockGetUser.mockResolvedValue({ id: "owner-id" });
    mockCheckCvObjectExists.mockResolvedValue(true);

    const result = await loadViewPageApplication(PUBLIC_ID, SLUG);
    expect(result).toEqual({
      kind: "owner_draft_preview",
      applicationId: "app-1",
      application: expect.objectContaining({
        status: "active",
        company: "Volvo",
        cv_exists: true,
      }),
    });
    expect(mockResolvePublicApplication).toHaveBeenCalledTimes(1);
    expect(mockGetUser).toHaveBeenCalledTimes(1);
  });

  it("returns unavailable for drafts when the viewer is not the owner", async () => {
    mockResolvePublicApplication.mockResolvedValue({
      application: { ...BASE_APP, status: "draft" },
      ownerUserId: "owner-id",
    });
    mockGetUser.mockResolvedValue({ id: "other-user" });

    await expect(loadViewPageApplication(PUBLIC_ID, SLUG)).resolves.toEqual({
      kind: "unavailable",
    });
    expect(mockResolvePublicApplication).toHaveBeenCalledTimes(1);
    expect(mockCheckCvObjectExists).not.toHaveBeenCalled();
  });

  it("returns unavailable for archived apps even for the owner", async () => {
    mockResolvePublicApplication.mockResolvedValue({
      application: { ...BASE_APP, status: "archived" },
      ownerUserId: "owner-id",
    });
    mockGetUser.mockResolvedValue({ id: "owner-id" });

    await expect(loadViewPageApplication(PUBLIC_ID, SLUG)).resolves.toEqual({
      kind: "unavailable",
    });
    expect(mockResolvePublicApplication).toHaveBeenCalledTimes(1);
  });
});
