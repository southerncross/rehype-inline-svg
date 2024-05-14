import parse from "rehype-parse";
import { unified } from "unified";
import type { Processor } from "unified";
import type { Node, Parent } from "unist";
import { VFile } from "vfile";
import { SvgCache } from "./cache.js";
import { isSvgNode } from "./image-node.js";
import type { GroupedImageNodes, SvgNode } from "./image-node.js";

/**
 * Converts the given `<img>` nodes to `<svg>` nodes
 */
export function imgToSVG(groupedNodes: GroupedImageNodes, svgCache: SvgCache): void {
  // Create a Rehype processor to parse SVG content
  let processor = unified().use(parse, { fragment: true, space: "svg" });

  for (let [filePath, imgNodes] of groupedNodes) {
    // Parse the SVG content to a HAST tree
    let svgNode = parseSVG(filePath, svgCache, processor);

    for (let imgNode of imgNodes) {
      // Merge the <svg> properties with the <img> properties
      let properties = {
        ...svgNode.properties,
        ...imgNode.properties,
      };

      // @ts-expect-error - Don't copy the "src" property
      delete properties.src;

      // Overwrite the <img> node with the <svg> node
      Object.assign(imgNode, svgNode, { properties });
    }
  }
}

/**
 * Parses the specified SVG image to a HAST tree
 */
function parseSVG(filePath: string, svgCache: SvgCache, processor: Processor<Node>): SvgNode {
  let file = new VFile({
    value: svgCache.get(filePath),
    path: filePath,
  });

  // Parse the SVG content to a HAST tree
  let rootNode = processor.parse(file) as Parent;

  // Find the <svg> child node
  for (let child of rootNode.children) {
    if (isSvgNode(child)) {
      return child;
    }
  }

  throw new Error(`Error parsing SVG image: ${filePath}\nUnable to find the root <svg> element.`);
}
