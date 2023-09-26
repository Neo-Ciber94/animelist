import { generateEntrypoints } from "../../scripts/entrypoints.module.mjs";
import path from "path";
import { fileURLToPath } from "url";

const packageDir = path.dirname(fileURLToPath(import.meta.url));
generateEntrypoints({ packageDir, format: 'esm' })