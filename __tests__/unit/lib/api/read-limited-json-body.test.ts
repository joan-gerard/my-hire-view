import { describe, expect, it } from "vitest";
import { readLimitedJsonBody } from "@/lib/api/read-limited-json-body";

describe("readLimitedJsonBody", () => {
  it("parses a small JSON body", async () => {
    const request = new Request("http://localhost/api", {
      method: "POST",
      body: JSON.stringify({ ok: true }),
      headers: { "Content-Type": "application/json" },
    });
    const result = await readLimitedJsonBody(request, 1024);
    expect(result).toEqual({ ok: true, value: { ok: true } });
  });

  it("rejects when Content-Length exceeds the cap", async () => {
    const request = new Request("http://localhost/api", {
      method: "POST",
      body: "{}",
      headers: {
        "Content-Type": "application/json",
        "Content-Length": "99999",
      },
    });
    const result = await readLimitedJsonBody(request, 100);
    expect(result).toEqual({ ok: false, error: "too_large" });
  });

  it("rejects when body text exceeds the cap", async () => {
    const request = new Request("http://localhost/api", {
      method: "POST",
      body: "x".repeat(200),
      headers: { "Content-Type": "application/json" },
    });
    const result = await readLimitedJsonBody(request, 100);
    expect(result).toEqual({ ok: false, error: "too_large" });
  });

  it("rejects invalid JSON", async () => {
    const request = new Request("http://localhost/api", {
      method: "POST",
      body: "{not-json",
      headers: { "Content-Type": "application/json" },
    });
    const result = await readLimitedJsonBody(request, 1024);
    expect(result).toEqual({ ok: false, error: "invalid_json" });
  });
});
