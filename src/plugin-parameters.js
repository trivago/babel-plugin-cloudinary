/**
 * @module plugin-parameters
 * @description
 * This configuration file holds all the metadata associated with the
 * parameters that are part of babel-plugin-cloudinary API. As as
 * overview below is the composition of an URL and the position where
 * each parameter is allocated:
 *
 * http[s]://host/<transforms>/<prefix><assetName><postfix><resourceExtension>
 */
const _get = require("lodash/get");
const t = require("babel-types");

const PLUGIN_PARAMETERS = {
  transforms: {
    key: "transforms",
    ord: 1,
    placeholder: "TRANSFORM",
    validate: transforms => {
      if (transforms.name === "undefined" || t.isNullLiteral(transforms)) {
        return true;
      } else if (!t.isObjectExpression(transforms)) {
        throw new Error("transforms must be an object");
      }
    },
  },
  prefix: {
    key: "prefix",
    ord: 2,
    validate: prefix => commonValidator("prefix", prefix),
  },
  assetName: {
    key: "assetName",
    ord: 3,
    placeholder: "ASSET_NAME",
    validate: assetName => {
      if (assetName.name === "undefined" || t.isNullLiteral(assetName)) {
        throw new Error("assetName is mandatory");
      }

      if (
        !(
          t.isIdentifier(assetName) ||
          t.isStringLiteral(assetName) ||
          t.isConditionalExpression(assetName) ||
          t.isCallExpression(assetName) ||
          t.isTemplateLiteral(assetName)
        )
      ) {
        throw new Error(
          "assetName must be one of:" +
            " identifier, stringLiteral, templateLiteral, conditionalExpression or callExpression"
        );
      }

      return true;
    },
  },
  postfix: {
    key: "postfix",
    ord: 4,
    validate: postfix => commonValidator("postfix", postfix),
  },
  resourceExtension: {
    default: "",
    defaultType: "stringLiteral",
    key: "resourceExtension",
    ord: 5,
    validate: resourceExtension => commonValidator("resourceExtension", resourceExtension),
  },
};

/**
 * Common type checks for AST node.
 * @param {string} name - the name of the property.
 * @param {Object} node - the node to validate.
 * @returns {undefined}
 * @throws {Error} throws an error when given node is not valid.
 */
function commonValidator(name, node) {
  if (node.name === "undefined" || t.isNullLiteral(node)) {
    return true;
  }

  if (
    !(
      t.isIdentifier(node) ||
      t.isStringLiteral(node) ||
      t.isConditionalExpression(node) ||
      t.isCallExpression(node) ||
      t.isTemplateLiteral(node)
    )
  ) {
    throw new Error(
      `${name} must be one of: identifier, stringLiteral, templateLiteral, conditionalExpression or callExpression`
    );
  }

  return true;
}

/**
 * It performs validation on the plugin parameters.
 * @param {Object} assetNameNode - asset name node to validate.
 * @param {Object} optionsNode - options node to validate.
 * @returns {undefined}
 * @throws {Error} throws an error if the properties are not
 * compliant with the plugin parameters rules. Generally the rules are:
 * - when defined the plugin options parameter must always be an objectExpression
 * - when defined each one of the options properties must pass through the
 * respective validate method.
 */
function validate(assetNameNode, optionsNode) {
  if ((t.isIdentifier(optionsNode) && optionsNode.name === "undefined") || t.isNullLiteral(optionsNode)) {
    return true;
  } else if (!t.isObjectExpression(optionsNode)) {
    throw new Error("options must be an object");
  }

  const properties = [
    ..._get(optionsNode, "properties", []),
    t.objectProperty(t.identifier(PLUGIN_PARAMETERS.assetName.key), assetNameNode),
  ];

  properties.forEach(objectPropertyNode => {
    const key = _get(objectPropertyNode, "key.name");

    PLUGIN_PARAMETERS[key] && PLUGIN_PARAMETERS[key].validate(objectPropertyNode.value);
  });

  return true;
}

module.exports = {
  PLUGIN_PARAMETERS,
  validate,
};
