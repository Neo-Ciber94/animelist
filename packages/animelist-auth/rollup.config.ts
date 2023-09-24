import { type RollupOptions } from 'rollup';
import path from 'path';
import { fileURLToPath } from 'url';
import { defineRollupConfig } from '../../scripts/getRollupConfig';

const dirname = path.dirname(fileURLToPath(import.meta.url));

const files = [
    "src/index.ts",
    "src/server/server.ts",
    "src/server/index.ts",
    "src/server/handlers/fetchHandler.ts",
    "src/server/handlers/types.ts",
    "src/common/index.ts",
    "src/common/getApiUrl.ts",
    "src/common/httpError.ts",
    "src/common/types.ts",
    "src/common/utils.ts",
    "src/client/index.ts",
]

export default function rollup(): RollupOptions[] {
    const inputs = files.map(file => path.resolve(dirname, file));

    return defineRollupConfig({
        inputs,
        packageDir: dirname,
    })
}
