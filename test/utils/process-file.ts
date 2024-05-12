import fs from "fs";
import { unified } from "unified";
import parse from "rehype-parse";
import stringify from "rehype-stringify";
import { read, write } from "to-vfile";
import { VFile } from "vfile";

import inlineSVG from "../../src/index";

before("Create the .tmp directory", () => {
  if (!fs.existsSync("test/fixtures/.tmp")) {
    fs.mkdirSync("test/fixtures/.tmp");
  }
});

/**
 * Processes the specified HTML file using the given Rehype instance
 */
async function processFile(fileName, processor) {
  let file = await read(`test/fixtures/originals/${fileName}`);
  file = await processor.process(file);

  // Save the modified file to the ".tmp" directory
  let tmpFilePath = `test/fixtures/.tmp/${fileName}`;
  await write({ path: tmpFilePath, value: file.value });

  return file;
}

/**
 * Processes one or more HTML files using Rehype and the Inline SVG plugin
 */
export default async function processFiles(fileNames: string[], options?: Record<string, any>) {
  const processor = unified()
    .use(parse)
    .use(inlineSVG, options)
    .use(stringify);

  if (Array.isArray(fileNames)) {
    const files: VFile[] = [];

    for (let fileName of fileNames) {
      const file = await processFile(fileName, processor);
      files.push(file);
    }

    return files;
  } else {
    return [await processFile(fileNames, processor)];
  }
}
