import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const packageJson = require("../package.json") as {
  name: string;
  version: string;
  engines: { node: string };
};

export const PACKAGE_NAME = packageJson.name;
export const PACKAGE_VERSION = packageJson.version;
export const NODE_ENGINE = packageJson.engines.node;
export const DEFAULT_BASE = "./";
export const OUTPUT_MARKER = ".yolojsx-output.json";
export const OUTPUT_MARKER_VERSION = 1;
export const SINGLE_FILE_PAYLOAD_VERSION = 2;
