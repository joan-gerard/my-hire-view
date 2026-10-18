/**
 * Tests for primary CV library constants, delete confirm copy, post-delete
 * warning, and preview labels.
 */
import { describe, it, expect } from "vitest";
import {
  PRIMARY_CV_DELETE_PREVIEW_LIMIT,
  PRIMARY_CV_LIBRARY_CAP_ERROR_MARKER,
  PRIMARY_CV_MAX_PER_USER,
  isPrimaryCvLibraryCapError,
  primaryCvApplicationPreviewLabel,
  primaryCvDeleteConfirmLabel,
  primaryCvDeleteConfirmMessage,
  primaryCvDeletedStillReferencedMessage,
  primaryCvLibraryCapMaxFromDbError,
  primaryCvLibraryCapMessage,
  primaryCvPostDeleteStatusMessage,
} from "@/lib/types/primary-cv";

describe("primary CV library constants", () => {
  it("caps the library at five primaries per user", () => {
    expect(PRIMARY_CV_MAX_PER_USER).toBe(5);
  });

  it("limits delete-confirm previews to ten applications", () => {
    expect(PRIMARY_CV_DELETE_PREVIEW_LIMIT).toBe(10);
  });
});

describe("primary CV library cap helpers (F13-032)", () => {
  it("builds the user-facing at-capacity message", () => {
    expect(primaryCvLibraryCapMessage()).toBe(
      "You can store up to 5 primary CVs. Delete one to upload another.",
    );
    expect(primaryCvLibraryCapMessage(15)).toBe(
      "You can store up to 15 primary CVs. Delete one to upload another.",
    );
  });

  it("detects the DB trigger marker", () => {
    expect(
      isPrimaryCvLibraryCapError({
        message: `${PRIMARY_CV_LIBRARY_CAP_ERROR_MARKER}:user=abc:max=5`,
        code: "P0001",
      }),
    ).toBe(true);
    expect(isPrimaryCvLibraryCapError({ message: "other error" })).toBe(false);
    expect(isPrimaryCvLibraryCapError(null)).toBe(false);
  });

  it("parses max from the DB exception message", () => {
    expect(
      primaryCvLibraryCapMaxFromDbError({
        message: `${PRIMARY_CV_LIBRARY_CAP_ERROR_MARKER}:user=abc:max=15`,
      }),
    ).toBe(15);
    expect(
      primaryCvLibraryCapMaxFromDbError({ message: "unrelated" }),
    ).toBeNull();
  });
});

describe("primaryCvDeleteConfirmMessage", () => {
  it("asks for confirmation when no applications use the CV", () => {
    const message = primaryCvDeleteConfirmMessage(0);
    expect(message).toContain("Delete this primary CV from your library?");
    expect(message).toContain("This cannot be undone.");
    expect(message).not.toContain("CV missing");
  });

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

describe("primaryCvDeleteConfirmLabel", () => {
  it("uses plain Delete when unused", () => {
    expect(primaryCvDeleteConfirmLabel(0)).toBe("Delete");
  });

  it("uses stronger wording when applications still reference the CV", () => {
    expect(primaryCvDeleteConfirmLabel(1)).toBe("I Understand — Delete");
    expect(primaryCvDeleteConfirmLabel(4)).toBe("I Understand — Delete");
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

describe("primaryCvPostDeleteStatusMessage", () => {
  it("returns null when no applications were affected", () => {
    expect(
      primaryCvPostDeleteStatusMessage({
        applicationsAffected: 0,
        refreshed: true,
      }),
    ).toBeNull();
    expect(
      primaryCvPostDeleteStatusMessage({
        applicationsAffected: 0,
        refreshed: false,
      }),
    ).toBeNull();
  });

  it("returns the still-referenced warning after a successful refresh", () => {
    expect(
      primaryCvPostDeleteStatusMessage({
        applicationsAffected: 2,
        refreshed: true,
      }),
    ).toBe(
      "Primary CV deleted. 2 applications still referenced it and will show “CV missing” until updated.",
    );
  });

  it("keeps the warning and notes refresh failure when the list reload fails", () => {
    expect(
      primaryCvPostDeleteStatusMessage({
        applicationsAffected: 1,
        refreshed: false,
      }),
    ).toBe(
      "Primary CV deleted. 1 application still referenced it and will show “CV missing” until updated. The library list could not be refreshed — try again.",
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
