import { createRequire } from "node:module";

const require = createRequire(import.meta.url);

const PACKAGE_IMPORTS = [
  "react",
  "react/jsx-runtime",
  "react/jsx-dev-runtime",
  "react-dom",
  "react-dom/client",
  "antd",
  "@ant-design/cssinjs",
  "tailwindcss",
];

export function createCoreAliases() {
  return PACKAGE_IMPORTS.map((specifier) => ({
    find: new RegExp(`^${specifier.replaceAll("/", "\\/")}$`),
    replacement: require.resolve(specifier),
  }));
}

export function resolvePackageImport(specifier) {
  return require.resolve(specifier);
}
