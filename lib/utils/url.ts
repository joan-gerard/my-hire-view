/**
 * Base URL for the app (server or client). Prefer NEXT_PUBLIC_SITE_URL in env.
 * In production on the server, NEXT_PUBLIC_SITE_URL is required so share links
 * and other canonical URL builders never fall back to localhost.
 */
function getBaseUrl(): string {
  if (typeof window !== "undefined") {
    return window.location.origin;
  }

  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (configured) {
    return configured.replace(/\/$/, "");
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
