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

export function generateEntrypoints(packageDir: string, additionalInputs?: string[]) {
    const srcDir = path.resolve(packageDir, 'src');

    if (!fse.existsSync(srcDir)) {
        throw new Error(`'src' directory does not exist on ${srcDir}`);
    }

    cleanUpEntrypoints(packageDir);

    const additionalFiles = (additionalInputs || []).map(file => path.resolve(packageDir, file));

    const indexFiles = [
        ...glob.sync(`${srcDir}/**/index.ts`),
        ...additionalFiles
    ];

    for (const indexFile of indexFiles) {
        const relativePath = path.dirname(path.relative(srcDir, indexFile));

        // Not need to include the files in the root, those are already included
        if (relativePath === ".") {
            continue;
        }

        const importDepth = relativePath.split(path.sep).length || 1;
        const resolvedImport = path.join(
            ...Array(importDepth).fill('..'),
            "dist",
            relativePath,
        )

        const resolvedModuleExport = path.join(resolvedImport, "index.js").replace(/\\/g, '/');
        const resolvedTypesExport = path.join(resolvedImport, "index.d.ts").replace(/\\/g, '/');
        const moduleExport = `module.exports = require("${resolvedModuleExport}")`;
        const typesExport = `export * from "${resolvedTypesExport}"`

        const moduleEntryPointFilePath = path.join(packageDir, relativePath, "index.js");
        const typeEntryPointFilePath = path.join(packageDir, relativePath, "index.d.ts");
        const gitignoreFilePath = path.join(packageDir, relativePath, ".gitignore");
        const entryPointMarkerFilePath = path.join(packageDir, relativePath, ".entrypoint");

        writeFileSync(moduleEntryPointFilePath, moduleExport);
        writeFileSync(typeEntryPointFilePath, typesExport);
        writeFileSync(gitignoreFilePath, "*");
        writeFileSync(entryPointMarkerFilePath, new Date().toUTCString());

        console.log({
            moduleExport,
            moduleEntryPointFilePath,
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