const { getBaseImageUrl } = require("../lib/cloudinary-proxy");

jest.mock(
  "../cloudinaryrc.json",
  () => ({
    native: {
      // eslint-disable-next-line camelcase
      cloud_name: "trivago",
      secure: true,
    },
    host: "trivago.images.com",
    overrideBaseUrl: true,
  }),
  { virtual: true }
);

describe("cloudinary-proxy", () => {
  it("has proper output for getBaseImageUrl 1", () => {
    const expected = "https://trivago.images.com/";

    expect(getBaseImageUrl("myfile.jpg")).toEqual(expected);
  });

  it("has proper output for getBaseImageUrl 2", () => {
    const expected = "https://trivago.images.com/";

    expect(getBaseImageUrl("myfile_2@.jpg")).toEqual(expected);
  });
});
