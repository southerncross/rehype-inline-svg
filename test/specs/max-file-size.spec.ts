import processFile from "../utils/process-file.js";
import compareContents from "../utils/compare-contents.js";

describe("options.maxImageSize", () => {

  it("should do nothing if maxImageSize is zero", async () => {
    const [{ value }] = await processFile(["png-and-svg.html"], { maxImageSize: 0 });
    await compareContents(value, "png-and-svg-unchanged.html");
  });

  it("should do nothing if all SVGs exceed the maxImageSize", async () => {
    const [{ value }] = await processFile(["png-and-svg.html"], { maxImageSize: 200 });
    await compareContents(value, "png-and-svg-unchanged.html");
  });

  it("should inline and optimize all SVGs if maxImageSize is Infinity", async () => {
    const [{ value }] = await processFile(["png-and-svg.html"], { maxImageSize: Infinity });
    await compareContents(value, "png-and-svg-inlined-optimized-all.html");
  });

});
