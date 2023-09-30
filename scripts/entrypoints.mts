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

type GenerateEntryPointsOptions = {
    packageDir: string;
    additionalInputs?: string[];
}

export function generateEntrypoints({ packageDir, additionalInputs }: GenerateEntryPointsOptions) {
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
        const commonJsExport = `module.exports = require("${resolvedModuleExport}")`;
        const esmExport = `export * from "${resolvedModuleExport}"`.replace(".js", ".mjs");
        const typesExport = `export * from "${resolvedTypesExport}"`

        const commonJsEntryFilePath = path.join(packageDir, basePath, `index.js`);
        const esmEntryFilePath = path.join(packageDir, basePath, `index.mjs`);
        const typeEntryPointFilePath = path.join(packageDir, basePath, `index.d.ts`);
        const gitignoreFilePath = path.join(packageDir, basePath, ".gitignore");
        const entryPointMarkerFilePath = path.join(packageDir, basePath, ENTRYPOINT_MARKER);

        writeFileSync(commonJsEntryFilePath, commonJsExport);
        writeFileSync(esmEntryFilePath, esmExport);
        writeFileSync(typeEntryPointFilePath, typesExport);
        writeFileSync(gitignoreFilePath, "*");
        writeFileSync(entryPointMarkerFilePath, new Date().toUTCString());

        console.log({
            commonJsExport,
            commonJsEntryFilePath,
            esmExport,
            esmEntryFilePath,
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