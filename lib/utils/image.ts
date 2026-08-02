/**
 * Allowed profile-picture MIME types (must stay in sync with upload route + Storage bucket).
 */
export const ALLOWED_IMAGE_MIMES = [
  "image/jpeg",
  "image/png",
  "image/webp",
] as const;

export type AllowedImageMime = (typeof ALLOWED_IMAGE_MIMES)[number];

function asUint8Array(
  bytes: ArrayBufferLike | Uint8Array | Buffer,
): Uint8Array {
  return ArrayBuffer.isView(bytes)
    ? new Uint8Array(bytes.buffer, bytes.byteOffset, bytes.byteLength)
    : new Uint8Array(bytes);
}

function isPng(view: Uint8Array): boolean {
  // Signature + IHDR chunk type at bytes 12–15
  if (view.byteLength < 16) return false;
  return (
    view[0] === 0x89 &&
    view[1] === 0x50 &&
    view[2] === 0x4e &&
    view[3] === 0x47 &&
    view[4] === 0x0d &&
    view[5] === 0x0a &&
    view[6] === 0x1a &&
    view[7] === 0x0a &&
    view[12] === 0x49 && // I
    view[13] === 0x48 && // H
    view[14] === 0x44 && // D
    view[15] === 0x52 // R
  );
}

function isJpeg(view: Uint8Array): boolean {
  // SOI + start of a marker segment (FF xx)
  if (view.byteLength < 3) return false;
  return view[0] === 0xff && view[1] === 0xd8 && view[2] === 0xff;
}

function isWebp(view: Uint8Array): boolean {
  // RIFF....WEBP + a VP8 / VP8L / VP8X chunk fourCC
  if (view.byteLength < 16) return false;
  const riff =
    view[0] === 0x52 &&
    view[1] === 0x49 &&
    view[2] === 0x46 &&
    view[3] === 0x46;
  const webp =
    view[8] === 0x57 &&
    view[9] === 0x45 &&
    view[10] === 0x42 &&
    view[11] === 0x50;
  if (!riff || !webp) return false;

  const c0 = view[12];
  const c1 = view[13];
  const c2 = view[14];
  const c3 = view[15];
  const isVp8 =
    c0 === 0x56 && c1 === 0x50 && c2 === 0x38 && c3 === 0x20; // "VP8 "
  const isVp8L =
    c0 === 0x56 && c1 === 0x50 && c2 === 0x38 && c3 === 0x4c; // "VP8L"
  const isVp8X =
    c0 === 0x56 && c1 === 0x50 && c2 === 0x38 && c3 === 0x58; // "VP8X"
  return isVp8 || isVp8L || isVp8X;
}

/**
 * Detects JPEG / PNG / WebP from magic bytes and light header checks
 * (PNG IHDR, WebP VP8*). Returns null when the payload is not a supported image.
 * Use after MIME checks so disguised non-image uploads are rejected.
 */
export function detectAllowedImageMime(
  bytes: ArrayBufferLike | Uint8Array | Buffer,
): AllowedImageMime | null {
  const view = asUint8Array(bytes);
  if (isJpeg(view)) return "image/jpeg";
  if (isPng(view)) return "image/png";
  if (isWebp(view)) return "image/webp";
  return null;
}

export function extensionForImageMime(mime: AllowedImageMime): string {
  if (mime === "image/png") return "png";
  if (mime === "image/webp") return "webp";
  return "jpg";
}
