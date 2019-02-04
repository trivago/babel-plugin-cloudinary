import * as babel from "babel-core";
import plugin from "../lib";

describe("babel-plugin-cloudinary", () => {
  it("sample", () => {
    const input = "const a = url(1)";
    const {
      code,
    } = babel.transform(input, {
      plugins: [plugin],
    });

    expect(code).toMatchSnapshot();
  });
});
