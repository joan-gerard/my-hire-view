import {
  formatDemoCreatedLabel,
  formatDemoLastViewedLabel,
  formatDemoLinkEnding,
  formatDemoViewedAgoLabel,
  formatDemoViewsPillLabel,
  isDemoFreshView,
} from "@/app/demo/map-application-to-demo";
import { describe, expect, it } from "vitest";

describe("formatDemoCreatedLabel", () => {
  it("uses an unambiguous day month year format", () => {
    expect(formatDemoCreatedLabel("2026-11-04T10:00:00")).toBe("4 Nov 2026");
  });
});

describe("formatDemoLastViewedLabel", () => {
  it("includes an unambiguous date plus time", () => {
    expect(formatDemoLastViewedLabel("2026-11-04T14:20:00")).toBe(
      "4 Nov 2026, 14:20",
    );
  });
});

describe("isDemoFreshView", () => {
  const now = new Date("2026-11-12T15:00:00");

  it("marks recent views as fresh within the window", () => {
    expect(isDemoFreshView("2026-11-12T13:00:00", now, 3)).toBe(true);
    expect(isDemoFreshView("2026-11-10T15:00:00", now, 3)).toBe(true);
  });

  it("marks older views as not fresh", () => {
    expect(isDemoFreshView("2026-11-08T15:00:00", now, 3)).toBe(false);
    expect(isDemoFreshView(null, now)).toBe(false);
  });
});

describe("formatDemoLinkEnding", () => {
  it("formats the share path ending from a slug", () => {
    expect(formatDemoLinkEnding("madira-ink-senior-product-designer")).toBe(
      "madira-ink-senior-product-designer",
    );
  });

  it("returns null for empty slugs", () => {
    expect(formatDemoLinkEnding(null)).toBeNull();
    expect(formatDemoLinkEnding("  ")).toBeNull();
  });
});

describe("formatDemoViewedAgoLabel", () => {
  const now = new Date("2026-11-12T15:00:00");

  it("returns null for missing or invalid timestamps", () => {
    expect(formatDemoViewedAgoLabel(null, now)).toBeNull();
    expect(formatDemoViewedAgoLabel("not-a-date", now)).toBeNull();
  });

  it("uses short relative copy for recent views", () => {
    expect(formatDemoViewedAgoLabel("2026-11-12T14:59:30", now)).toBe(
      "Viewed just now",
    );
    expect(formatDemoViewedAgoLabel("2026-11-12T14:40:00", now)).toBe(
      "Viewed 20m ago",
    );
    expect(formatDemoViewedAgoLabel("2026-11-12T13:00:00", now)).toBe(
      "Viewed 2h ago",
    );
  });

  it("keeps hour labels later on the same day", () => {
    expect(formatDemoViewedAgoLabel("2026-11-12T02:00:00", now)).toBe(
      "Viewed 13h ago",
    );
  });

  it("uses day-count labels across days, including older views", () => {
    expect(formatDemoViewedAgoLabel("2026-11-11T15:00:00", now)).toBe(
      "Viewed 1d ago",
    );
    expect(formatDemoViewedAgoLabel("2026-11-09T15:00:00", now)).toBe(
      "Viewed 3d ago",
    );
    expect(formatDemoViewedAgoLabel("2026-10-22T15:00:00", now)).toBe(
      "Viewed 21d ago",
    );
  });
});

describe("formatDemoViewsPillLabel", () => {
  const now = new Date("2026-11-12T15:00:00");

  it("combines view count with relative last-viewed time", () => {
    expect(formatDemoViewsPillLabel(12, "2026-11-12T13:00:00", now)).toBe(
      "12 views · 2h ago",
    );
    expect(formatDemoViewsPillLabel(1, "2026-11-12T14:40:00", now)).toBe(
      "1 view · 20m ago",
    );
  });

  it("uses not viewed yet when the count is still zero", () => {
    expect(formatDemoViewsPillLabel(0, null, now)).toBe("not viewed yet");
  });
});
