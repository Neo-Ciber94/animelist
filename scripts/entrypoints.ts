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

export function generateEntrypoints(packageDir: string) {
    const srcDir = path.resolve(packageDir, 'dist');

    if (!fse.existsSync(srcDir)) {
        throw new Error(`'src' directory does not exist on ${srcDir}`);
    }

    cleanUpEntrypoints(packageDir);
    const indexFiles = [
        ...glob.sync(`${srcDir}/**/index.ts`),
        ...glob.sync(`${srcDir}/**/index.tsx`)
    ];

    for (const indexFile of indexFiles) {
        const relativePath = path.dirname(path.relative(srcDir, indexFile));

        // Not need to include the files in the root, those are already included
        if (relativePath === ".") {
            continue;
        }

        const moduleExport = `module.exports = require("./dist/${relativePath}/index.js")`;
        const typesExport = `export * from "./dist/${relativePath}/index.js"`

        const moduleEntryPointFilePath = path.join(packageDir, relativePath, "index.js");
        const typeEntryPointFilePath = path.join(packageDir, relativePath, "index.d.ts");
        const gitignoreFilePath = path.join(packageDir, relativePath, ".gitignore");
        const entryPointMarkerFilePath = path.join(packageDir, relativePath, ".entrypoint");

        writeFileSync(moduleEntryPointFilePath, moduleExport);
        writeFileSync(typeEntryPointFilePath, typesExport);
        writeFileSync(gitignoreFilePath, "*");
        writeFileSync(entryPointMarkerFilePath, new Date().toUTCString());

        console.log({
            moduleEntryPointFilePath,
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