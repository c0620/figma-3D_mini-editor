import { defineConfig } from "vitest/config";
import { playwright } from "@vitest/browser-playwright";
import react from "@vitejs/plugin-react";

import svgr from "vite-plugin-svgr";
import path from "path";

export default defineConfig({
  plugins: [
    svgr({
      include: ["**/*.svg", "**/*.svg?*"],
      svgrOptions: {
        ref: true,
        svgo: false,
        titleProp: true,
        plugins: ["@svgr/plugin-svgo", "@svgr/plugin-jsx"],
        svgoConfig: {
          plugins: [
            {
              name: "decode-href-ids",
              fn: () => ({
                element: {
                  enter: (node) => {
                    for (const attr of ["href", "xlink:href"] as const) {
                      const value = node.attributes[attr];
                      if (value?.startsWith("#")) {
                        node.attributes[attr] =
                          `#${decodeURIComponent(value.slice(1))}`;
                      }
                    }
                  },
                },
              }),
            },
            {
              name: "preset-default",
              params: {
                overrides: {
                  removeViewBox: false,
                  cleanupIds: false,
                },
              },
            },
            { name: "prefixIds", params: { prefixClassNames: false } },
          ],
        },
      },
    }),
    react(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  css: {
    modules: {
      localsConvention: "camelCase",
    },
  },
  test: {
    include: [
      "tests/**/*.browser.test.{ts,tsx}",
      "tests/**/*.browser.spec.{ts,tsx}",
    ],
    setupFiles: ["./tests/setup.browser.ts"],
    browser: {
      enabled: true,
      provider: playwright(),
      // https://vitest.dev/config/browser/playwright
      instances: [{ browser: "chromium" }],
      viewport: {
        width: 1600,
        height: 900,
      },
    },
  },
});
