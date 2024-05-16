import fs from "fs";
import { unified } from "unified";
import parse from "rehype-parse";
import stringify from "rehype-stringify";
import { read, write } from "to-vfile";
import { VFile } from "vfile";
import type { Node } from 'unist';
import type { Processor, CompileResults } from 'unified';

import inlineSVG from "../../src/index.js";

before("Create the .tmp directory", () => {
  if (!fs.existsSync("test/fixtures/.tmp")) {
    fs.mkdirSync("test/fixtures/.tmp");
  }
});

/**
 * Processes the specified HTML file using the given Rehype instance
 */
async function processFile<
  A extends Node | undefined,
  B extends Node | undefined,
  C extends Node | undefined,
  D extends Node | undefined,
  E extends CompileResults | undefined
>(fileName: string, processor: Processor<A, B, C, D, E>) {
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
