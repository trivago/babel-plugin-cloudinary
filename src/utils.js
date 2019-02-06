/**
 * @module utils
 * @description
 * This module serves as a facade to the cloudinary core
 * and exposes some generic operations that use cloudinary
 * core functionality. Also some shared static evaluation
 * functions could be shared here.
 */
const t = require("babel-types");
const cloudinary = require("cloudinary-core");

// https://cloudinary.com/documentation/solution_overview#configuration_parameters
// FIXME: this will be inside node_modules, require needs to resolve to the root of the project
const runConfig = require("../.cloudinaryrc");

if (!runConfig.native || !runConfig.native.cloud_name) {
  throw new Error("You need to provide a **native** object with the mandatory **cloud_name** field");
}

const cl = new cloudinary.Cloudinary(runConfig.native);
const BASE_URL_PLACEHOLDER = new RegExp(
  `http[s]?://res.cloudinary.com/${runConfig.native.cloud_name}/image/upload`,
  "gi"
);
const IMG_HOST = `//${runConfig.host}`;

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

// TODO: Move this to a cloudinary-proxy.js module
// along side with the constants and runTime config
/**
 * This method invokes the cloudinary core to build the asset URL.
 * @param {string} assetName - name of the asset.
 * @param {Object} transforms - plain object that contains the cloudinary transformations.
 * @returns {string} image URL for the provided assetName.
 */
function getImageUrl(assetName, transforms) {
  const url = cl.url(assetName, transforms);

  if (runConfig.overrideBaseUrl) {
    // FIXME: not working
    return url.replace(BASE_URL_PLACEHOLDER, IMG_HOST);
  }

  return url;
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
  getImageUrl,
  preval,
  templateElement,
  replaceExpressions,
};
