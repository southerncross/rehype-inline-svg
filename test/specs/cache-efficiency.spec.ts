import { expect } from "chai";
import processFiles from "../utils/process-file.js";
import compareContents from "../utils/compare-contents.js";
import { CacheEfficiency } from "../../src/options.js";

describe("options.cacheEfficiency", () => {
  let efficiencyData: CacheEfficiency[] = [];

  function cacheEfficiency (data: CacheEfficiency) {
    efficiencyData.push(data);
  }

  beforeEach("Reset efficiencyData", () => {
    efficiencyData = [];
  });

  it("should not report any cache efficiency if there are no images", async () => {
    const [{ value }] = await processFiles(["no-images.html"], { cacheEfficiency });

    expect(efficiencyData).to.deep.equal([]);
    await compareContents(value, "no-images-unchanged.html");
  });

  it("should not report any cache efficiency if there are no SVGs", async () => {
    const [{ value }] = await processFiles(["no-svgs.html"], { cacheEfficiency });

    expect(efficiencyData).to.deep.equal([]);
    await compareContents(value, "no-svgs-unchanged.html");
  });

  it("should report no hits and all misses if SVGs only occur once", async () => {
    const [{ value }] = await processFiles(["png-and-svg.html"], { cacheEfficiency });

    expect(efficiencyData).to.deep.equal([
      { hits: 0, misses: 5 },
    ]);

    await compareContents(value, "png-and-svg-inlined-optimized-3kb-limit.html");
  });

  it("should report many hits and few misses if SVGs occurs many times", async () => {
    const [{ value }] = await processFiles(["many-svgs.html"], { cacheEfficiency });

    expect(efficiencyData).to.deep.equal([
      { hits: 95, misses: 5 },
    ]);

    await compareContents(value, "many-svgs-inlined-optimized-10kb-total-limit.html");
  });

  it("should re-use the cache when processing multiple files with the same instance of the Inline SVG plugin", async () => {
    let files = await processFiles(["many-svgs.html", "png-and-svg.html", "many-svgs.html"], { cacheEfficiency });

    expect(efficiencyData).to.deep.equal([
      { hits: 95, misses: 5 },
      { hits: 100, misses: 5 },
      { hits: 200, misses: 5 },
    ]);

    await compareContents(files[0].value, "many-svgs-inlined-optimized-10kb-total-limit.html");
    await compareContents(files[1].value, "png-and-svg-inlined-optimized-3kb-limit.html");
    await compareContents(files[2].value, "many-svgs-inlined-optimized-10kb-total-limit.html");
  });

  it("should not re-use the cache for separate instances of the Inline SVG plugin", async () => {
    let [file1] = await processFiles(["many-svgs.html"], { cacheEfficiency });
    let [file2] = await processFiles(["many-svgs.html"], { cacheEfficiency });

    expect(efficiencyData).to.deep.equal([
      { hits: 95, misses: 5 },
      { hits: 95, misses: 5 },
    ]);

    await compareContents(file1.value, "many-svgs-inlined-optimized-10kb-total-limit.html");
    await compareContents(file2.value, "many-svgs-inlined-optimized-10kb-total-limit.html");
  });

});
