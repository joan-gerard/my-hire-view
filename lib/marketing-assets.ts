/**
 * Public URLs for marketing videos stored on R2 (same bucket as CVs,
 * under the `marketing/` prefix — never under `cvs/`).
 *
 * Stills stay in `public/` as compressed WebP so `next/image` can optimize
 * them without a remote loader. Videos are too large to ship in each deploy.
 *
 * Set `NEXT_PUBLIC_MARKETING_ASSETS_BASE_URL` to the public origin plus
 * `/marketing` (no trailing slash), e.g. `https://pub-xxxxx.r2.dev/marketing`.
 * When unset, URLs fall back to `/{filename}` so local `public/*.mp4` still work.
 */

export const MARKETING_OBJECT_PREFIX = "marketing";

export function getMarketingAssetsBaseUrl(): string | undefined {
  const explicit = process.env.NEXT_PUBLIC_MARKETING_ASSETS_BASE_URL?.trim().replace(
    /\/$/,
    "",
  );
  return explicit || undefined;
}

/** Absolute R2 URL, or `/{filename}` when no public base is configured. */
export function marketingAssetUrl(filename: string): string {
  const name = filename.replace(/^\//, "");
  const base = getMarketingAssetsBaseUrl();
  if (!base) return `/${name}`;
  return `${base}/${name}`;
}
