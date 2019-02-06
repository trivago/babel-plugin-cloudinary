const t = require("babel-types");
const utils = require("./utils");

// TODO: make the callee name configurable via .cloudinaryrc
const CALLEE_NAME = "__buildCloudinaryUrl__";
const PLACEHOLDER = "REPLACE";

/**
 * Function that given a path that contains a call expression for
 * building a cloudinary URL performs the traverse and compiles the call expression
 * into the actual URL.
 * @param {Object} path - the path to traverse.
 * @returns {undefined}
 */
function processUrl(path) {
  const [imgUrl, options] = path.node.arguments;
  // const { transformation: transforms } = options;
  // FIXME: user order on object breaks implementation
  const [transforms] = options && options.properties;
  const { transforms: staticBaseTransforms, mappings } = utils.unfoldDynamicTransform(transforms.value, PLACEHOLDER);
  const url = utils.getImageUrl("REPLACE_ME", staticBaseTransforms).split("REPLACE_ME");
  const { quasis: baseQuasis, expressions: baseExpressions } = utils.convertUrlIntoTemplateLiteral(
    url[0],
    mappings,
    PLACEHOLDER
  );

  // TODO: read from path.node.arguments
  const prefix = "";
  const postfix = "";

  const quasis = [...baseQuasis, utils.templateElement(prefix), utils.templateElement(postfix)];
  const expressions = [...baseExpressions, imgUrl];

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
