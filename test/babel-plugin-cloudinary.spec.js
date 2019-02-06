const babel = require("babel-core");
const plugin = require("../src");

describe("babel-plugin-cloudinary", () => {
  it("sample", () => {
    const input = `
      const entityId = 42;
      const version = 21;
      const width = runtimeWidth();
      const height = runtimeHeight();
      const imageQuality = isMobile ? 'auto:eco' : 'q_auto:good';
      const imageUrl = __buildCloudinaryUrl__(
        'mypic.jpg', {
          transformation: { transformation: 'crop', crop: 'fill', quality: imageQuality, width: width, height: height }
        }
      );`;

    const { code } = babel.transform(input, { plugins: [plugin] });

    expect(code).toMatchSnapshot();
  });
});
