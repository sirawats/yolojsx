import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";

export default [
  { ignores: ["dist/**", "lib/**"] },
  js.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked.map((config) => ({
    ...config,
    files: ["**/*.{ts,tsx,mts}"],
  })),
  {
    files: ["**/*.{ts,tsx,mts}"],
    languageOptions: { parserOptions: { projectService: true } },
  },
  {
    files: [
      ".husky/**/*.ts",
      ".husky/**/*.mjs",
      "scripts/**/*.ts",
      "src/**/*.ts",
      "test/**/*.ts",
      "*.config.js",
    ],
    languageOptions: { globals: globals.node },
  },
  {
    files: ["examples/**/*.jsx", "website/**/*.tsx"],
    languageOptions: {
      globals: globals.browser,
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
  },
  {
    files: ["test/**/*.ts"],
    rules: {
      "@typescript-eslint/no-floating-promises": "off",
      "@typescript-eslint/require-await": "off",
    },
  },
];
