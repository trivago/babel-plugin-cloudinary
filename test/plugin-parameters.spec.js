const t = require("babel-types");
const { PLUGIN_PARAMETERS } = require("../src/plugin-parameters");

describe("plugin-parameters", () => {
  it("all parameters should contain the mandatory properties", () => {
    const mandatory = ["key", "ord"];
    const typeCheckMap = {
      key: "string",
      ord: "number",
    };

    Object.keys(PLUGIN_PARAMETERS).forEach(param => {
      mandatory.forEach(mandatoryProp => {
        if (typeof PLUGIN_PARAMETERS[param] === "object") {
          const o = PLUGIN_PARAMETERS[param];

          expect(o.hasOwnProperty(mandatoryProp)).toBe(true);
          expect(typeof o[mandatoryProp]).toEqual(typeCheckMap[mandatoryProp]);
        }
      });
    });
  });

  it("all the properties' names must match their key", () => {
    Object.keys(PLUGIN_PARAMETERS).forEach(param => {
      expect(PLUGIN_PARAMETERS[param].key).toEqual(param);
    });
  });

  it("all the properties with a default value must have a valid defaultType", () => {
    Object.keys(PLUGIN_PARAMETERS).forEach(param => {
      if (PLUGIN_PARAMETERS[param].default) {
        expect(t[PLUGIN_PARAMETERS[param].defaultType]).toBeDefined();
      }
    });
  });
});
