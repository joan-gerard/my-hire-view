import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { handleApiError } from "@/lib/api/handle-api-error";

describe("handleApiError", () => {
  let errorSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    errorSpy.mockRestore();
  });

  it("logs the error with context and returns a generic 500 by default", async () => {
    const cause = new Error("db connection refused");
    const response = handleApiError("GET /api/example", cause);

    expect(errorSpy).toHaveBeenCalledWith("GET /api/example", cause);
    expect(response.status).toBe(500);
    await expect(response.json()).resolves.toEqual({
      error: "Internal server error",
    });
  });

  it("uses a custom client message and status when provided", async () => {
    const response = handleApiError("POST /api/example", "boom", {
      message: "Failed to track view",
      status: 503,
    });

    expect(response.status).toBe(503);
    await expect(response.json()).resolves.toEqual({
      error: "Failed to track view",
    });
  });
});
