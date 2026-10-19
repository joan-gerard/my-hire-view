import { afterEach, describe, expect, it, vi } from "vitest";
import { uploadProfilePictureFile } from "@/lib/utils/upload-profile-picture-client";

describe("uploadProfilePictureFile", () => {
  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("returns a friendly network error when fetch throws", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockRejectedValue(new TypeError("Failed to fetch")),
    );
    const file = new File(["x"], "a.jpg", { type: "image/jpeg" });
    const result = await uploadProfilePictureFile(file);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toMatch(/Network error/i);
    }
  });

  it("maps non-OK responses through messageForUploadFailure", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ error: "Too many requests." }), {
          status: 429,
        }),
      ),
    );
    const file = new File(["x"], "a.jpg", { type: "image/jpeg" });
    const result = await uploadProfilePictureFile(file);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toBe(
        "Too many uploads. Please wait a moment and try again.",
      );
    }
  });

  it("returns url (and optional warning) on success", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({
            url: "https://example.com/avatar.jpg",
            warning: "Old files could not be cleaned up.",
          }),
          { status: 200 },
        ),
      ),
    );
    const file = new File(["x"], "a.jpg", { type: "image/jpeg" });
    const result = await uploadProfilePictureFile(file);
    expect(result).toEqual({
      ok: true,
      url: "https://example.com/avatar.jpg",
      warning: "Old files could not be cleaned up.",
    });
  });

  it("treats JSON null body as empty object instead of throwing", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response("null", {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }),
      ),
    );
    const file = new File(["x"], "a.jpg", { type: "image/jpeg" });
    const result = await uploadProfilePictureFile(file);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toMatch(/couldn’t upload your picture/i);
    }
  });

  it("returns a timeout message when fetch aborts", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockImplementation((_url, init: { signal?: AbortSignal }) => {
        return new Promise((_resolve, reject) => {
          init.signal?.addEventListener("abort", () => {
            reject(new DOMException("Aborted", "AbortError"));
          });
        });
      }),
    );
    vi.useFakeTimers();
    const file = new File(["x"], "a.jpg", { type: "image/jpeg" });
    const pending = uploadProfilePictureFile(file);
    await vi.advanceTimersByTimeAsync(30_000);
    const result = await pending;
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toMatch(/took too long/i);
    }
  });
});
