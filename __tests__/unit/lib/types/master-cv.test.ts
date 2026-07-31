/**
 * Tests for master CV delete confirm copy and preview labels.
 */
import { describe, it, expect } from "vitest";
import {
  masterCvApplicationPreviewLabel,
  masterCvDeleteConfirmMessage,
} from "@/lib/types/master-cv";

describe("masterCvDeleteConfirmMessage", () => {
  it("uses singular wording for one application", () => {
    const message = masterCvDeleteConfirmMessage(1);
    expect(message.startsWith("1 application currently uses")).toBe(true);
    expect(message).toContain("That application will show");
    expect(message).toContain("“CV missing”");
    expect(message).toContain("This cannot be undone.");
  });

  it("uses plural wording for multiple applications", () => {
    const message = masterCvDeleteConfirmMessage(3);
    expect(message.startsWith("3 applications currently use")).toBe(true);
    expect(message).toContain("Those applications will show");
  });

  it("floors non-integer counts", () => {
    expect(masterCvDeleteConfirmMessage(2.9).startsWith("2 applications")).toBe(
      true,
    );
  });
});

describe("masterCvApplicationPreviewLabel", () => {
  it("joins company and role", () => {
    expect(
      masterCvApplicationPreviewLabel({
        company: "Acme",
        role: "Engineer",
      }),
    ).toBe("Acme — Engineer");
  });

  it("falls back when company or role is blank", () => {
    expect(
      masterCvApplicationPreviewLabel({ company: "  ", role: "Engineer" }),
    ).toBe("Untitled company — Engineer");
    expect(
      masterCvApplicationPreviewLabel({ company: "Acme", role: "" }),
    ).toBe("Acme — Untitled role");
  });
});
