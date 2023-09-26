import { generateEntrypoints } from "../../scripts/entrypoints.js";
import path from "path";
import { fileURLToPath } from "url";

const packageDir = path.dirname(fileURLToPath(import.meta.url));
generateEntrypoints({ packageDir })