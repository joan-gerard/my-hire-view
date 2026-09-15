/**
 * Tests for same-origin leave-intercept helpers (create-app draft guard).
 */
import { afterEach, describe, expect, it, vi } from "vitest";
import type { ApplicationCvType } from "@/lib/types/application";
import {
  hasLeaveRelevantDraftChanges,
  isLeaveGuardHistoryState,
  leaveRelevantDraftSnapshot,
  shouldBlockSameOriginNavigation,
  waitUntilLeaveGuardCleared,
} from "@/lib/utils/leave-confirm";

const HERE = "https://app.example/admin/new";

describe("shouldBlockSameOriginNavigation", () => {
  it("blocks other same-origin paths", () => {
    expect(shouldBlockSameOriginNavigation("/admin", HERE)).toBe("/admin");
    expect(shouldBlockSameOriginNavigation("/admin/profile", HERE)).toBe(
      "/admin/profile",
    );
    expect(
      shouldBlockSameOriginNavigation("https://app.example/admin", HERE),
    ).toBe("/admin");
  });

  it("allows same page, hashes, mailto, and external links", () => {
    expect(shouldBlockSameOriginNavigation("/admin/new", HERE)).toBeNull();
    expect(shouldBlockSameOriginNavigation("#section", HERE)).toBeNull();
    expect(
      shouldBlockSameOriginNavigation("/admin/new#section", HERE),
    ).toBeNull();
    expect(shouldBlockSameOriginNavigation("mailto:a@b.c", HERE)).toBeNull();
    expect(
      shouldBlockSameOriginNavigation("https://other.example/x", HERE),
    ).toBeNull();
  });
});

describe("leaveRelevantDraftSnapshot", () => {
  const blank = {
    company: "",
    role: "",
    slug: "auto",
    video_url: "",
    first_name: "Ada",
    last_name: "",
    location: "",
    portfolio_url: "",
    linkedin_url: "",
    include: {
      first_name: true,
      last_name: false,
      location: false,
      portfolio_url: false,
      linkedin_url: false,
    },
    slugNamePosition: null as "start" | "end" | null,
    slugManuallyEdited: false,
    showProfilePicture: true,
    cvMode: "primary" as ApplicationCvType,
    cvModeUserChosen: false,
    selectedPrimaryId: "cv-1",
    use_original_cv_filename: true,
  };

  it("ignores auto slug and automatic primary selection", () => {
    const a = leaveRelevantDraftSnapshot(blank);
    const b = leaveRelevantDraftSnapshot({
      ...blank,
      slug: "different-auto-slug",
      selectedPrimaryId: "cv-2",
    });
    expect(a).toBe(b);
  });

  it("tracks manual slug text while ignoring auto slug updates", () => {
    const baseline = leaveRelevantDraftSnapshot({
      ...blank,
      slugManuallyEdited: true,
      slug: "custom-one",
    });
    expect(
      hasLeaveRelevantDraftChanges(baseline, {
        ...blank,
        slugManuallyEdited: true,
        slug: "custom-two",
      }),
    ).toBe(true);
    expect(
      hasLeaveRelevantDraftChanges(
        leaveRelevantDraftSnapshot(blank),
        {
          ...blank,
          slug: "only-auto-changed",
        },
      ),
    ).toBe(false);
  });

  it("detects company edits and explicit CV choice", () => {
    const baseline = leaveRelevantDraftSnapshot(blank);
    expect(
      hasLeaveRelevantDraftChanges(baseline, { ...blank, company: "Acme" }),
    ).toBe(true);
    expect(
      hasLeaveRelevantDraftChanges(baseline, {
        ...blank,
        cvModeUserChosen: true,
        cvMode: "tailored",
        selectedPrimaryId: null,
      }),
    ).toBe(true);
  });
});

describe("isLeaveGuardHistoryState", () => {
  it("detects the leave-confirm sentinel marker", () => {
    expect(isLeaveGuardHistoryState({ __mhvLeaveGuard: true })).toBe(true);
    expect(isLeaveGuardHistoryState({ __mhvLeaveGuard: false })).toBe(false);
    expect(isLeaveGuardHistoryState(null)).toBe(false);
    expect(isLeaveGuardHistoryState({})).toBe(false);
  });
});

describe("waitUntilLeaveGuardCleared", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.useRealTimers();
  });

  it("resolves immediately when history is not on the leave guard", async () => {
    vi.stubGlobal("window", {
      history: { state: null },
      requestAnimationFrame: vi.fn(),
      cancelAnimationFrame: vi.fn(),
      setTimeout,
      clearTimeout,
    });
    await expect(waitUntilLeaveGuardCleared(50)).resolves.toBeUndefined();
    expect(window.requestAnimationFrame).not.toHaveBeenCalled();
  });

  it("resolves on setTimeout deadline when RAF never fires (background tab)", async () => {
    vi.useFakeTimers();
    vi.stubGlobal("window", {
      history: { state: { __mhvLeaveGuard: true } },
      requestAnimationFrame: vi.fn(() => 1),
      cancelAnimationFrame: vi.fn(),
      setTimeout: globalThis.setTimeout.bind(globalThis),
      clearTimeout: globalThis.clearTimeout.bind(globalThis),
    });

    const pending = waitUntilLeaveGuardCleared(100);
    await vi.advanceTimersByTimeAsync(100);
    await expect(pending).resolves.toBeUndefined();
    expect(window.cancelAnimationFrame).toHaveBeenCalledWith(1);
  });

  it("resolves early when the sentinel clears before the deadline", async () => {
    vi.useFakeTimers();
    const history = { state: { __mhvLeaveGuard: true } as unknown };
    const rafCallbacks: FrameRequestCallback[] = [];
    vi.stubGlobal("window", {
      history,
      requestAnimationFrame: vi.fn((cb: FrameRequestCallback) => {
        rafCallbacks.push(cb);
        return rafCallbacks.length;
      }),
      cancelAnimationFrame: vi.fn(),
      setTimeout: globalThis.setTimeout.bind(globalThis),
      clearTimeout: globalThis.clearTimeout.bind(globalThis),
    });

    const pending = waitUntilLeaveGuardCleared(5000);
    expect(rafCallbacks).toHaveLength(1);
    history.state = null;
    rafCallbacks[0](0);
    await expect(pending).resolves.toBeUndefined();
  });
});
