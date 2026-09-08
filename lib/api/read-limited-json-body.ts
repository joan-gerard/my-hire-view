/**
 * Read a JSON request body with a soft size cap.
 * Uses Content-Length when present, then rejects oversized text before JSON.parse.
 */
export async function readLimitedJsonBody(
  request: Request,
  maxBytes: number,
): Promise<
  | { ok: true; value: unknown }
  | { ok: false; error: "too_large" | "invalid_json" }
> {
  const contentLength = request.headers.get("content-length");
  if (contentLength !== null) {
    const n = Number(contentLength);
    if (Number.isFinite(n) && n > maxBytes) {
      return { ok: false, error: "too_large" };
    }
  }

  let text: string;
  try {
    text = await request.text();
  } catch {
    return { ok: false, error: "invalid_json" };
  }

  // JSON bodies are typically ASCII; UTF-16 length ≈ byte length and bounds work.
  if (text.length > maxBytes) {
    return { ok: false, error: "too_large" };
  }

  try {
    return { ok: true, value: JSON.parse(text) as unknown };
  } catch {
    return { ok: false, error: "invalid_json" };
  }
}
