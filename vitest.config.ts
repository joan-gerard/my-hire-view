import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    // Resolve @/* path aliases from tsconfig.json natively (no plugin needed)
    alias: { "@": new URL(".", import.meta.url).pathname },
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
