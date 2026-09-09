import { describe, expect, it, vi } from "vitest";
import { readLimitedJsonBody } from "@/lib/api/read-limited-json-body";

function requestFromStream(
  stream: ReadableStream<Uint8Array>,
  headers?: HeadersInit,
): Request {
  return new Request("http://localhost/api", {
    method: "POST",
    body: stream,
    // Required by undici/Fetch when sending a stream body.
    duplex: "half",
    headers: { "Content-Type": "application/json", ...headers },
  } as RequestInit);
}

function chunkedStream(
  chunks: Uint8Array[],
  onRead?: (index: number) => void,
): ReadableStream<Uint8Array> {
  let index = 0;
  return new ReadableStream({
    pull(controller) {
      if (index >= chunks.length) {
        controller.close();
        return;
      }
      onRead?.(index);
      controller.enqueue(chunks[index]!);
      index += 1;
    },
  });
}

describe("readLimitedJsonBody", () => {
  it("parses a small JSON body", async () => {
    const request = new Request("http://localhost/api", {
      method: "POST",
      body: JSON.stringify({ ok: true }),
      headers: { "Content-Type": "application/json" },
    });
    const result = await readLimitedJsonBody(request, 1024);
    expect(result).toEqual({ ok: true, value: { ok: true } });
  });

  it("rejects when Content-Length exceeds the cap without fully buffering", async () => {
    const cancel = vi.fn(async () => undefined);
    const body = {
      cancel,
      getReader() {
        throw new Error("should not read body when Content-Length is too large");
      },
    } as unknown as ReadableStream<Uint8Array>;

    const request = {
      headers: new Headers({ "content-length": "99999" }),
      body,
    } as unknown as Request;

    const result = await readLimitedJsonBody(request, 100);
    expect(result).toEqual({ ok: false, error: "too_large" });
    expect(cancel).toHaveBeenCalled();
  });

  it("rejects when streamed body bytes exceed the cap and cancels early", async () => {
    const encoder = new TextEncoder();
    const reads: number[] = [];
    const stream = chunkedStream(
      [encoder.encode("x".repeat(80)), encoder.encode("y".repeat(80)), encoder.encode("z".repeat(80))],
      (index) => reads.push(index),
    );

    const result = await readLimitedJsonBody(requestFromStream(stream), 100);
    expect(result).toEqual({ ok: false, error: "too_large" });
    // First chunk 80 bytes OK; second chunk pushes total to 160 > 100 → cancel.
    // Third chunk must not be read.
    expect(reads).toEqual([0, 1]);
  });

  it("counts raw UTF-8 bytes, not UTF-16 string length", async () => {
    // "é" is 1 UTF-16 code unit but 2 UTF-8 bytes.
    // 80 × é → 160 UTF-8 bytes inside the JSON string value alone.
    const body = JSON.stringify({ v: "é".repeat(80) });
    const utf8Bytes = new TextEncoder().encode(body).byteLength;
    expect(body.length).toBeLessThan(utf8Bytes);
    expect(utf8Bytes).toBeGreaterThan(100);

    const request = new Request("http://localhost/api", {
      method: "POST",
      body,
      headers: { "Content-Type": "application/json" },
    });
    const result = await readLimitedJsonBody(request, 100);
    expect(result).toEqual({ ok: false, error: "too_large" });
  });

  it("rejects invalid JSON", async () => {
    const request = new Request("http://localhost/api", {
      method: "POST",
      body: "{not-json",
      headers: { "Content-Type": "application/json" },
    });
    const result = await readLimitedJsonBody(request, 1024);
    expect(result).toEqual({ ok: false, error: "invalid_json" });
  });

  it("returns invalid_json when the body stream is already locked", async () => {
    const request = new Request("http://localhost/api", {
      method: "POST",
      body: JSON.stringify({ ok: true }),
      headers: { "Content-Type": "application/json" },
    });
    // Lock the body after Request construction (e.g. prior consumer).
    request.body!.getReader();

    const result = await readLimitedJsonBody(request, 1024);
    expect(result).toEqual({ ok: false, error: "invalid_json" });
  });
});
