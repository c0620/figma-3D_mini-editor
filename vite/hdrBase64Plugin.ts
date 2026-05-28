import { readFile } from "node:fs/promises";

import type { Plugin } from "vite";

const QUERY = "?base64";

/** Встраивает .hdr в бандл как base64-строку (надёжно для Figma UI). */
export function hdrBase64Plugin(): Plugin {
  return {
    name: "hdr-base64",
    enforce: "pre",
    async load(id) {
      if (!id.endsWith(QUERY)) return null;

      const filePath = id.slice(0, -QUERY.length);
      const buffer = await readFile(filePath);
      const base64 = buffer.toString("base64");

      return {
        code: `export default ${JSON.stringify(base64)};`,
        map: null,
      };
    },
  };
}
