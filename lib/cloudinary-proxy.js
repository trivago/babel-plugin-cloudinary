/**
 * @module cloudinary-proxy
 * @description
 * This module serves as a proxy to the cloudinary core. In addition
 * it adds some extra functionality based on the runtime configuration
 * file cloudinaryrc.json.
 */
const _has = require("lodash/has");
const cloudinary = require("cloudinary-core");

// https://cloudinary.com/documentation/solution_overview#configuration_parameters
const runConfig = require(`${process.env.INIT_CWD}/cloudinaryrc.json`);

if (!_has(runConfig, "native.cloud_name")) {
  throw new Error("You need to provide a **native** object with the mandatory **cloud_name** field");
}

const CALLEE_NAME = "__buildCloudinaryUrl";
const cl = new cloudinary.Cloudinary(runConfig.native);
const BASE_URL_PLACEHOLDER = new RegExp(`res.cloudinary.com/${runConfig.native.cloud_name}/image/upload`, "gi");

/**
 * This method invokes the cloudinary core to build the asset URL.
 * It also performs additional operations upon the URL based on
 * the client runtime configs.
 * @param {string} assetName - name of the asset.
 * @param {Object} transforms - plain object that contains the cloudinary transformations.
 * @returns {string} base image URL for the provided assetName.
 */
function getBaseImageUrl(assetName, transforms) {
  let url = cl.url(assetName, transforms);

  if (runConfig.overrideBaseUrl) {
    if (!runConfig.host) {
      throw new Error("when activating `overrideBaseUrl` a `host` must be provided");
    }

    url = url.replace(BASE_URL_PLACEHOLDER, runConfig.host);
  }

  return url.split(assetName)[0];
}

module.exports = {
  CALLEE_NAME,
  getBaseImageUrl,
};
