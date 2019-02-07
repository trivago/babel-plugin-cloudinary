/**
 * @module utils
 * @description
 * This module serves as a facade to the cloudinary core
 * and exposes some generic operations that use cloudinary
 * core functionality. Also some shared static evaluation
 * functions could be shared here.
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
 * @returns {Object} an object containing the two composing blocks of a [templateLiteral](https://babeljs.io/docs/en/babel-types#templateliteral).
 * @example
 * const url = "https://res.cloudinary.com/trv/image/upload/c_fill,d_dummy.jpeg,f_auto,h_REPLACE1,q_auto:eco,w_REPLACE2/"
 * const templateLiteral = convertUrlIntoTemplateLiteral(url);
 * // templateLiteral > `https://res.cloudinary.com/trv/image/upload/c_fill,d_dummy.jpeg,f_auto,h_${width},q_auto:eco,w_${height}/`
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
 * Takes the options injected by the client and
 * maps the options object properties (AST nodes)
 * to their respective PLUGIN_PARAMETER.
 * @param {Object} options - options to map from the plugin parameters.
 * @param {Object} pluginParameters - all the parameters that are allowed
 * to be mapped.
 * @returns {Object.<string, Object>} an object that maps parameters
 * keys to their respective node.
 */
function mapOptions(options, pluginParameters) {
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
    const key = _get(node, "key.name");

    if (pluginParameters[key]) {
      parameters[key] = node.value;
    }

    return parameters;
  }, {});
}

/**
 * Partially pre-evaluates expressions.
 * Requirements:
 *   - Expressions must be static in nature (no variables).
 *   - Understands objects, arrays and literals.
 * @param {Object} node - target to pre-evaluate.
 * @returns {*} a literal that results form the node.
 * pre-evaluation. According to babel `isLiteral` implementation
 * a literal can be on of: string, number, null, boolean, RegExp, Template, BigInt.
 */
function preval(node) {
  if (t.isArrayExpression(node)) {
    return node.elements.map(preval);
  } else if (t.isObjectExpression(node)) {
    return node.properties.reduce((obj, prop) => {
      obj[prop.key.name || prop.key.value] = preval(prop.value);
      return obj;
    }, {});
  } else if (t.isLiteral(node)) {
    return node.value;
  } else {
    throw new Error(`[preval] Can't preval ${JSON.stringify(node)}`);
  }
}

/**
 * Creates a TemplateElement.
 * https://github.com/babel/babel/blob/master/packages/babel-parser/ast/spec.md#templateelement
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
 * Takes a transform object that contains dynamic properties (i.e. determined at runtime)
 * and unfolds them into returning a plain object where dynamic properties are replaced
 * by a placeholder.
 * @param {Object} node - dynamic transforms to unfold.
 * @param {string} placeholder - a placeholder that will replace variables/expressions
 * in unfolded transform.
 * @returns {Object} contains a plain object that was generated from the
 * original transform and a mappings object that keeps track of the original
 * dynamic variables/expressions mapping them to the respective placeholder.
 */
function replaceExpressions(node, placeholder) {
  if (!node) {
    return {
      expressions: {},
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
      t.isMemberExpression(node)
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

  const expressions = _replaceExpressions(node);

  return {
    expressions,
    mappings,
  };
}

module.exports = {
  convertUrlIntoTemplateLiteral,
  mapOptions,
  preval,
  replaceExpressions,
  templateElement,
};
