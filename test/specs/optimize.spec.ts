import processFile from "../utils/process-file.js";
import compareContents from "../utils/compare-contents.js";

describe("options.optimize", () => {

  it("should not optimize SVGs if set to false", async () => {
    const [{ value }] = await processFile(["png-and-svg.html"], { optimize: false });
    await compareContents(value, "png-and-svg-inlined-3kb-limit.html");
  });

  it("should not optimize even large SVGs if set to false", async () => {
    const [{ value }] = await processFile(["png-and-svg.html"], { optimize: false, maxImageSize: Infinity });
    await compareContents(value, "png-and-svg-inlined-all.html");
  });

  it("should optimize SVGs with custom options", async () => {
    const [{ value }] = await processFile(["png-and-svg.html"], {
      optimize: {
        plugins: [
          "convertStyleToAttrs",
          "preset-default",
          {
            name: "removeAttrs",
            active: true,
            params: {
              attrs: "(stroke|fill)",
            },
          },
        ]
      }
    });

    await compareContents(value, "png-and-svg-inlined-customized-3kb-limit.html");
  });

});
