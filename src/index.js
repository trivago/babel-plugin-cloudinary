const t = require("babel-types");
const _get = require("lodash/get");
const astHelpers = require("./ast-helpers");
const { PLUGIN_PARAMETERS } = require("./plugin-parameters");
const { CALLEE_NAME, getBaseImageUrl } = require("./cloudinary-proxy");

/**
 * Function that given a path that contains a call expression for
 * building a cloudinary URL performs the traverse and compiles the call expression
 * into the actual URL.
 * @param {Object} path - the path to traverse.
 * @returns {undefined}
 */
function processUrl(path) {
  const [assetName, options] = path.node.arguments;
  const parameters = astHelpers.mapOptions(options, PLUGIN_PARAMETERS);
  const { expressions: staticBaseTransforms, mappings } = astHelpers.replaceExpressions(
    parameters.transforms,
    PLUGIN_PARAMETERS.transforms.placeholder
  );

  // FIXME: avoid deletion or make it more clear
  delete parameters.transforms;
  // FIXME: get rid of isStatic when refactoring the build of quasis
  const isStatic = !Object.keys(mappings).length;

  // URL generation
  const url = getBaseImageUrl(PLUGIN_PARAMETERS.assetName.placeholder, staticBaseTransforms);
  const { quasis: baseQuasis, expressions: baseExpressions } = astHelpers.convertUrlIntoTemplateLiteral(
    url,
    mappings,
    PLUGIN_PARAMETERS.transforms.placeholder
  );
  // TODO: after doing the above we need to sort the quasis and expressions by ORD?? Still not clear this implementation
  const quasis = [
    ...baseQuasis,
    astHelpers.templateElement(""),
    astHelpers.templateElement(""),
    astHelpers.templateElement(""),
    astHelpers.templateElement(""),
    ...[isStatic && astHelpers.templateElement("")].filter(Boolean),
  ];
  const allPluginParameters = Object.assign({}, parameters, { assetName });
  const expressions = [
    ...baseExpressions,
    ...Object.keys(PLUGIN_PARAMETERS)
      .sort((paramA, paramB) => PLUGIN_PARAMETERS[paramA].ord > PLUGIN_PARAMETERS[paramB].ord)
      .map(param => {
        if (allPluginParameters[param]) {
          return allPluginParameters[param];
        } else if (PLUGIN_PARAMETERS[param].default && PLUGIN_PARAMETERS[param].defaultType) {
          const babelConstructor = t[PLUGIN_PARAMETERS[param].defaultType];

          return babelConstructor(PLUGIN_PARAMETERS[param].default);
        }
      })
      .filter(Boolean),
  ];

  path.replaceWith(t.expressionStatement(t.templateLiteral(quasis, expressions)));
}

/**
 * Plugin entry point.
 * @returns {undefined}
 */
module.exports = function babelPluginCloudinary() {
  return {
    visitor: {
      CallExpression(path, options) {
        const calleeName = _get(path, "node.callee.name");

        if (calleeName && calleeName === CALLEE_NAME) {
          processUrl(path, options);
        }
      },
    },
  };
};
