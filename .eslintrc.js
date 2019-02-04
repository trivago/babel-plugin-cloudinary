module.exports = {
  extends: ["eslint:recommended", "plugin:jest/recommended"],
  parser: "babel-eslint",
  parserOptions: {
    ecmaVersion: 6,
  },
  plugins: ["standard", "jest"],
  env: {
    browser: false,
  },
  rules: {
    camelcase: "error",
    "keyword-spacing": "error",
    "max-len": ["error", 120, 4, {
      ignoreComments: true,
    }],
    "max-lines": ["error", {
      max: 300,
      skipComments: true,
    }],
    "newline-after-var": ["error", "always"],
    "no-nested-ternary": "error",
    "no-useless-constructor": "error",
    semi: "error",
    "require-jsdoc": "error",
    "valid-jsdoc": [
      "error",
      {
        prefer: {
          arg: "param",
          argument: "param",
          class: "constructor",
          return: "returns",
          virtual: "abstract",
        },
        preferType: {
          Boolean: "boolean",
          Number: "number",
          object: "Object",
          String: "string",
          Function: "Function",
        },
        requireReturn: true,
        requireReturnType: true,
      },
    ],
    quotes: ["error", "double"],
    "comma-dangle": ["error", "always-multiline"],
  },
};