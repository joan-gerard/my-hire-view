/**
 * Tests for primary CV delete confirm copy, post-delete warning, and preview labels.
 */
import { describe, it, expect } from "vitest";
import {
  primaryCvApplicationPreviewLabel,
  primaryCvDeleteConfirmMessage,
  primaryCvDeletedStillReferencedMessage,
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

describe("primaryCvDeletedStillReferencedMessage", () => {
  it("returns null when no applications were affected", () => {
    expect(primaryCvDeletedStillReferencedMessage(0)).toBeNull();
    expect(primaryCvDeletedStillReferencedMessage(-1)).toBeNull();
    expect(primaryCvDeletedStillReferencedMessage(Number.NaN)).toBeNull();
  });

  it("uses singular wording for one application", () => {
    expect(primaryCvDeletedStillReferencedMessage(1)).toBe(
      "Primary CV deleted. 1 application still referenced it and will show “CV missing” until updated.",
    );
  });

  it("uses plural wording for multiple applications", () => {
    expect(primaryCvDeletedStillReferencedMessage(2)).toBe(
      "Primary CV deleted. 2 applications still referenced it and will show “CV missing” until updated.",
    );
  });

  it("floors non-integer counts", () => {
    expect(primaryCvDeletedStillReferencedMessage(2.9)).toContain(
      "2 applications",
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
