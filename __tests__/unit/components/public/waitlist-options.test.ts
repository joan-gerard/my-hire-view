/**
 * Waitlist radio options must stay aligned with the API schema, including
 * “Network with recruiters”, so the form can submit every accepted enum.
 */
import {
  CAREER_STAGE_OPTIONS,
  JOB_SEARCH_OPTIONS,
  PRIMARY_GOAL_OPTIONS,
} from "@/components/public/WaitlistSignupForm";
import {
  WAITLIST_CAREER_STAGES,
  WAITLIST_JOB_SEARCH_STATUSES,
  WAITLIST_PRIMARY_GOALS,
} from "@/lib/validation/waitlist";
import { describe, expect, it } from "vitest";

describe("waitlist form options", () => {
  it("covers every job-search status the API accepts", () => {
    expect(JOB_SEARCH_OPTIONS.map((o) => o.value)).toEqual([
      ...WAITLIST_JOB_SEARCH_STATUSES,
    ]);
  });

  it("covers every primary goal the API accepts, including Network with recruiters", () => {
    expect(PRIMARY_GOAL_OPTIONS.map((o) => o.value)).toEqual([
      ...WAITLIST_PRIMARY_GOALS,
    ]);
    expect(PRIMARY_GOAL_OPTIONS.map((o) => o.value)).toContain(
      "Network with recruiters",
    );
  });

  it("covers every career stage the API accepts", () => {
    expect(CAREER_STAGE_OPTIONS.map((o) => o.value)).toEqual([
      ...WAITLIST_CAREER_STAGES,
    ]);
  });
});
