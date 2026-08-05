/**
 * True when an existing R2 object matches this request's size and PDF content type.
 * Used so an idempotency key is not reused for a different file body.
 */
export function existingObjectMatchesUpload(
  head: { ContentLength?: number; ContentType?: string },
  file: { size: number; type: string },
  expectedContentType = "application/pdf",
): boolean {
  if (head.ContentLength == null || head.ContentLength !== file.size) {
    return false;
  }
  const existingType = (head.ContentType ?? "")
    .split(";")[0]
    ?.trim()
    .toLowerCase();
  const requestType = (file.type || expectedContentType)
    .split(";")[0]
    ?.trim()
    .toLowerCase();
  return (
    existingType === expectedContentType && requestType === expectedContentType
  );
}
