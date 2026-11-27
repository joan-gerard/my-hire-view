import { describe, expect, it } from "vitest";
import { buildApplicationFormPreview } from "@/lib/utils/application-form-preview";

describe("buildApplicationFormPreview", () => {
  it("maps trimmed form fields into the public share DTO shape", () => {
    const preview = buildApplicationFormPreview({
      company: "  Acme  ",
      role: " Engineer ",
      first_name: " Joan ",
      last_name: " Gerard ",
      location: "  Paris ",
      email: " a@b.co ",
      phone: "  ",
      portfolio_url: null,
      linkedin_url: " https://linkedin.com/in/joan ",
      profile_picture_url: " https://cdn.example/photo.jpg ",
      cv_url: " https://cdn.example/cv.pdf ",
      cv_filename: " Joan.pdf ",
      use_original_cv_filename: false,
      cv_exists: true,
      video_url: " https://youtu.be/abc123 ",
    });

    expect(preview).toMatchObject({
      status: "active",
      company: "Acme",
      role: "Engineer",
      first_name: "Joan",
      last_name: "Gerard",
      location: "Paris",
      email: "a@b.co",
      phone: null,
      portfolio_url: null,
      linkedin_url: "https://linkedin.com/in/joan",
      profile_picture_url: "https://cdn.example/photo.jpg",
      cv_url: "https://cdn.example/cv.pdf",
      cv_filename: "Joan.pdf",
      use_original_cv_filename: false,
      cv_exists: true,
      video_url: "https://youtu.be/abc123",
    });
  });

  it("omits cv_exists when there is no résumé URL", () => {
    const preview = buildApplicationFormPreview({
      company: "Acme",
      role: "Engineer",
      first_name: "Joan",
      last_name: "Gerard",
      location: null,
      email: null,
      phone: null,
      portfolio_url: null,
      linkedin_url: null,
      profile_picture_url: null,
      cv_url: null,
      cv_filename: null,
      use_original_cv_filename: true,
      cv_exists: false,
      video_url: "https://youtu.be/abc123",
    });

    expect(preview.cv_url).toBeNull();
    expect(preview.cv_exists).toBeUndefined();
  });
});
