import { generateEntrypoints } from "../../scripts/entrypoints.mjs";
import path from "path";
import { fileURLToPath } from "url";

const packageDir = path.dirname(fileURLToPath(import.meta.url));
generateEntrypoints({
  packageDir,
  formats: ["esm"],
  convertJsToEsm: false,
});
