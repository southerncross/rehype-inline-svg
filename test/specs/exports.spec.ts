import defaultExport, { inlineSVG as namedExport } from "../../";
import { expect } from "chai";

describe("rehype-inline-svg package exports", () => {

  it("should export the inlineSVG() function as the default ESM export", () => {
    expect(defaultExport).to.be.a("function");
  });

  it("should export the inlineSVG() function as a named export", () => {
    expect(namedExport).to.be.a("function");
  });

});
