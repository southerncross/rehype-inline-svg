import processFile from "../utils/process-file.js";
import compareContents from "../utils/compare-contents.js";

describe("options.maxTotalSize", () => {

  it("should do nothing if maxTotalSize is zero", async () => {
    const [{ value }] = await processFile(["png-and-svg.html"], { maxTotalSize: 0 });
    await compareContents(value, "png-and-svg-unchanged.html");
  });

  it("should inline all small SVGs if maxTotalSize is Infinity", async () => {
    const [{ value }] = await processFile(["many-svgs.html"], { maxTotalSize: Infinity });
    await compareContents(value, "many-svgs-inlined-optimized-no-max-total-size.html");
  });

  it("should inline all SVGs if maxTotalSize and maxImageSize are both Infinity", async () => {
    const [{ value }] = await processFile(["many-svgs.html"], { maxImageSize: Infinity, maxTotalSize: Infinity });
    await compareContents(value, "many-svgs-inlined-optimized-all.html");
  });

});
