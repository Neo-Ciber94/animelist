import * as esbuild from 'esbuild'
import path from 'path';
import * as glob from 'glob';

interface BuildConfig {
    inputs: [string, ...string[]],
    exclude?: string[],
    packageDir: string;
}

export async function esbuildProject({ packageDir, exclude, inputs }: BuildConfig) {
    const outdir = path.resolve(packageDir, "dist");
    const entryPoints: string[] = [];

    for (const input of inputs) {
        if (input.includes('*')) {
            const files = glob.sync(input, { ignore: exclude });
            entryPoints.push(...files);
        } else {
            entryPoints.push(input);
        }
    }

    // Build CommonJS
    await esbuild.build({
        entryPoints,
        logLevel: 'debug',
        outdir,
        format: 'cjs'
    })

    // Build ESM
    await esbuild.build({
        entryPoints,
        logLevel: 'debug',
        outdir,
        format: 'esm',
        outExtension: {
            ".js": ".mjs"
        }
    });
}
