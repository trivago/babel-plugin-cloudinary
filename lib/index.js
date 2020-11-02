/**
 * @module babel-plugin-cloudinary
 * @description
 * Plugin entry point makes use of the auxiliary modules
 * to compile URLs. The core flow of the plugin is inside
 * the processUrl method.
 */
const t = require("@babel/types");
const _get = require("lodash/get");
const astHelpers = require("./ast-helpers");
const { PLUGIN_PARAMETERS, validate } = require("./plugin-parameters");
const { CALLEE_NAME, getBaseImageUrl } = require("./cloudinary-proxy");

/**
 * Given a path that contains a call expression for
 * building a cloudinary URL, this functions performs the traverse
 * and compiles the call expression into the actual URL.
 * @param {Object} path - the path to traverse.
 * @returns {undefined}
 */
function processUrl(path) {
  const [assetName, options] = path.node.arguments;

  validate(assetName, options);

  const parameters = astHelpers.mapOptions(options, PLUGIN_PARAMETERS);
  const { rawNode: staticBaseTransforms, mappings } = astHelpers.replaceExpressions(
    parameters.transforms,
    PLUGIN_PARAMETERS.transforms.placeholder
  );

  delete parameters.transforms;

  const url = getBaseImageUrl(PLUGIN_PARAMETERS.assetName.placeholder, staticBaseTransforms);
  const { quasis: baseQuasis, expressions: baseExpressions } = astHelpers.convertUrlIntoTemplateLiteral(
    url,
    mappings,
    PLUGIN_PARAMETERS.transforms.placeholder
  );
  const allPluginParameters = Object.assign({}, parameters, { assetName });
  const extraExpressions = Object.keys(PLUGIN_PARAMETERS)
    .sort((paramA, paramB) => PLUGIN_PARAMETERS[paramA].ord - PLUGIN_PARAMETERS[paramB].ord)
    .map((param) => {
      if (allPluginParameters[param]) {
        return allPluginParameters[param];
      } else if (PLUGIN_PARAMETERS[param].default && PLUGIN_PARAMETERS[param].defaultType) {
        const babelConstructor = t[PLUGIN_PARAMETERS[param].defaultType];

        return babelConstructor(PLUGIN_PARAMETERS[param].default);
      }
    });
  const expressions = [...baseExpressions, ...astHelpers.filterExpressions(extraExpressions), t.stringLiteral("")];
  const quasis = [...baseQuasis, ...Object.keys(extraExpressions).map(() => astHelpers.templateElement(""))];

  // keep pairing between expressions and quasis with empty literals
  if (expressions.length < quasis.length) {
    const offset = quasis.length - expressions.length;

    for (let i = 0; i < offset; i++) {
      expressions.push(t.stringLiteral(""));
    }
  }

  // number of quasis should be exactly 1 more than expressions
  if (quasis.length === expressions.length) {
    quasis.push(t.templateElement({ raw: "", cooked: "" }));
  }

  path.replaceWith(t.expressionStatement(t.templateLiteral(quasis, expressions)));
}

module.exports = function babelPluginCloudinary() {
  return {
    visitor: {
      CallExpression(path) {
        const calleeName = _get(path, "node.callee.name");

        if (calleeName && calleeName === CALLEE_NAME) {
          processUrl(path);
        }
      },
    },
  };
};
