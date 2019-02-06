const t = require("babel-types");
const utils = require("./utils");

// TODO: make the callee name configurable via .cloudinaryrc
const CALLEE_NAME = "__buildCloudinaryUrl";

// TODO: <host>
//"http[s]://<host>/<transformations>/<prefix>[ASSET_NAME]<postfix><resourceExtension>"
// FIXME: cleanup properties that are not being used
const PLUGIN_PARAMETERS = {
  // FIXME: rename transformation -> transformation[s]
  transformation: {
    key: "transformation",
    ord: 1,
    placeholder: "TRANSFORM",
    validate: () => true, // TODO: run validate methods for all expressions
  },
  postfix: {
    key: "postfix",
    ord: 4,
    placeholder: "__POSTFIX__",
  },
  prefix: {
    key: "prefix",
    ord: 2,
    placeholder: "__PREFIX__",
  },
  resourceExtension: {
    key: "resourceExtension",
    ord: 5,
    placeholder: "__RESOURCE_EXTENSION__",
  },
  assetName: {
    key: "assetName",
    ord: 3,
    placeholder: "__ASSET_NAME__",
  },
};

/**
 * Should take all the options (PLUGIN_PARAMETERS) and return
 * all the pre-evaluated options.
 * @param {Object} options - options that we which to preval.
 * @returns {Object.<string, Object>} an object that maps parameters
 * keys to their respective node.
 */
function prevalParameters(options) {
  if (!t.isObjectExpression(options)) {
    throw new Error("options must be an object");
  }

  const properties = options.properties;

  if (!properties || !properties.length) {
    return [];
  }

  return properties.reduce((parameters, node) => {
    // FIXME: code not safe `name` retrieval
    const key = node.key.name;

    if (PLUGIN_PARAMETERS[key]) {
      parameters[key] = node.value;
    }

    return parameters;
  }, {});
}

/**
 * Function that given a path that contains a call expression for
 * building a cloudinary URL performs the traverse and compiles the call expression
 * into the actual URL.
 * @param {Object} path - the path to traverse.
 * @returns {undefined}
 */
function processUrl(path) {
  const [assetName, options] = path.node.arguments;
  // const { transformation: transforms } = options;
  const parameters = prevalParameters(options);
  // TODO: refactor call to utils.replaceExpressions into something that will support all PARAMETERS
  // FIXME: what about when parameters.transformation is not defined?
  const { expressions: staticBaseTransforms, mappings } = utils.replaceExpressions(
    parameters.transformation,
    PLUGIN_PARAMETERS.transformation.placeholder
  );

  // FIXME: avoid deletion or make it more clear
  delete parameters.transformation;
  // FIXME: get rid of isStatic when refactoring the build of quasis
  const isStatic = !Object.keys(mappings).length;

  // URL generation
  const url = utils
    .getImageUrl(PLUGIN_PARAMETERS.assetName.placeholder, staticBaseTransforms)
    .split(PLUGIN_PARAMETERS.assetName.placeholder);
  const { quasis: baseQuasis, expressions: baseExpressions } = utils.convertUrlIntoTemplateLiteral(
    url[0],
    mappings,
    PLUGIN_PARAMETERS.transformation.placeholder
  );
  // TODO: after doing the above we need to sort the quasis and expressions by ORD?? Still not clear this implementation
  const quasis = [
    ...baseQuasis,
    utils.templateElement(""),
    utils.templateElement(""),
    utils.templateElement(""),
    utils.templateElement(""),
    ...[isStatic && utils.templateElement("")].filter(Boolean),
  ];
  const allParameters = Object.assign({}, parameters, { assetName });
  const expressions = [
    ...baseExpressions,
    ...Object.keys(allParameters)
      .sort((paramA, paramB) => PLUGIN_PARAMETERS[paramA].ord > PLUGIN_PARAMETERS[paramB].ord)
      .map(key => allParameters[key]),
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
        const calleeName = path && path.node && path.node.callee && path.node.callee.name;

        if (calleeName && calleeName === CALLEE_NAME) {
          processUrl(path, options);
        }
      },
    },
  };
};
