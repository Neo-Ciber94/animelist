import { type RollupOptions } from 'rollup';
import del from 'rollup-plugin-delete';
import typescript from 'rollup-plugin-typescript2';
import { swc } from 'rollup-plugin-swc3';
import nodeResolve from '@rollup/plugin-node-resolve';
import externals from 'rollup-plugin-node-externals';
import path from 'path';

interface DefineRollupConfig {
    packageDir: string;
    outDir?: string;
    inputs: string[]
}

export function defineRollupConfig(config: DefineRollupConfig): RollupOptions[] {
    return [types(config), lib(config)]
}

function types({ inputs, packageDir, ...rest }: DefineRollupConfig): RollupOptions {
    const outDir = rest?.outDir || path.resolve(packageDir, "dist");

    return {
        input: inputs,
        output: {
            dir: outDir,
        },
        plugins: [
            del({ targets: outDir }),
            externals({
                packagePath: path.resolve(packageDir, 'package.json'),
                deps: true,
                devDeps: true,
                peerDeps: true,
            }),
            typescript({
                tsconfig: path.resolve(packageDir, 'tsconfig.json'),
                tsconfigOverride: { emitDeclarationOnly: true },
            }),
        ]
    }
}

function lib({ inputs, packageDir, ...rest }: DefineRollupConfig): RollupOptions {
    const outDir = rest?.outDir || path.resolve(packageDir, "dist");

    return {
        input: inputs,
        output: [
            {
                dir: outDir,
                format: 'esm',
                entryFileNames: '[name].mjs', // Use .mjs extension for ESM
                chunkFileNames: '[name]-[hash].mjs',
                preserveModules: true
            },
            {
                dir: outDir,
                format: 'cjs',
                entryFileNames: '[name].js', // Use .js extension for CJS
                chunkFileNames: '[name]-[hash].js',
                preserveModules: true
            },
        ],
        plugins: [
            nodeResolve({
                extensions: [".ts", ".tsx"],
            }),
            externals({
                packagePath: path.resolve(packageDir, 'package.json'),
                deps: true,
                devDeps: true,
                peerDeps: true,
            }),
            swc({
                tsconfig: false,
                jsc: {
                    target: 'es2020',
                    transform: {
                        react: {
                            useBuiltins: true,
                        },
                    },
                    externalHelpers: true,
                },
            }),
        ]
    }
}
