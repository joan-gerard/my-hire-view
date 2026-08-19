/**
 * Base URL for the app (server or client). Prefer NEXT_PUBLIC_SITE_URL in env.
 * In production on the server, NEXT_PUBLIC_SITE_URL is required so share links
 * and other canonical URL builders never fall back to localhost.
 */

const LOCALHOST_ALIASES = new Set([
  "localhost",
  "ip6-localhost",
  "ip6-loopback",
]);

function normalizeHostname(hostname: string): string {
  return hostname.replace(/^\[|\]$/g, "").replace(/\.$/, "").toLowerCase();
}

function isIpv4Loopback(host: string): boolean {
  const parts = host.split(".");
  if (parts.length !== 4) return false;
  for (const part of parts) {
    if (!/^\d{1,3}$/.test(part)) return false;
    const octet = Number.parseInt(part, 10);
    if (octet < 0 || octet > 255) return false;
  }
  return Number.parseInt(parts[0], 10) === 127;
}

function isIpv4MappedLoopback(host: string): boolean {
  const match = host.match(/^::ffff:(.+)$/i);
  if (!match) return false;

  const tail = match[1];
  if (tail.includes(".")) {
    return isIpv4Loopback(tail);
  }

  const groups = tail.split(":").map((part) => Number.parseInt(part, 16));
  if (groups.some((group) => Number.isNaN(group))) return false;

  let value: number;
  if (groups.length === 1) {
    value = groups[0];
  } else if (groups.length === 2) {
    value = (groups[0] << 16) | groups[1];
  } else {
    return false;
  }

  return (value >>> 24) === 127;
}

function isLoopbackHostname(hostname: string): boolean {
  const host = normalizeHostname(hostname);
  if (LOCALHOST_ALIASES.has(host)) return true;
  if (host === "0.0.0.0" || host === "::1") return true;
  if (isIpv4Loopback(host)) return true;
  if (isIpv6Loopback(host)) return true;
  return false;
}

function isIpv6Loopback(host: string): boolean {
  return isIpv4MappedLoopback(host);
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
