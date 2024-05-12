import processFiles from "../utils/process-file.js";
import compareContents from "../utils/compare-contents.js";

describe("default behavior", () => {

  it("should do nothing if there are no images", async () => {
    const [{ value }] = await processFiles(["no-images.html"]);
    await compareContents(value, "no-images-unchanged.html");
  });

  it("should do nothing if there are no SVGs", async () => {
    const [{ value }] = await processFiles(["no-svgs.html"]);
    await compareContents(value, "no-svgs-unchanged.html");
  });

  it("should inline and optimize SVGs under 3kb", async () => {
    const [{ value }] = await processFiles(["png-and-svg.html"]);
    await compareContents(value, "png-and-svg-inlined-optimized-3kb-limit.html");
  });

  it("should not inline SVGs with a total size over 10kb", async () => {
    const [{ value }] = await processFiles(["many-svgs.html"]);
    await compareContents(value, "many-svgs-inlined-optimized-10kb-total-limit.html");
  });

});
