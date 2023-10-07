import path from "path";
import swc from "rollup-plugin-swc3";
import nodeResolve from "@rollup/plugin-node-resolve";
import externals from "rollup-plugin-node-externals";
import { type RollupOptions, type OutputOptions } from "rollup";
import * as glob from "glob";

type JsFormat = "cjs" | "esm";

type RollupBuildOptions = {
  packageDir: string;
  input: string[];
  exclude?: string[];
  formats?: JsFormat[];
  esmOutputOverride?: OutputOptions;
};

type Options = {
  files: string[];
  packageDir: string;
  formats: JsFormat[];
  esmOutputOverride?: OutputOptions;
};

export function rollupConfig({
  input,
  packageDir,
  exclude,
  esmOutputOverride,
  formats = ["cjs", "esm"],
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

  const opts = { files, packageDir, formats, esmOutputOverride };
  return [lib(opts)];
}

function lib({
  files,
  packageDir,
  formats,
  esmOutputOverride,
}: Options): RollupOptions {
  const outDir = path.join(packageDir, "dist");
  const output: OutputOptions[] = [];

  if (formats.includes("cjs")) {
    output.push({
      dir: outDir,
      format: "cjs",
      entryFileNames: "[name].js",
      chunkFileNames: "[name]-[hash].js",
      preserveModules: true,
    });
  }

  if (formats.includes("esm")) {
    output.push({
      dir: outDir,
      format: "esm",
      entryFileNames: "[name].mjs",
      chunkFileNames: "[name]-[hash].mjs",
      preserveModules: true,
      ...esmOutputOverride,
    });
  }

  return {
    input: files,
    output,
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
          externalHelpers: false,
        },
      }),
    ],
  };
}
