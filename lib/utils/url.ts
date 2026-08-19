/**
 * Base URL for the app (server or client). Prefer NEXT_PUBLIC_SITE_URL in env.
 * In production on the server, NEXT_PUBLIC_SITE_URL is required so share links
 * and other canonical URL builders never fall back to localhost.
 */

function isLoopbackHostname(hostname: string): boolean {
  const host = hostname.replace(/^\[|\]$/g, "").toLowerCase();
  return (
    host === "localhost" ||
    host === "127.0.0.1" ||
    host === "::1" ||
    host === "0.0.0.0"
  );
}

function assertProductionSiteUrl(url: URL): void {
  if (url.protocol !== "http:" && url.protocol !== "https:") {
    throw new Error(
      "NEXT_PUBLIC_SITE_URL must use http or https in production.",
    );
  }
  if (isLoopbackHostname(url.hostname)) {
    throw new Error(
      "NEXT_PUBLIC_SITE_URL must be a public production URL, not localhost.",
    );
  }
}

function getBaseUrl(): string {
  if (typeof window !== "undefined") {
    return window.location.origin;
  }

  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (configured) {
    const base = configured.replace(/\/$/, "");
    if (process.env.NODE_ENV === "production") {
      let parsed: URL;
      try {
        parsed = new URL(base);
      } catch {
        throw new Error(
          "NEXT_PUBLIC_SITE_URL must be a valid absolute URL in production.",
        );
      }
      assertProductionSiteUrl(parsed);
    }
    return base;
  }

  if (process.env.NODE_ENV === "production") {
    throw new Error(
      "NEXT_PUBLIC_SITE_URL must be set in production. Share links and server URL helpers require a canonical site URL.",
    );
  }

  return "http://localhost:3000";
}

/**
 * Full URL for a public application view. Use for share links and display.
 */
export function getApplicationUrl(publicId: string, slug: string): string {
  return `${getBaseUrl()}/view/${publicId}/${slug}`;
}

export { getBaseUrl };
