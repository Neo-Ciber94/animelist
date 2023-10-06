import fs from "fs/promises";
import fse from "fs-extra";
import nodePath from "path";

export async function replaceImportExtensions(
  files: string[],
  extension: `.${string}`
) {
  const promises: Promise<void>[] = [];
  for (const filePath of files) {
    const task = async () => {
      const fileContent = await fs.readFile(filePath, "utf8");
      const updatedContent = fileContent.replace(
        /(import|export)\s+([*\w\s{},]+)\s+from\s+(["']\.([./a-zA-Z0-9]+))["']/g,
        (match, statement, variable, path: string) => {
          const dir = nodePath.dirname(filePath);
          const importFilePath = nodePath.join(dir, `${path}.js`);
          const exists = fse.existsSync(importFilePath);
          const isDirectory =
            exists && fse.statSync(importFilePath).isDirectory();

          const importPath = path.replace(/(.mjs|.js|.cjs)/, "");
          const updatedPath =
            isDirectory && exists
              ? `${importPath}/index${extension}"`
              : `${importPath}${extension}"`;

          return `${statement} ${variable} from ${updatedPath}`;
        }
      );

      await fs.writeFile(filePath, updatedContent, "utf8");
    };

    promises.push(task());
  }

  await Promise.all(promises);
}
