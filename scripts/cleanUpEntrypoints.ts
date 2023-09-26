import * as glob from "glob";
import fse from 'fs-extra';
import path from "path";
import { ENTRYPOINT_MARKER } from "./entrypoints.js";

function main() {
    console.log("Removing entry points...")
    const entryPointMarkers = glob.sync(`**/**/${ENTRYPOINT_MARKER}`, {
        ignore: ["**/node_modules"]
    });

    for (const entryPointFile of entryPointMarkers) {
        if (!fse.exists(entryPointFile)) {
            continue;
        }

        const dir = path.dirname(entryPointFile);
        fse.removeSync(dir);
        console.log(`Removed: ${dir}`)
    }
}

main();