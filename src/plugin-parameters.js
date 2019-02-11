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
// TODO: support <host> making it replaceable at runtime
// FIXME: cleanup properties that are not being used
const PLUGIN_PARAMETERS = {
  transforms: {
    key: "transforms",
    ord: 1,
    placeholder: "TRANSFORM",
    validate: () => true, // TODO: run validate methods for all parameters
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

module.exports = {
  PLUGIN_PARAMETERS,
};
