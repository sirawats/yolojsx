import path from "node:path";
import { fileURLToPath } from "node:url";

const THEME_DIRECTORY = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  "themes",
);

export function resolveFoundationStylesheet() {
  return path.join(THEME_DIRECTORY, "foundation.css");
}

export function createThemeRuntime(theme) {
  return {
    config: theme.antDesign,
  };
}
