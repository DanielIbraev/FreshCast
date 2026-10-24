import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";

export default defineConfig({
  resolve: { alias: { "@": fileURLToPath(new URL("./", import.meta.url)) } },
  // The benchmark tests replay 12 weeks x several kitchens; shared CI runners
  // are ~3x slower than a laptop, so the 5s default is too tight.
  test: { include: ["tests/**/*.test.ts"], environment: "node", testTimeout: 60_000, hookTimeout: 60_000 },
});
