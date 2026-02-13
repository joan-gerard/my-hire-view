import { del } from '@vercel/blob';

/**
 * Vercel Blob public URLs use the host public.blob.vercel-storage.com
 * (with an optional store subdomain prefix).
 */
const VERCEL_BLOB_HOST_SUFFIX = 'public.blob.vercel-storage.com';

/**
 * Returns true if the URL is a Vercel Blob URL we own (safe to pass to del()).
 */
export function isVercelBlobUrl(url: string | null | undefined): boolean {
  if (!url || typeof url !== 'string' || !url.startsWith('https://')) {
    return false;
  }
  try {
    const host = new URL(url).hostname;
    return host.endsWith(VERCEL_BLOB_HOST_SUFFIX);
  } catch {
    return false;
  }
}

/**
 * Deletes the blob at the given URL if it is a Vercel Blob URL.
 * Logs and swallows errors so callers can continue (e.g. DB delete still succeeds).
 */
export async function deleteBlobIfOurs(url: string | null | undefined): Promise<void> {
  if (!isVercelBlobUrl(url)) return;
  try {
    await del(url!);
  } catch (err) {
    console.error('Failed to delete blob:', url, err);
  }
}

/**
 * Returns true if the URL is a Vercel Blob URL and a HEAD request returns 2xx.
 * Returns false for non-blob URLs or on failure (e.g. 404, network error).
 */
export async function checkBlobExists(url: string | null | undefined): Promise<boolean> {
  if (!isVercelBlobUrl(url)) return false;
  try {
    const res = await fetch(url!, { method: 'HEAD' });
    return res.ok;
  } catch {
    return false;
  }
}
