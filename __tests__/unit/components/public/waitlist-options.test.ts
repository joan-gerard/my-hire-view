/**
 * Independent contract for waitlist enums. Form options are derived from the
 * same constants the Zod schema uses, so comparing those two to each other
 * cannot fail. These literals are the check: a form or schema change that
 * drops a value (e.g. Network with recruiters) must update this list too.
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

const EXPECTED_JOB_SEARCH_STATUSES = [
  "Actively searching",
  "Casually looking",
  "Career planning",
  "Other",
] as const;

const EXPECTED_PRIMARY_GOALS = [
  "Get more interviews",
  "Track my applications",
  "Stand out to recruiters",
  "Network with recruiters",
  "Other",
] as const;

const EXPECTED_CAREER_STAGES = [
  "Entry-level",
  "Junior (1–3 years)",
  "Mid-level (3–7 years)",
  "Senior (7+ years)",
  "Other",
] as const;

describe("waitlist form options", () => {
  it("keeps job-search radios and the API schema on the same enum list", () => {
    expect([...WAITLIST_JOB_SEARCH_STATUSES]).toEqual([
      ...EXPECTED_JOB_SEARCH_STATUSES,
    ]);
    expect(JOB_SEARCH_OPTIONS.map((o) => o.value)).toEqual([
      ...EXPECTED_JOB_SEARCH_STATUSES,
    ]);
  });

  it("keeps primary-goal radios and the API schema on the same enum list", () => {
    expect([...WAITLIST_PRIMARY_GOALS]).toEqual([...EXPECTED_PRIMARY_GOALS]);
    expect(PRIMARY_GOAL_OPTIONS.map((o) => o.value)).toEqual([
      ...EXPECTED_PRIMARY_GOALS,
    ]);
  });

  it("keeps career-stage radios and the API schema on the same enum list", () => {
    expect([...WAITLIST_CAREER_STAGES]).toEqual([...EXPECTED_CAREER_STAGES]);
    expect(CAREER_STAGE_OPTIONS.map((o) => o.value)).toEqual([
      ...EXPECTED_CAREER_STAGES,
    ]);
  });
});
