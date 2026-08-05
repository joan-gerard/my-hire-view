/**
 * Allow only safe same-origin relative paths for post-auth redirects.
 * Rejects protocol-relative URLs, backslash authority tricks (e.g. `/\evil.com`),
 * any path containing `\`, and ASCII control characters (CR/LF/tab/NUL, etc.)
 * that URL parsers may strip — which can turn e.g. `/\tevil.com` into `/evil.com`.
 * Invalid input falls back to `/admin`.
 */
export function safeNextPath(next: string | null): string {
  if (
    !next ||
    !next.startsWith("/") ||
    next.startsWith("//") ||
    next.includes("\\") ||
    (next.length >= 2 && (next[1] === "/" || next[1] === "\\")) ||
    /[\u0000-\u001f\u007f]/.test(next)
  ) {
    return "/admin";
  }
  return next;
}
