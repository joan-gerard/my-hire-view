/**
 * Base URL for the app (server or client). Prefer NEXT_PUBLIC_SITE_URL in env.
 */
function getBaseUrl(): string {
  if (typeof window !== 'undefined') {
    return window.location.origin;
  }
  return process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';
}

/**
 * Full URL for a public application view. Use for share links and display.
 */
export function getApplicationUrl(slug: string): string {
  return `${getBaseUrl()}/view/${slug}`;
}

export { getBaseUrl };
