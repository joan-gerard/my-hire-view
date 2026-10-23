import { describe, expect, it } from "vitest";
import {
  applicationDayKey,
  formatApplicationTime,
  groupApplicationsByDay,
} from "@/lib/utils/group-applications-by-day";

/** Local calendar day at noon — stable across timezones (avoids UTC→local day shifts). */
function localNoonIso(year: number, monthIndex: number, day: number): string {
  return new Date(year, monthIndex, day, 12, 0, 0, 0).toISOString();
}

describe("groupApplicationsByDay", () => {
  it("groups consecutive apps on the same local day and keeps order", () => {
    const sameDayAfternoon = new Date(2026, 9, 15, 15, 46, 0, 0).toISOString();
    const sameDayEarlier = new Date(2026, 9, 15, 14, 0, 0, 0).toISOString();
    const previousDay = localNoonIso(2026, 9, 14);

    const apps = [
      { id: "1", created_at: sameDayAfternoon },
      { id: "2", created_at: sameDayEarlier },
      { id: "3", created_at: previousDay },
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
    const formatted = formatApplicationTime(
      new Date(2026, 9, 15, 15, 46, 0, 0).toISOString(),
    );
    expect(formatted).not.toMatch(/\s/);
    expect(formatted.toLowerCase()).toBe(formatted);
    expect(formatted).toMatch(/\d/);
  });
});

describe("applicationDayKey with an explicit time zone", () => {
  it("can place a near-midnight UTC instant on different local days", () => {
    // 04:00 UTC on 15 Oct is still 14 Oct evening in Los Angeles.
    const nearMidnightUtc = "2026-10-15T04:00:00.000Z";
    expect(applicationDayKey(nearMidnightUtc, "UTC")).toBe("2026-10-15");
    expect(applicationDayKey(nearMidnightUtc, "America/Los_Angeles")).toBe(
      "2026-10-14",
    );
  });
});
