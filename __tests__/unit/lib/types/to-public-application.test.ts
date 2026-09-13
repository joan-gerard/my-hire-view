/**
 * Tests for public share DTO mappers (F10-030).
 */
import { describe, expect, it } from "vitest";
import type { Application } from "@/lib/types/application";
import {
  assertActiveApplication,
  toPublicApplication,
  toPublicApplicationResponse,
  type ActiveApplication,
} from "@/lib/types/application";

const BASE_APP: Application = {
  id: "app-1",
  slug: "acme-engineer",
  user_id: "owner-id",
  company: "Acme",
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

const ACTIVE_APP = BASE_APP as ActiveApplication;

describe("assertActiveApplication", () => {
  it("accepts active applications", () => {
    expect(() => assertActiveApplication(ACTIVE_APP)).not.toThrow();
  });

  it("rejects draft and archived applications", () => {
    expect(() =>
      assertActiveApplication({ ...BASE_APP, status: "draft" }),
    ).toThrow(/requires status "active".*draft/);
    expect(() =>
      assertActiveApplication({ ...BASE_APP, status: "archived" }),
    ).toThrow(/requires status "active".*archived/);
  });
});

describe("toPublicApplication", () => {
  it("maps an active application to the public DTO (no owner-only fields)", () => {
    expect(toPublicApplication(ACTIVE_APP, true)).toEqual({
      company: "Acme",
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

  it("throws instead of leaking PII when status is forced via type escape", () => {
    const draftAsActive = {
      ...BASE_APP,
      status: "draft",
    } as unknown as ActiveApplication;

    expect(() => toPublicApplication(draftAsActive)).toThrow(
      /requires status "active".*draft/,
    );
  });
});

describe("toPublicApplicationResponse", () => {
  it("returns the full public DTO for active applications", () => {
    expect(toPublicApplicationResponse(BASE_APP, false)).toMatchObject({
      status: "active",
      company: "Acme",
      cv_exists: false,
    });
  });

  it("returns the unavailable stub for draft and archived (no PII)", () => {
    expect(
      toPublicApplicationResponse({ ...BASE_APP, status: "draft" }),
    ).toEqual({ status: "unavailable" });
    expect(
      toPublicApplicationResponse({ ...BASE_APP, status: "archived" }),
    ).toEqual({ status: "unavailable" });
  });
});
