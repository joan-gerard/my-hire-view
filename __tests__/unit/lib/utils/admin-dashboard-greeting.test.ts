import { describe, expect, it } from "vitest";
import { timeOfDayGreeting } from "@/lib/utils/admin-dashboard-greeting";

describe("timeOfDayGreeting", () => {
  it("returns morning before noon", () => {
    expect(timeOfDayGreeting(new Date(2026, 9, 21, 9, 0, 0))).toBe(
      "Good morning",
    );
  });

  it("returns afternoon from noon until evening", () => {
    expect(timeOfDayGreeting(new Date(2026, 9, 21, 14, 30, 0))).toBe(
      "Good afternoon",
    );
  });

  it("returns evening from 18:00", () => {
    expect(timeOfDayGreeting(new Date(2026, 9, 21, 18, 0, 0))).toBe(
      "Good evening",
    );
  });
});
