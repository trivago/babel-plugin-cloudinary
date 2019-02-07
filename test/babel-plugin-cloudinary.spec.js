const babel = require("babel-core");
const plugin = require("../src");

describe("babel-plugin-cloudinary", () => {
  describe("when all parameters are defined", () => {
    describe("and all parameters are dynamic (variables, function calls and conditionals)", () => {
      it("should compile to correct cloudinary URL template", () => {
        const input = `
          const isMobile = false;
          const getWidth = () => 200;
          const getHeight = () => 300;
          const imageQuality = isMobile ? 'auto:eco' : 'auto:good';
          const pref = 'gallery/sand/';
          const post = '_v10';
          const extMobile = '.png';
          const extDesktop = '.jpeg';

          const imageUrl = __buildCloudinaryUrl(
            'my-picture', {
              transformation: {
                transformation: 'crop',
                crop: 'fill',
                quality: imageQuality,
                width: getWidth(),
                height: getHeight()
              },
              prefix: pref,
              postfix: post,
              resourceExtension: isMobile ? extMobile : extDesktop,
            }
        );`;

        const { code } = babel.transform(input, { plugins: [plugin] });

        expect(code).toMatchSnapshot();
      });
    });

    describe("and all parameters are static", () => {
      it("should compile to correct cloudinary URL template", () => {
        const input = `
          const imageUrl = __buildCloudinaryUrl(
            'my-picture', {
              transformation: {
                transformation: 'crop',
                crop: 'fill',
                quality: 'auto:good',
                width: 200,
                height: 300
              },
              prefix: 'gallery/sand/',
              postfix: '_v10',
              resourceExtension: '.png',
            }
        );`;

        const { code } = babel.transform(input, { plugins: [plugin] });

        expect(code).toMatchSnapshot();
      });
    });
  });

  describe("when `options.transformations` is not provided", () => {
    it("should compile to correct cloudinary URL template", () => {
      const input = `
        const imageUrl = __buildCloudinaryUrl(
          'my-picture', {
            prefix: 'gallery/sand/',
            postfix: '_v10',
            resourceExtension: '.png',
          }
      );`;

      const { code } = babel.transform(input, { plugins: [plugin] });

      expect(code).toMatchSnapshot();
    });
  });

  describe("when only `options.transformations` is provided", () => {
    it("should compile to correct cloudinary URL template", () => {
      const input = `
          const imageUrl = __buildCloudinaryUrl(
            'my-picture', {
              transformation: {
                transformation: 'crop',
                crop: 'fill',
                quality: 'auto:good',
                width: 200,
                height: 300
              }
            }
        );`;

      const { code } = babel.transform(input, { plugins: [plugin] });

      expect(code).toMatchSnapshot();
    });
  });

  // describe("when `options` are not provided", () => {
  //   it("`options` is an empty object", () => {

  //   });

  //   it("`options` is undefined", () => {

  //   });

  //   it("`options` is null", () => {

  //   });
  // });

  // TODO: when we have multilevel transforms!
});
