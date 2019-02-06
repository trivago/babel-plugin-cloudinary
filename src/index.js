const t = require("babel-types");
const utils = require("./utils");

// TODO: make the callee name configurable via .cloudinaryrc
const CALLEE_NAME = "__buildCloudinaryUrl__";

// TODO: <host>
//"http[s]://<host>/<transformations>/<prefix>[ASSET_NAME]<postfix><resourceExtension>"
const PLUGIN_PARAMETERS = {
  // FIXME: rename transformation -> transformation[s]
  transformation: {
    KEY: "transformation",
    ORD: 1,
    PLACEHOLDER: "TRANSFORM",
    VALIDATE: () => true, // TODO: run validate methods for all expressions
  },
  postfix: {
    KEY: "postfix",
    ORD: 4,
    PLACEHOLDER: "__POSTFIX__",
  },
  prefix: {
    KEY: "prefix",
    ORD: 2,
    PLACEHOLDER: "__PREFIX__",
  },
  resourceExtension: {
    KEY: "resourceExtension",
    ORD: 5,
    PLACEHOLDER: "__RESOURCE_EXTENSION__",
  },
  assetName: {
    KEY: "assetName",
    ORD: 3,
    PLACEHOLDER: "__ASSET_NAME__",
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
    PLUGIN_PARAMETERS.transformation.PLACEHOLDER
  );

  delete parameters.transformation;

  const isStatic = !Object.keys(mappings).length;

  // URL generation
  const url = utils
    .getImageUrl(PLUGIN_PARAMETERS.assetName.PLACEHOLDER, staticBaseTransforms)
    .split(PLUGIN_PARAMETERS.assetName.PLACEHOLDER);
  const { quasis: baseQuasis, expressions: baseExpressions } = utils.convertUrlIntoTemplateLiteral(
    url[0],
    mappings,
    PLUGIN_PARAMETERS.transformation.PLACEHOLDER
  );

  // TODO: read from path.node.arguments
  const prefix = parameters.prefix || "";
  const postfix = parameters.postfix || "";
  const resourceExtension = parameters.resourceExtension || "";
  // TODO: after doing the above we need to sort the quasis and expressions by ORD?? Still not clear this implementation
  const quasis = [
    ...baseQuasis,
    utils.templateElement(""),
    utils.templateElement(""),
    utils.templateElement(""),
    utils.templateElement(""),
    ...[isStatic && utils.templateElement("")].filter(Boolean),
  ];

  const expressions = [...baseExpressions, prefix, assetName, postfix, resourceExtension];

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
