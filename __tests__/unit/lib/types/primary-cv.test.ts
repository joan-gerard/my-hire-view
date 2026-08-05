/**
 * Tests for primary CV delete confirm copy and preview labels.
 */
import { describe, it, expect } from "vitest";
import {
  primaryCvApplicationPreviewLabel,
  primaryCvDeleteConfirmMessage,
} from "@/lib/types/primary-cv";

describe("primaryCvDeleteConfirmMessage", () => {
  it("uses singular wording for one application", () => {
    const message = primaryCvDeleteConfirmMessage(1);
    expect(message.startsWith("1 application currently uses")).toBe(true);
    expect(message).toContain("That application will show");
    expect(message).toContain("“CV missing”");
    expect(message).toContain("This cannot be undone.");
  });

  it("uses plural wording for multiple applications", () => {
    const message = primaryCvDeleteConfirmMessage(3);
    expect(message.startsWith("3 applications currently use")).toBe(true);
    expect(message).toContain("Those applications will show");
  });

  it("floors non-integer counts", () => {
    expect(primaryCvDeleteConfirmMessage(2.9).startsWith("2 applications")).toBe(
      true,
    );
  });
});

describe("primaryCvApplicationPreviewLabel", () => {
  it("joins company and role", () => {
    expect(
      primaryCvApplicationPreviewLabel({
        company: "Acme",
        role: "Engineer",
      }),
    ).toBe("Acme — Engineer");
  });

  it("falls back when company or role is blank", () => {
    expect(
      primaryCvApplicationPreviewLabel({ company: "  ", role: "Engineer" }),
    ).toBe("Untitled company — Engineer");
    expect(
      primaryCvApplicationPreviewLabel({ company: "Acme", role: "" }),
    ).toBe("Acme — Untitled role");
  });
});
