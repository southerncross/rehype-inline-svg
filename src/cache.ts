import { optimize as optimizeSvg } from "svgo";
import type { Config as SvgoConfig } from "svgo";
import type { GroupedImageNodes, ImageNodeGroup } from "./image-node.js";
import { readFile } from "./read-file.js";

/**
 * A cache of the contents of of SVG files. This saves us from reading the same files
 * many times when the file occurs multiple times on one page, or across multiple pages.
 */
export class SvgCache extends Map<string, string> {
  private _hits = 0;
  private _misses = 0;
  private _queue: Array<Promise<void>> = [];

  public get hits(): number {
    return this._hits;
  }

  public get misses(): number {
    return this._misses;
  }

  /**
   * Reads the contents of any SVG files that aren't already in the cache,
   * and adds them to the cache.
   */
  public async read(groupedNodes: GroupedImageNodes, optimize: boolean | SvgoConfig): Promise<void> {
    // Queue-up any files that aren't already in the cache
    let promises = [...groupedNodes].map((group) => this._readFile(group, optimize));
    let queued = this._queue.push(...promises);

    // Wait for all queued files to be read
    await Promise.all(this._queue);

    // Remove the fulfilled items from the queue
    this._queue = this._queue.slice(queued);
  }

  /**
   * Reads the specified SVG file and returns its contents
   */
  private async _readFile(group: ImageNodeGroup, optimize: boolean | SvgoConfig): Promise<void> {
    let [path, nodes] = group;

    if (this.has(path)) {
      // Woot!  We just saved unnecessary file reads!
      this._hits += nodes.length;
      return;
    }

    // Immediately add this path to the cache, to avoid multiple reads of the same file
    this.set(path, "");
    this._misses++;
    this._hits += (nodes.length - 1);

    // Read the SVG file
    let content = await readFile(path, "utf8");

    // Optimize the contents, if enabled
    if (optimize) {
      const optimizeConfig = typeof optimize === "boolean" ? {} : optimize;
      let optimized = await optimizeSvg(content, { path, ...optimizeConfig });
      content = optimized.data;
    }

    // Ensure that we didn't accidentally read the same file multiple times
    if (this.get(path)!.length > 0) {
      throw new Error(`SvgCache encountered a race conditmion. ${path} was read multiple times.`);
    }

    // Cache the SVG content
    this.set(path, content);
  }
}
