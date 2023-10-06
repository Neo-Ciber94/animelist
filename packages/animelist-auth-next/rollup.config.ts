import path from "path";
import { fileURLToPath } from "url";
import { rollupConfig } from "../../scripts/rollupConfig";

const packageDir = path.dirname(fileURLToPath(import.meta.url));

export default function rollup() {
  return rollupConfig({
    input: ["src/**/*.ts", "src/**/*.tsx"],
    packageDir,
  });
}
