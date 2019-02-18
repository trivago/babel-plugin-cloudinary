/**
 * @module utils
 * @description
 * This module shares several utility functions to manipulate
 * AST nodes.
 */
const t = require("babel-types");
const _get = require("lodash/get");

/**
 * Converts an url to a template literal that maps placeholders to variables/expressions to be resolved
 * at runtime.
 * @param {string} url - url to convert into template literal.
 * @param {Object} mappings - an object that maps placeholders on the url to the variable/expression
 * to be resolved at runtime.
 * @param {string} placeholder - the placeholder to match mappings against the url.
 * @returns {Object} an object containing the two composing blocks (quasis and literals) of a
 * [templateLiteral](https://babeljs.io/docs/en/babel-types#templateliteral).
 */
function convertUrlIntoTemplateLiteral(url, mappings, placeholder) {
  const isStatic = !Object.keys(mappings).length;

  if (isStatic) {
    return {
      quasis: [templateElement("")],
      expressions: [t.stringLiteral(url)],
    };
  }

  const rgx = new RegExp(`${placeholder}\\d*`, "gi");
  const expressions = url.match(rgx).map(prop => mappings[prop]);
  const quasis = url.split(rgx).map(templateElement);

  return {
    quasis,
    expressions,
  };
}

/**
 * This function filters out useless expressions, these include:
 * - nullLiteral
 * - undefined
 * @param {Array.<Object>} expressions - array of expressions to filter.
 * @returns {Array.<Object>} returns filtered expressions.
 */
function filterExpressions(expressions = []) {
  return expressions.filter(
    expression => expression && !t.isNullLiteral(expression) && expression.name !== "undefined"
  );
}

/**
 * Takes the options injected by the client and
 * maps the options object properties (AST nodes)
 * to their respective plugin parameter key.
 * @param {Object} options - options to map from the plugin parameters.
 * @param {Object} pluginParameters - all the parameters that are allowed
 * to be mapped.
 * @returns {Object.<string, Object>} an object that maps parameters
 * keys to their respective node.
 */
function mapOptions(options, pluginParameters) {
  const properties = options.properties;

  if (!properties || !properties.length) {
    return [];
  }

  return properties.reduce((parameters, node) => {
    const key = _get(node, "key.name");

    if (pluginParameters[key]) {
      parameters[key] = node.value;
    }

    return parameters;
  }, {});
}

/**
 * Creates a [TemplateElement]
 * (https://github.com/babel/babel/blob/master/packages/babel-parser/ast/spec.md#templateelement).
 * @param {string} str - string to fill in templateElement.
 * @returns {Object} a TemplateElement node.
 */
function templateElement(str) {
  return t.templateElement({
    cooked: str,
    raw: str,
  });
}

/**
 * Takes a node that contains dynamic properties and unfolds
 * them into a plain object where dynamic properties are replaced
 * by a placeholder.
 * @param {Object} node - dynamic node to unfold.
 * @param {string} placeholder - a placeholder that will replace variables/expressions
 * in unfolded node.
 * @returns {Object} wraps two objects:
 * - rawNode - object that contains original properties of the input node
 * but the dynamic values (expressions) are replaced by the placeholder.
 * - mappings - object that keeps track of the original
 * dynamic variables/expressions mapped by the respective placeholder.
 */
function replaceExpressions(node, placeholder) {
  if (!node) {
    return {
      rawNode: {},
      mappings: {},
    };
  }

  let count = 0;
  const mappings = {};

  const _replaceExpressions = node => {
    if (t.isArrayExpression(node)) {
      return node.elements.map(_replaceExpressions);
    } else if (t.isObjectExpression(node)) {
      return node.properties.reduce((obj, prop) => {
        obj[prop.key.name || prop.key.value] = _replaceExpressions(prop.value);
        return obj;
      }, {});
    } else if (
      t.isIdentifier(node) ||
      t.isConditionalExpression(node) ||
      t.isCallExpression(node) ||
      t.isMemberExpression(node) ||
      t.isTemplateLiteral(node)
    ) {
      const nodeKey = `${placeholder}${count || ""}`;

      mappings[nodeKey] = node;
      count++;

      return nodeKey;
    } else if (t.isLiteral(node)) {
      return node.value;
    } else {
      throw new Error(`[replaceExpressions] Can't preval ${JSON.stringify(node)}`);
    }
  };

  const rawNode = _replaceExpressions(node);

  return {
    rawNode,
    mappings,
  };
}

module.exports = {
  convertUrlIntoTemplateLiteral,
  filterExpressions,
  mapOptions,
  replaceExpressions,
  templateElement,
};
