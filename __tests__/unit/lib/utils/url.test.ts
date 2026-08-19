import { describe, it, expect, vi, afterEach } from "vitest";

describe("getBaseUrl", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  async function loadUrlModule() {
    return import("@/lib/utils/url");
  }

  it("returns localhost in non-production when NEXT_PUBLIC_SITE_URL is unset", async () => {
    vi.stubEnv("NODE_ENV", "development");
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "");

    const { getBaseUrl } = await loadUrlModule();
    expect(getBaseUrl()).toBe("http://localhost:3000");
  });

  it("returns configured NEXT_PUBLIC_SITE_URL on the server", async () => {
    vi.stubEnv("NODE_ENV", "development");
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://myhireview.com/");

    const { getBaseUrl } = await loadUrlModule();
    expect(getBaseUrl()).toBe("https://myhireview.com");
  });

  it("throws in production on the server when NEXT_PUBLIC_SITE_URL is unset", async () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "");

    const { getBaseUrl } = await loadUrlModule();
    expect(() => getBaseUrl()).toThrow(/NEXT_PUBLIC_SITE_URL must be set in production/);
  });

  it("throws in production when NEXT_PUBLIC_SITE_URL is localhost", async () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "http://localhost:3000");

    const { getBaseUrl } = await loadUrlModule();
    expect(() => getBaseUrl()).toThrow(/must be a public production URL, not localhost/);
  });

  it("builds share links from the configured site URL on the server", async () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://myhireview.com");

    const { getApplicationUrl } = await loadUrlModule();
    expect(getApplicationUrl("k7x2m9ab", "acme-engineer")).toBe(
      "https://myhireview.com/view/k7x2m9ab/acme-engineer",
    );
  });
});
