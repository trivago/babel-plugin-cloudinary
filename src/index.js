const t = require("babel-types");
const utils = require("./utils");

// TODO: make the callee name configurable via .cloudinaryrc
const CALLEE_NAME = "__buildCloudinaryUrl";

// TODO: <host>
// FIXME: cleanup properties that are not being used
// http[s]://<host>/<transformations>/<prefix><assetName><postfix><resourceExtension>
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
  },
  prefix: {
    key: "prefix",
    ord: 2,
  },
  resourceExtension: {
    default: ".jpeg",
    defaultType: "stringLiteral",
    key: "resourceExtension",
    ord: 5,
  },
  assetName: {
    key: "assetName",
    ord: 3,
    placeholder: "ASSET_NAME",
  },
};

/**
 * Takes the options injected by the client and
 * maps the options object properties (AST nodes)
 * to their respective PLUGIN_PARAMETER.
 * @param {Object} options - options that we which to map.
 * @returns {Object.<string, Object>} an object that maps parameters
 * keys to their respective node.
 */
function mapOptions(options) {
  if ((t.isIdentifier(options) && options.name === "undefined") || t.isNullLiteral(options)) {
    return {};
  } else if (!t.isObjectExpression(options)) {
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
  const parameters = mapOptions(options);
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
  const allPluginParameters = Object.assign({}, parameters, { assetName });
  const expressions = [
    ...baseExpressions,
    ...Object.keys(PLUGIN_PARAMETERS)
      .sort((paramA, paramB) => PLUGIN_PARAMETERS[paramA].ord > PLUGIN_PARAMETERS[paramB].ord)
      .map(param => {
        if (allPluginParameters[param]) {
          return allPluginParameters[param];
        } else if (PLUGIN_PARAMETERS[param].default && PLUGIN_PARAMETERS[param].defaultType) {
          return t[PLUGIN_PARAMETERS[param].defaultType](PLUGIN_PARAMETERS[param].default);
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
        const calleeName = path && path.node && path.node.callee && path.node.callee.name;

        if (calleeName && calleeName === CALLEE_NAME) {
          processUrl(path, options);
        }
      },
    },
  };
};
