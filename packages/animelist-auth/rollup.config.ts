import path from "path";
import { fileURLToPath } from "url";
import { rollupConfig } from "../../scripts/rollupConfig";

const packageDir = path.dirname(fileURLToPath(import.meta.url));

export default function rollup() {
  return rollupConfig({
    input: ["src/**/*.ts"],
    exclude: ["**/*.test.ts"],
    packageDir,
  });
}
