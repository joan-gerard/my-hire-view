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

  it.each([
    "https://localhost:3000",
    "http://localhost",
    "http://localhost.",
    "http://localhost:8080",
    "http://127.0.0.1:8080",
    "http://127.0.0.2:3000",
    "http://127.1.2.3:3000",
    "http://[::1]:3000",
    "http://[::ffff:127.0.0.1]:3000",
    "http://0.0.0.0:3000",
    "http://ip6-localhost:3000",
  ])("throws in production for loopback host %s", async (siteUrl) => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", siteUrl);

    const { getBaseUrl } = await loadUrlModule();
    expect(() => getBaseUrl()).toThrow(/must be a public production URL, not localhost/);
  });

  it("throws in production when NEXT_PUBLIC_SITE_URL uses a non-http(s) scheme", async () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "file:///etc/passwd");

    const { getBaseUrl } = await loadUrlModule();
    expect(() => getBaseUrl()).toThrow(/must use http or https in production/);
  });

  it("builds share links from the configured site URL on the server", async () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://myhireview.com");

    const { getApplicationUrl } = await loadUrlModule();
    expect(getApplicationUrl("k7x2m9ab", "acme-engineer")).toBe(
      "https://myhireview.com/view/k7x2m9ab/acme-engineer",
    );
  });

  it("allows production hostnames that resemble loopback IPs but are valid DNS names", async () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://127.0.0.1example");

    const { getBaseUrl } = await loadUrlModule();
    expect(getBaseUrl()).toBe("https://127.0.0.1example");
  });
});
