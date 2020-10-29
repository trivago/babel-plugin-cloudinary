/**
 * Load the cloudinaryrc configuration from the top level path
 * @throws Will throw if the file is not or the error faced during the `require` call
 * @returns {NodeRequire} JSON configuration module
 */
function requireConfig() {
  const configFileLocation = `${process.env.INIT_CWD || process.cwd()}/cloudinaryrc.json`;

  try {
    return require(configFileLocation);
  } catch (e) {
    if (e.code !== "MODULE_NOT_FOUND") {
      throw e;
    }
    throw Error(`Cloudinary config could not be found at ${configFileLocation}`);
  }
}

module.exports = requireConfig;
