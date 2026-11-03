import { describe, expect, it } from "vitest";
import { roleChecklistSummary } from "@/lib/utils/role-checklist-summary";
import { SLUG_COLLISION_USER_MESSAGE } from "@/lib/utils/slug";

const ready = {
  company: "Northwind",
  role: "Product designer",
  slug: "northwind-product-designer",
  roleReady: true,
  slugStatus: { kind: "available" as const },
};

describe("roleChecklistSummary", () => {
  it("asks for both names when role is empty", () => {
    expect(
      roleChecklistSummary({
        ...ready,
        company: "  ",
        role: "",
        roleReady: false,
        slugStatus: { kind: "idle" },
      }),
    ).toEqual({ text: "Add a company and role", pending: true, progress: false });
  });

  it("shows the one name that is filled", () => {
    expect(
      roleChecklistSummary({
        ...ready,
        role: "",
        roleReady: false,
        slugStatus: { kind: "idle" },
      }).text,
    ).toBe("Northwind");
  });

  it("names the company and role once the link is ready", () => {
    expect(roleChecklistSummary(ready)).toEqual({
      text: "Northwind · Product designer",
      pending: false,
      progress: false,
    });
  });

  it("says the link is being checked even when the step still counts as ready", () => {
    expect(
      roleChecklistSummary({
        ...ready,
        slugStatus: { kind: "checking" },
      }),
    ).toEqual({ text: "Checking...", pending: false, progress: true });
  });

  it("asks for an ending when the slug is empty", () => {
    expect(
      roleChecklistSummary({
        ...ready,
        slug: "  ",
        roleReady: false,
        slugStatus: { kind: "idle" },
      }).text,
    ).toBe("Add a link ending");
  });

  it("asks to fix an invalid ending", () => {
    expect(
      roleChecklistSummary({
        ...ready,
        slug: "Not A Slug",
        roleReady: false,
        slugStatus: {
          kind: "invalid",
          message: "Use lowercase letters, numbers, and single hyphens between words.",
        },
      }).text,
    ).toBe("Fix the link ending");
  });

  it("says the link is already used for a collision", () => {
    expect(
      roleChecklistSummary({
        ...ready,
        roleReady: false,
        slugStatus: { kind: "unavailable", message: SLUG_COLLISION_USER_MESSAGE },
      }).text,
    ).toBe("Link already used");
    expect(
      roleChecklistSummary({
        ...ready,
        roleReady: false,
        slugStatus: {
          kind: "unavailable",
          message: "This slug is not available. Choose a different one.",
        },
      }).text,
    ).toBe("Link already used");
  });

  it("says the check failed for connection and session errors", () => {
    expect(
      roleChecklistSummary({
        ...ready,
        roleReady: false,
        slugStatus: {
          kind: "unavailable",
          message: "Could not verify slug. Check your connection and retry.",
        },
      }).text,
    ).toBe("Couldn't check the link");
  });
});
