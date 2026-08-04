import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    // Resolve @/* path aliases from tsconfig.json natively (no plugin needed).
    // fileURLToPath keeps the alias portable on Windows and for paths with spaces.
    alias: { "@": fileURLToPath(new URL(".", import.meta.url)) },
  },
  test: {
    environment: "node",
    globals: true,
    include: ["__tests__/**/*.test.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "lcov"],
      include: [
        "app/api/**/*.ts",
        "lib/utils/slug-generate.ts",
        "lib/utils/slug.ts",
        "lib/rate-limit.ts",
      ],
    },
  },
});
