/**
 * Allow only safe same-origin relative paths for post-auth redirects.
 * Rejects protocol-relative URLs, backslash authority tricks (e.g. `/\evil.com`),
 * and any path containing `\`. Invalid input falls back to `/admin`.
 */
export function safeNextPath(next: string | null): string {
  if (
    !next ||
    !next.startsWith("/") ||
    next.startsWith("//") ||
    next.includes("\\") ||
    (next.length >= 2 && (next[1] === "/" || next[1] === "\\"))
  ) {
    return "/admin";
  }
  return next;
}
