const requireConfig = require("../lib/helpers/requireConfig");

describe("requireConfig", () => {
  it("throws when config not found at expected location", () => {
    expect(requireConfig).toThrow(`Cloudinary config could not be found at ${process.env.INIT_CWD || process.cwd()}`);
  });

  it("loads the required file", () => {
    const mockConfig = JSON.stringify({ test: 1 });

    jest.mock(
      `${process.cwd()}/cloudinaryrc.json`,
      () => {
        return mockConfig;
      },
      { virtual: true }
    );

    const loadedConfig = requireConfig();

    expect(loadedConfig).toBe(mockConfig);
  });

  afterAll(() => jest.resetAllMocks());
});
