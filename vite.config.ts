import path from "path";
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import { viteSingleFile } from "vite-plugin-singlefile";

import { hdrBase64Plugin } from "./vite/hdrBase64Plugin";

/** Имя репозитория на GitHub — для project site: https://c0620.github.io/figma-3D_mini-editor/ */
const GITHUB_PAGES_REPO = "figma-3D_mini-editor";

// https://vite.dev/config/
export default defineConfig({
  /** `./` — Figma-плагин; `/repo/` — GitHub Pages (GITHUB_PAGES=true). */
  base:
    process.env.GITHUB_PAGES === "true"
      ? `/${GITHUB_PAGES_REPO}/`
      : "./",
  assetsInclude: ["**/*.hdr"],
  build: {
    assetsInlineLimit: 100000000,
    chunkSizeWarningLimit: 100000000,
    cssCodeSplit: false,
    outDir: "dist",
    rollupOptions: {
      output: {
        inlineDynamicImports: true,
      },
    },
    target: "esnext",
  },
  plugins: [hdrBase64Plugin(), react(), viteSingleFile()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  test: {
    include: ["src/**/*.test.ts"],
    environment: "happy-dom",
  },
});
