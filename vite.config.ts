import react from "@vitejs/plugin-react";
import path from "path";
import { defineConfig } from "vite";
import { viteSingleFile } from "vite-plugin-singlefile";
import svgr from "vite-plugin-svgr";

// https://vite.dev/config/
export default defineConfig({
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
  plugins: [
    svgr({
      svgrOptions: {
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
    viteSingleFile(),
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
});
