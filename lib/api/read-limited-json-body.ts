/**
 * Read a JSON request body with a hard size cap measured in raw bytes.
 * Reads the stream incrementally and cancels as soon as `maxBytes` is exceeded,
 * so chunked oversized bodies cannot fully buffer into memory first.
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
      await cancelBody(request.body);
      return { ok: false, error: "too_large" };
    }
  }

  const stream = request.body;
  if (!stream) {
    return parseJsonBytes(new Uint8Array());
  }

  const reader = stream.getReader();
  const chunks: Uint8Array[] = [];
  let totalBytes = 0;

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      if (!value?.byteLength) continue;

      totalBytes += value.byteLength;
      if (totalBytes > maxBytes) {
        await reader.cancel().catch(() => undefined);
        return { ok: false, error: "too_large" };
      }
      chunks.push(value);
    }
  } catch {
    await reader.cancel().catch(() => undefined);
    return { ok: false, error: "invalid_json" };
  }

  return parseJsonBytes(concatUint8Arrays(chunks, totalBytes));
}

async function cancelBody(
  body: ReadableStream<Uint8Array> | null,
): Promise<void> {
  if (!body) return;
  await body.cancel().catch(() => undefined);
}

function concatUint8Arrays(
  chunks: Uint8Array[],
  totalBytes: number,
): Uint8Array {
  if (chunks.length === 0) return new Uint8Array();
  if (chunks.length === 1) return chunks[0]!;

  const out = new Uint8Array(totalBytes);
  let offset = 0;
  for (const chunk of chunks) {
    out.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return out;
}

function parseJsonBytes(
  bytes: Uint8Array,
):
  | { ok: true; value: unknown }
  | { ok: false; error: "invalid_json" } {
  let text: string;
  try {
    text = new TextDecoder("utf-8", { fatal: false }).decode(bytes);
  } catch {
    return { ok: false, error: "invalid_json" };
  }

  try {
    return { ok: true, value: JSON.parse(text) as unknown };
  } catch {
    return { ok: false, error: "invalid_json" };
  }
}
