import { esbuildProject } from "../../scripts/esbuildProject.mjs";
import path from "path";
import { fileURLToPath } from "url";

const packageDir = path.dirname(fileURLToPath(import.meta.url));

await esbuildProject({
  inputs: ["src/**/*.ts"],
  exclude: ["**/*.test.ts"],
  formats: ["esm"],
  outExtensions: {}, // do not overwrite .mjs extensions
  packageDir,
});
