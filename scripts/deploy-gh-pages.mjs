import { execSync } from "node:child_process";
import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const dist = join(root, "dist");
const env = { ...process.env, GITHUB_PAGES: "true" };
const buildOnly = process.argv.includes("--build-only");

function run(command) {
  execSync(command, { cwd: root, stdio: "inherit", env });
}

console.log("Building for GitHub Pages...");
run("node scripts/check-hdri-assets.mjs");
run("tsc -b");
run("vite build --emptyOutDir=true");

writeFileSync(join(dist, ".nojekyll"), "");

if (buildOnly) {
  console.log("Pages build ready in dist/");
  process.exit(0);
}

console.log("Deploying dist/ to gh-pages branch...");
run("npx gh-pages -d dist");
