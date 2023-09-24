import { type RollupOptions } from 'rollup';
import path from 'path';
import { fileURLToPath } from 'url';
import { defineRollupConfig } from '../../scripts/getRollupConfig';

const dirname = path.dirname(fileURLToPath(import.meta.url));

export default function rollup(): RollupOptions[] {
    return defineRollupConfig({
        inputs: [path.join(dirname, "src/index.ts")],
        packageDir: dirname,
    })
}
