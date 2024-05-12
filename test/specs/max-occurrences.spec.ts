import processFile from "../utils/process-file.js";
import compareContents from "../utils/compare-contents.js";

describe("options.maxOccurrences", () => {

  it("should do nothing if maxOccurrences is zero", async () => {
    const [{ value }] = await processFile(["png-and-svg.html"], { maxOccurrences: 0 });
    await compareContents(value, "png-and-svg-unchanged.html");
  });

  it("should do nothing if every SVG occurs more than maxOccurrences", async () => {
    const [{ value }] = await processFile(["many-svgs.html"], { maxOccurrences: 10 });
    await compareContents(value, "many-svgs-unchanged.html");
  });

});
