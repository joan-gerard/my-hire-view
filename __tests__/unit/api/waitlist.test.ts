/**
 * Tests for POST /api/waitlist — F3-064 validation + F3-039 honeypot.
 */
import { WAITLIST_HONEYPOT_FIELD } from "@/lib/validation/waitlist";
import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { mockCheckRateLimit, mockCreateAdminClient, mockInsert } = vi.hoisted(
  () => {
    const mockInsert = vi.fn();
    return {
      mockCheckRateLimit: vi.fn(),
      mockCreateAdminClient: vi.fn(),
      mockInsert,
    };
  },
);

vi.mock("@/lib/rate-limit", () => ({
  checkRateLimit: mockCheckRateLimit,
  rateLimit429: vi.fn().mockReturnValue(
    new Response(JSON.stringify({ error: "Too many requests" }), {
      status: 429,
    }),
  ),
}));

vi.mock("@/lib/supabase/admin", () => ({
  createAdminClient: mockCreateAdminClient,
}));

import { POST } from "@/app/api/waitlist/route";

const VALID_BODY = {
  email: "jane@example.com",
  first_name: "Jane",
  job_search_status: "Actively searching",
};

function makeRequest(body: object | string): NextRequest {
  return new NextRequest("http://localhost/api/waitlist", {
    method: "POST",
    body: typeof body === "string" ? body : JSON.stringify(body),
    headers: { "Content-Type": "application/json" },
  });
}

beforeEach(() => {
  vi.clearAllMocks();
  mockCheckRateLimit.mockResolvedValue({
    success: true,
    remaining: 4,
    resetAt: Date.now() + 60_000,
  });
  mockInsert.mockResolvedValue({ error: null });
  mockCreateAdminClient.mockReturnValue({
    from: vi.fn().mockReturnValue({ insert: mockInsert }),
  });
});

describe("POST /api/waitlist", () => {
  it("inserts a valid signup and returns 200", async () => {
    const response = await POST(makeRequest(VALID_BODY));
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ success: true });
    expect(mockInsert).toHaveBeenCalledWith({
      email: "jane@example.com",
      first_name: "Jane",
      job_search_status: "Actively searching",
      primary_goal: null,
      career_stage: null,
    });
  });

  it("lowercases email on insert", async () => {
    const response = await POST(
      makeRequest({ ...VALID_BODY, email: "Jane@Example.COM" }),
    );
    expect(response.status).toBe(200);
    expect(mockInsert).toHaveBeenCalledWith(
      expect.objectContaining({ email: "jane@example.com" }),
    );
  });

  it("returns 400 for invalid email (F3-064)", async () => {
    const response = await POST(
      makeRequest({ ...VALID_BODY, email: "not-an-email" }),
    );
    expect(response.status).toBe(400);
    const json = await response.json();
    expect(json.error).toMatch(/email/i);
    expect(mockInsert).not.toHaveBeenCalled();
  });

  it("returns 400 when first_name exceeds max length (F3-064)", async () => {
    const response = await POST(
      makeRequest({ ...VALID_BODY, first_name: "A".repeat(101) }),
    );
    expect(response.status).toBe(400);
    expect(mockInsert).not.toHaveBeenCalled();
  });

  it("returns 400 for malformed JSON", async () => {
    const response = await POST(makeRequest("{not-json"));
    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({ error: "Invalid JSON body" });
    expect(mockInsert).not.toHaveBeenCalled();
  });

  it("returns 413 when the body is too large", async () => {
    const response = await POST(
      new NextRequest("http://localhost/api/waitlist", {
        method: "POST",
        body: "x".repeat(5_000),
        headers: { "Content-Type": "application/json" },
      }),
    );
    expect(response.status).toBe(413);
    expect(mockInsert).not.toHaveBeenCalled();
  });

  it("returns silent 200 without insert when honeypot is filled (F3-039)", async () => {
    const response = await POST(
      makeRequest({
        ...VALID_BODY,
        [WAITLIST_HONEYPOT_FIELD]: "http://bot.example",
      }),
    );
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ success: true });
    expect(mockInsert).not.toHaveBeenCalled();
    expect(mockCreateAdminClient).not.toHaveBeenCalled();
  });

  it("returns silent 200 for filled honeypot even when other fields are invalid", async () => {
    const response = await POST(
      makeRequest({
        email: "not-an-email",
        first_name: "",
        [WAITLIST_HONEYPOT_FIELD]: "http://bot.example",
      }),
    );
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ success: true });
    expect(mockInsert).not.toHaveBeenCalled();
  });

  it("returns 409 on duplicate email", async () => {
    mockInsert.mockResolvedValue({ error: { code: "23505" } });
    const response = await POST(makeRequest(VALID_BODY));
    expect(response.status).toBe(409);
    const json = await response.json();
    expect(json.error).toMatch(/already/i);
  });

  it("returns 429 when rate limited", async () => {
    mockCheckRateLimit.mockResolvedValue({
      success: false,
      remaining: 0,
      resetAt: Date.now() + 60_000,
    });
    const response = await POST(makeRequest(VALID_BODY));
    expect(response.status).toBe(429);
    expect(mockInsert).not.toHaveBeenCalled();
  });
});
