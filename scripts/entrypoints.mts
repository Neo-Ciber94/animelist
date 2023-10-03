import path from 'path';
import fse from 'fs-extra';
import * as glob from 'glob';

export const ENTRYPOINT_MARKER = ".entrypoint";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function writeFileSync(filePath: string, contents: string) {
    const dir = path.dirname(filePath);
    fse.ensureDirSync(dir);

    fse.writeFileSync(filePath, contents)
}

type JsFormat = 'cjs' | 'esm';

type GenerateEntryPointsOptions = {
    packageDir: string;
    additionalInputs?: string[];
    formats?: JsFormat[],
    convertJsToEsm?: boolean;
}

export function generateEntrypoints({
    packageDir,
    additionalInputs,
    formats = ['cjs', 'esm'],
    convertJsToEsm = true }: GenerateEntryPointsOptions) {

    if (convertJsToEsm === false && formats.includes('cjs')) {
        throw new Error("'convertJsToEsm' cannot false be used if the format include 'cjs'");
    }

    const timestamp = new Date().toISOString();
    const srcDir = path.resolve(packageDir, 'src');

    if (!fse.existsSync(srcDir)) {
        throw new Error(`'src' directory does not exist on ${srcDir}`);
    }

    cleanUpEntrypoints(packageDir);

    const additionalFiles = (additionalInputs || []).map(file => path.resolve(packageDir, file));

    const indexFiles = [
        ...glob.sync(`${srcDir}/**/index.ts`),
        ...glob.sync(`${srcDir}/**/index.tsx`),
        ...additionalFiles
    ];

    for (const indexFile of indexFiles) {
        if (!fse.existsSync(indexFile)) {
            console.warn(`'${indexFile}' does not exist`)
            continue;
        }

        const relativePath = path.dirname(path.relative(srcDir, indexFile));
        const fileName = path.basename(indexFile).replaceAll(/(\.ts|\.tsx)$/g, "");
        const isIndex = fileName === "index";

        // Not need to include `index.ts` the files in the root, those are already included
        if (relativePath === "." && isIndex) {
            continue;
        } else if (relativePath === ".") {
            fse.ensureDirSync(fileName);
        }

        const basePath = isIndex ? relativePath : `./${fileName}`;
        const importDepth = relativePath.split(path.sep).length || 1;
        const resolvedImport = path.join(
            ...Array(importDepth).fill('..'),
            "dist",
            relativePath,
        )

        const resolvedModuleExport = path.join(resolvedImport, `${fileName}.js`).replace(/\\/g, '/');
        const resolvedTypesExport = path.join(resolvedImport, `${fileName}.d.ts`).replace(/\\/g, '/');
        const typesExport = `export * from "${resolvedTypesExport}"`

        if (formats.includes('cjs')) {
            const commonJsExport = `module.exports = require("${resolvedModuleExport}")`;
            const commonJsEntryFilePath = path.join(packageDir, basePath, `index.js`);
            writeFileSync(commonJsEntryFilePath, commonJsExport);
            console.log({ commonJsExport, commonJsEntryFilePath })
        }

        if (formats.includes('esm')) {
            const ext = convertJsToEsm ? "mjs" : "js";
            const esmExport = `export * from "${resolvedModuleExport}"`.replace(".js", `.${ext}`);

            const esmEntryFilePath = path.join(packageDir, basePath, `index.${ext}`);
            writeFileSync(esmEntryFilePath, esmExport);
            console.log({ esmExport, esmEntryFilePath })
        }

        const typeEntryPointFilePath = path.join(packageDir, basePath, `index.d.ts`);
        const entryPointMarkerFilePath = path.join(packageDir, basePath, ENTRYPOINT_MARKER);

        writeFileSync(typeEntryPointFilePath, typesExport);
        writeFileSync(entryPointMarkerFilePath, timestamp);

        console.log({
            typesExport,
            typeEntryPointFilePath
        })
    }
}

export function cleanUpEntrypoints(packageDir: string) {
    const entryPointMarkers = glob.sync(`${packageDir}/**/${ENTRYPOINT_MARKER}`);

    for (const entryPointFile of entryPointMarkers) {
        if (!fse.existsSync(entryPointFile)) {
            continue;
        }

        const dir = path.dirname(entryPointFile);
        fse.removeSync(dir);
    }
}