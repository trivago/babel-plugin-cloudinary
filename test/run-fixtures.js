const fs = require("fs");

const FIXTURES_BASE_DIR = `${__dirname}/fixtures`;

/**
 * This function generates a spec snippet for a given
 * fixture contained within the provided directory name.
 * @param {string} dir - directory of the fixture to generate.
 * @returns {undefined}
 */
function generateFixtureSnippet(dir) {
  if (!dir) {
    throw new Error("A valid directory name must be provided");
  }

  let runtimeConfig;
  const input = fs.readFileSync(`${FIXTURES_BASE_DIR}/${dir}/input.js`);

  // load .cloudinaryrc file, fallback to default if no local config to fixture is found
  try {
    runtimeConfig = require(`${FIXTURES_BASE_DIR}/${dir}/.cloudinaryrc`);
  } catch (error) {
    runtimeConfig = require(`${FIXTURES_BASE_DIR}/../.cloudinaryrc`);
  }

  const spec = `
    // WARNING: this file is generated automatically
    const babel = require("babel-core");
    const plugin = require("../../../src");
    jest.mock("../../../.cloudinaryrc", () => (${JSON.stringify(runtimeConfig)}), { virtual: true });
    it("${dir}", () => {
      try {
        const { code } = babel.transform(\`${input}\`, { plugins: [plugin] });
        expect(code).toMatchSnapshot();
      } catch(error) {
        expect(error).toMatchSnapshot();
      }
    });
  `;

  fs.writeFileSync(`${FIXTURES_BASE_DIR}/${dir}/${dir}.spec.js`, spec);
}

/**
 * This function parses a file tree structure
 * and performs a snippet generation operation
 * on the existent directories.
 * @param {Object} err - error object.
 * @param {Array.<string>} directories - list of directories names.
 * @returns {undefined}
 */
function parseFileTree(err, directories) {
  if (err) {
    // eslint-disable-next-line
    console.error(err);
    process.exit(1);
  }

  directories.map(generateFixtureSnippet);
}

fs.readdir(FIXTURES_BASE_DIR, parseFileTree);
