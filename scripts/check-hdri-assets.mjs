import { existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const dir = join(root, "src", "assets", "hdri");
const required = [
  "studio_small_03_1k.hdr",
  "venice_sunset_1k.hdr",
  "empty_warehouse_01_1k.hdr",
];

for (const file of required) {
  const path = join(dir, file);
  if (!existsSync(path)) {
    console.error(`Missing HDR asset: ${path}`);
    process.exit(1);
  }
}

console.log("HDR assets OK:", required.join(", "));
