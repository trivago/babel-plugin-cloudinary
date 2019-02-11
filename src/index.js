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

  // URL generation
  const url = getBaseImageUrl(PLUGIN_PARAMETERS.assetName.placeholder, staticBaseTransforms);
  const { quasis: baseQuasis, expressions: baseExpressions } = astHelpers.convertUrlIntoTemplateLiteral(
    url,
    mappings,
    PLUGIN_PARAMETERS.transforms.placeholder
  );
  // TODO: after doing the above we need to sort the quasis and expressions by ORD?? Still not clear this implementation
  const allPluginParameters = Object.assign({}, parameters, { assetName });
  // TODO: move to method ??buildComplementaryExpressions (naming!!)
  const extraExpressions = Object.keys(PLUGIN_PARAMETERS)
    .sort((paramA, paramB) => PLUGIN_PARAMETERS[paramA].ord > PLUGIN_PARAMETERS[paramB].ord)
    .map(param => {
      if (allPluginParameters[param]) {
        return allPluginParameters[param];
      } else if (PLUGIN_PARAMETERS[param].default && PLUGIN_PARAMETERS[param].defaultType) {
        const babelConstructor = t[PLUGIN_PARAMETERS[param].defaultType];

        return babelConstructor(PLUGIN_PARAMETERS[param].default);
      }
    });

  const expressions = [...baseExpressions, ...extraExpressions.filter(Boolean)];
  // TODO: move to method buildPlaceholderQuasisForExpressions
  // ...${isMobile ? extMobile : extDesktop}${}`;
  // ...${isMobile ? extMobile : extDesktop}`;"
  // FIXME: Find a way to remove overhead on the empty placeholders ${}
  const quasis = [...baseQuasis, ...Object.keys(extraExpressions).map(() => astHelpers.templateElement(""))];

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
