/**
 * Returns true when `bytes` start with the PDF file header (`%PDF`).
 * Use after MIME checks so disguised non-PDF uploads are rejected.
 */
export function hasPdfMagicBytes(
  bytes: ArrayBuffer | Uint8Array | Buffer,
): boolean {
  const view = bytes instanceof ArrayBuffer ? new Uint8Array(bytes) : bytes;
  if (view.byteLength < 4) return false;
  return (
    view[0] === 0x25 && // %
    view[1] === 0x50 && // P
    view[2] === 0x44 && // D
    view[3] === 0x46 // F
  );
}
