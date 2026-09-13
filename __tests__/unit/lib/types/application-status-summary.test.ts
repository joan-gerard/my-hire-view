/**
 * Tests for the profile page application status breakdown (F18-054).
 */
import { describe, expect, it } from "vitest";
import { formatApplicationStatusBreakdown } from "@/lib/types/application";

describe("formatApplicationStatusBreakdown", () => {
  it("omits zero counts so the copy still adds up without drafts", () => {
    expect(
      formatApplicationStatusBreakdown({
        active: 3,
        draft: 0,
        archived: 1,
      }),
    ).toBe("3 active, 1 archived");
  });

  it("includes drafts so the parenthetical matches the total", () => {
    expect(
      formatApplicationStatusBreakdown({
        active: 3,
        draft: 1,
        archived: 1,
      }),
    ).toBe("3 active, 1 draft, 1 archived");
  });

  it("pluralizes draft when there is more than one", () => {
    expect(
      formatApplicationStatusBreakdown({
        active: 0,
        draft: 2,
        archived: 0,
      }),
    ).toBe("2 drafts");
  });

  it("returns null when every count is zero", () => {
    expect(
      formatApplicationStatusBreakdown({
        active: 0,
        draft: 0,
        archived: 0,
      }),
    ).toBeNull();
  });

  it("floors non-integer counts and ignores negatives", () => {
    expect(
      formatApplicationStatusBreakdown({
        active: 1.9,
        draft: -2,
        archived: 0.4,
      }),
    ).toBe("1 active");
  });
});
