import { describe, expect, it } from "vitest";
import { hasPdfMagicBytes } from "@/lib/utils/pdf";

describe("hasPdfMagicBytes", () => {
  it("accepts buffers starting with %PDF", () => {
    expect(hasPdfMagicBytes(Buffer.from("%PDF-1.7\n…"))).toBe(true);
    expect(hasPdfMagicBytes(new TextEncoder().encode("%PDF"))).toBe(true);
    expect(hasPdfMagicBytes(new TextEncoder().encode("%PDF").buffer)).toBe(
      true,
    );
  });

  it("rejects empty, short, or non-PDF payloads", () => {
    expect(hasPdfMagicBytes(Buffer.from(""))).toBe(false);
    expect(hasPdfMagicBytes(Buffer.from("%PD"))).toBe(false);
    expect(hasPdfMagicBytes(Buffer.from("PK\x03\x04zip"))).toBe(false);
    expect(hasPdfMagicBytes(Buffer.from(" %PDF"))).toBe(false);
  });
});
