const babel = require("babel-core");
const plugin = require("../src");

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
