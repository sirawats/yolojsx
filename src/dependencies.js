import { createRequire } from "node:module";
import path from "node:path";

const require = createRequire(import.meta.url);

const EXACT_PACKAGE_IMPORTS = [
  "react",
  "react/jsx-runtime",
  "react/jsx-dev-runtime",
  "react-dom",
  "react-dom/client",
  "antd",
  "@ant-design/cssinjs",
  "tailwindcss",
  "react-icons",
  "prismjs",
  "prism-themes",
];

const PREFIX_PACKAGE_IMPORTS = [
  {
    name: "react-icons",
    rootDir: path.dirname(require.resolve("react-icons")),
  },
  {
    name: "prismjs",
    rootDir: path.dirname(require.resolve("prismjs")),
  },
  {
    name: "prism-themes",
    rootDir: path.dirname(require.resolve("prism-themes")),
  },
];

export function createCoreAliases() {
  const exactAliases = EXACT_PACKAGE_IMPORTS.map((specifier) => ({
    find: new RegExp(`^${specifier.replaceAll("/", "\\/")}$`),
    replacement: require.resolve(specifier),
  }));

  const prefixAliases = PREFIX_PACKAGE_IMPORTS.map(({ name, rootDir }) => ({
    find: new RegExp(`^${name.replaceAll("/", "\\/")}\\/(.*)$`),
    replacement: `${rootDir}/$1`,
  }));

  return [...exactAliases, ...prefixAliases];
}

export function resolvePackageImport(specifier) {
  return require.resolve(specifier);
}
