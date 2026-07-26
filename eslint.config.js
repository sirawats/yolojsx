import js from "@eslint/js";
import globals from "globals";

export default [
  { ignores: ["dist/**"] },
  js.configs.recommended,
  {
    files: [
      ".husky/**/*.mjs",
      "bin/**/*.js",
      "scripts/**/*.js",
      "src/**/*.js",
      "test/**/*.js",
      "*.config.js",
    ],
    languageOptions: { globals: globals.node },
  },
  {
    files: ["examples/**/*.jsx", "website/**/*.jsx"],
    languageOptions: {
      globals: globals.browser,
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
  },
];
