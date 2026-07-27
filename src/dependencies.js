import { createRequire } from "node:module";
import path from "node:path";

const require = createRequire(import.meta.url);

const ESM_PACKAGE_IMPORTS = new Map([
  ["antd", "antd/es/index.js"],
  ["@ant-design/cssinjs", "@ant-design/cssinjs/es/index.js"],
]);

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

const CDN_EXTERNAL_IMPORTS = new Set([
  "react",
  "react/jsx-runtime",
  "react-dom",
  "react-dom/client",
  "antd",
  "@ant-design/cssinjs",
]);

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
    replacement: require.resolve(
      ESM_PACKAGE_IMPORTS.get(specifier) ?? specifier,
    ),
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

function packageVersion(name) {
  return require(`${name}/package.json`).version;
}

export function createCdnImportMap() {
  const react = packageVersion("react");
  const reactDom = packageVersion("react-dom");
  const antd = packageVersion("antd");
  const cssinjs = packageVersion("@ant-design/cssinjs");
  return {
    imports: {
      react: `https://esm.sh/react@${react}`,
      "react/jsx-runtime": `https://esm.sh/react@${react}/jsx-runtime`,
      "react-dom": `https://esm.sh/react-dom@${reactDom}?bundle&external=react`,
      "react-dom/client": `https://esm.sh/react-dom@${reactDom}/client?bundle&external=react`,
      antd: `https://esm.sh/antd@${antd}?bundle&external=react,react-dom,@ant-design/cssinjs`,
      "@ant-design/cssinjs": `https://esm.sh/@ant-design/cssinjs@${cssinjs}?bundle&external=react,react-dom`,
    },
  };
}

export function isCdnExternalImport(specifier) {
  return CDN_EXTERNAL_IMPORTS.has(specifier);
}
