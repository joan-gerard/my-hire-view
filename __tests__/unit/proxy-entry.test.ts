import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

/** Repo root from `__tests__/unit/`. */
const root = join(__dirname, "../..");

describe("Next.js proxy entry (F26-060)", () => {
  it("ships root proxy.ts and no deprecated root middleware.ts", () => {
    expect(existsSync(join(root, "proxy.ts"))).toBe(true);
    expect(existsSync(join(root, "middleware.ts"))).toBe(false);
    expect(existsSync(join(root, "src/middleware.ts"))).toBe(false);
    expect(existsSync(join(root, "src/proxy.ts"))).toBe(false);
  });

  it("exports a named proxy function (not middleware)", () => {
    const src = readFileSync(join(root, "proxy.ts"), "utf8");
    expect(src).toMatch(/export async function proxy\s*\(/);
    expect(src).not.toMatch(/export\s+(async\s+)?function\s+middleware\s*\(/);
    expect(src).toMatch(/from\s+['"]\.\/lib\/supabase\/middleware['"]/);
  });
});
