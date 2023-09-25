import path from 'path';
import fse from 'fs-extra';
import * as glob from 'glob';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function writeFileSync(filePath: string, contents: string) {
    const dir = path.dirname(filePath);
    fse.ensureDirSync(dir);

    fse.writeFileSync(filePath, contents)
}

export function generateEntrypoints(packageDir: string) {
    const srcDir = path.resolve(packageDir, 'src');

    if (!fse.existsSync(srcDir)) {
        throw new Error(`'src' directory does not exist on ${srcDir}`);
    }

    const indexFiles = glob.sync(`${srcDir}/**/**/index.ts`);

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
        const entryPointMarker = path.join(packageDir, relativePath, "entrypoint.txt");

        writeFileSync(moduleEntryPointFilePath, moduleExport);
        writeFileSync(typeEntryPointFilePath, typesExport);
        writeFileSync(entryPointMarker, Date.now().toString());

        console.log({
            moduleEntryPointFilePath,
            typeEntryPointFilePath
        })
    }
}