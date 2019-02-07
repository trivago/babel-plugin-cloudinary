/**
 * @module cloudinary-proxy
 * @description
 * This module serves as a proxy to the cloudinary core. In addition
 * it adds some extra functionality based on the runtime configuration
 * file .cloudinaryrc.json.
 */
const _has = require("lodash/has");
const cloudinary = require("cloudinary-core");
// https://cloudinary.com/documentation/solution_overview#configuration_parameters
// FIXME: this will be inside node_modules, require needs to resolve to the root of the project
const runConfig = require("../.cloudinaryrc");

if (!_has(runConfig, "native.cloud_name")) {
  throw new Error("You need to provide a **native** object with the mandatory **cloud_name** field");
}

// TODO: make the callee name configurable via .cloudinaryrc
const CALLEE_NAME = "__buildCloudinaryUrl";
const cl = new cloudinary.Cloudinary(runConfig.native);
const BASE_URL_PLACEHOLDER = new RegExp(
  `http[s]?://res.cloudinary.com/${runConfig.native.cloud_name}/image/upload`,
  "gi"
);
const IMG_HOST = `//${runConfig.host}`;

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

module.exports = {
  CALLEE_NAME,
  getImageUrl,
};
