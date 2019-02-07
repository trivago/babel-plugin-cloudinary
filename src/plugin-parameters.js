// TODO: <host>
// FIXME: cleanup properties that are not being used
// http[s]://<host>/<transforms>/<prefix><assetName><postfix><resourceExtension>
// TODO: run unit tests assertions on this PLUGIN_PARAMETERS (key and ord are mandatory, the others
// must be protected and kept untouched, defaultType must be in babel-types)
const PLUGIN_PARAMETERS = {
  transforms: {
    key: "transforms",
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

module.exports = {
  PLUGIN_PARAMETERS,
};
