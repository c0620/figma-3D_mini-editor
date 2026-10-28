import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";
import path from "path";

const root = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(root, "./src"),
    },
  },
  test: {
    environment: "node",

    include: ["tests/**/*.test.{ts,tsx}", "tests/**/*.spec.{ts,tsx}"],
    exclude: [
      "tests/**/*.browser.test.{ts,tsx}",
      "tests/**/*.browser.spec.{ts,tsx}",
    ],

    restoreMocks: true,
    unstubGlobals: true,
  },
});
