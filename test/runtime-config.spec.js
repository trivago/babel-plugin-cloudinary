const babel = require("babel-core");
const plugin = require("../src");

jest.mock(
  "../.cloudinaryrc",
  () => ({
    native: {
      // eslint-disable-next-line
      cloud_name: "trivago",
      secure: true,
    },
    host: "trivago.images.com",
    overrideBaseUrl: true,
  }),
  { virtual: true }
);

describe("runtime-config", () => {
  describe("when `overrideBaseUrl` is set to true", () => {
    describe("and `host` is provided", () => {
      it("should override the base URL with the provided host", () => {
        const input = "const imageUrl = __buildCloudinaryUrl('my-picture', {});";
        const { code } = babel.transform(input, { plugins: [plugin] });

        expect(code).toMatchSnapshot();
      });
    });

    // describe("and `host` is not provided", () => {
    //   it("should throw an error", () => {
    //     const input = "const imageUrl = __buildCloudinaryUrl('my-picture', {});";
    //     const { code } = babel.transform(input, { plugins: [plugin] });

    //     expect(code).toMatchSnapshot();
    //   });
    // });
  });
});
