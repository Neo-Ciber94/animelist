import path from "path";
import swc from "rollup-plugin-swc3";
import del from "rollup-plugin-delete";
import typescript from "rollup-plugin-typescript2";
import nodeResolve from "@rollup/plugin-node-resolve";
import externals from "rollup-plugin-node-externals";
import { type RollupOptions } from "rollup";
import * as glob from "glob";

type RollupBuildOptions = {
  packageDir: string;
  input: string[];
  exclude?: string[];
};

type Options = {
  files: string[];
  packageDir: string;
};

export function rollupConfig({
  input,
  packageDir,
  exclude,
}: RollupBuildOptions): RollupOptions[] {
  const files: string[] = [];

  for (const inputFiles of input) {
    if (inputFiles.includes("*")) {
      const globResult = glob.sync(inputFiles, { ignore: exclude });
      files.push(...globResult);
    } else {
      files.push(inputFiles);
    }
  }

  const opts = { files, packageDir };
  return [types(opts), lib(opts)];
}

function types({ files, packageDir }: Options): RollupOptions {
  const outDir = path.join(packageDir, "dist");

  return {
    input: files,
    output: {
      dir: outDir,
    },
    plugins: [
      del({
        targets: outDir,
      }),
      typescript({
        tsconfig: path.resolve(packageDir, "tsconfig.json"),
      }),
    ],
  };
}

function lib({ files, packageDir }: Options): RollupOptions {
  const outDir = path.join(packageDir, "dist");

  return {
    input: files,
    output: [
      {
        dir: outDir,
        format: "cjs",
        entryFileNames: "[name].js",
        chunkFileNames: "[name]-[hash].js",
        preserveModules: true,
      },
      {
        dir: outDir,
        format: "esm",
        entryFileNames: "[name].mjs",
        chunkFileNames: "[name]-[hash].mjs",
        preserveModules: true,
      },
    ],
    plugins: [
      externals({
        packagePath: path.resolve(packageDir, "package.json"),
      }),
      nodeResolve({
        extensions: [".ts", ".tsx"],
      }),
      swc({
        tsconfig: false,
        jsc: {
          target: "es2020",
          transform: {
            react: {
              useBuiltins: true,
            },
          },
          externalHelpers: true,
        },
      }),
    ],
  };
}
