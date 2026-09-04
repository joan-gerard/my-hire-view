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

import { loadPublicApplicationResponse } from "@/lib/utils/load-public-application-response";

const PUBLIC_ID = "k7x2m9ab";
const SLUG = "volvo-engineer";

const PUBLIC_APP: Application = {
  id: "app-pub",
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
  view_count: 5,
  download_count: 2,
  last_viewed_at: "2026-01-01T00:00:00Z",
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

describe("loadPublicApplicationResponse", () => {
  it("returns null when the public id + slug do not resolve", async () => {
    mockResolvePublicApplication.mockResolvedValue(null);

    const result = await loadPublicApplicationResponse(PUBLIC_ID, SLUG);
    expect(result).toBeNull();
  });

  it("returns the active public DTO with cv_exists when the CV exists", async () => {
    mockResolvePublicApplication.mockResolvedValue({
      application: PUBLIC_APP,
      ownerUserId: "owner-id",
    });
    mockCheckCvObjectExists.mockResolvedValue(true);

    const result = await loadPublicApplicationResponse(PUBLIC_ID, SLUG);
    expect(result).toEqual({
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
    });
  });

  it("returns cv_exists:false when HeadObject confirms the CV is missing", async () => {
    mockResolvePublicApplication.mockResolvedValue({
      application: PUBLIC_APP,
      ownerUserId: "owner-id",
    });
    mockCheckCvObjectExists.mockResolvedValue(false);

    const result = await loadPublicApplicationResponse(PUBLIC_ID, SLUG);
    expect(result).toMatchObject({ status: "active", cv_exists: false });
  });

  it("omits cv_exists when cv_url is absent", async () => {
    mockResolvePublicApplication.mockResolvedValue({
      application: { ...PUBLIC_APP, cv_url: "" },
      ownerUserId: "owner-id",
    });

    const result = await loadPublicApplicationResponse(PUBLIC_ID, SLUG);
    expect(result).toMatchObject({ status: "active" });
    expect(result).not.toHaveProperty("cv_exists");
    expect(mockCheckCvObjectExists).not.toHaveBeenCalled();
  });

  it("returns unavailable stub for archived applications without checking R2", async () => {
    mockResolvePublicApplication.mockResolvedValue({
      application: { ...PUBLIC_APP, status: "archived" },
      ownerUserId: "owner-id",
    });

    const result = await loadPublicApplicationResponse(PUBLIC_ID, SLUG);
    expect(result).toEqual({ status: "unavailable" });
    expect(mockCheckCvObjectExists).not.toHaveBeenCalled();
  });

  it("returns unavailable stub for draft applications without checking R2", async () => {
    mockResolvePublicApplication.mockResolvedValue({
      application: { ...PUBLIC_APP, status: "draft" },
      ownerUserId: "owner-id",
    });

    const result = await loadPublicApplicationResponse(PUBLIC_ID, SLUG);
    expect(result).toEqual({ status: "unavailable" });
    expect(mockCheckCvObjectExists).not.toHaveBeenCalled();
  });

  it("omits cv_exists when HeadObject fails for infrastructure reasons", async () => {
    mockResolvePublicApplication.mockResolvedValue({
      application: PUBLIC_APP,
      ownerUserId: "owner-id",
    });
    mockCheckCvObjectExists.mockResolvedValue(undefined);

    const result = await loadPublicApplicationResponse(PUBLIC_ID, SLUG);
    expect(result).toMatchObject({ status: "active", cv_url: PUBLIC_APP.cv_url });
    expect(result).not.toHaveProperty("cv_exists");
  });

  it("propagates unexpected errors from resolvePublicApplication", async () => {
    mockResolvePublicApplication.mockRejectedValue(new Error("supabase down"));

    await expect(
      loadPublicApplicationResponse(PUBLIC_ID, SLUG),
    ).rejects.toThrow("supabase down");
  });
});
