import { describe, expect, it } from "vitest";
import {
  applicationDayKey,
  formatApplicationTime,
  groupApplicationsByDay,
} from "@/lib/utils/group-applications-by-day";

describe("groupApplicationsByDay", () => {
  it("groups consecutive apps on the same local day and keeps order", () => {
    const apps = [
      { id: "1", created_at: "2026-10-15T15:46:00.000Z" },
      { id: "2", created_at: "2026-10-15T14:00:00.000Z" },
      { id: "3", created_at: "2026-10-14T12:00:00.000Z" },
    ];

    const groups = groupApplicationsByDay(apps);
    expect(groups).toHaveLength(2);
    expect(groups[0].applications.map((a) => a.id)).toEqual(["1", "2"]);
    expect(groups[1].applications.map((a) => a.id)).toEqual(["3"]);
    expect(groups[0].dayKey).toBe(applicationDayKey(apps[0].created_at));
    expect(groups[1].dayKey).toBe(applicationDayKey(apps[2].created_at));
  });

  it("returns an empty list for no applications", () => {
    expect(groupApplicationsByDay([])).toEqual([]);
  });
});

describe("formatApplicationTime", () => {
  it("returns a compact time string without spaces", () => {
    const formatted = formatApplicationTime("2026-10-15T15:46:00.000Z");
    expect(formatted).not.toMatch(/\s/);
    expect(formatted.toLowerCase()).toBe(formatted);
    expect(formatted).toMatch(/\d/);
  });
});
